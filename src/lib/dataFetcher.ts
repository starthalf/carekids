import { supabase } from '../lib/supabase';
import type { WeekInputs } from '../utils/statsCalculator';

// ISO 주차 → 시작/끝 날짜
export function getWeekRange(weekOffset: number = 0): { start: string; end: string; label: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  let label = '';
  if (weekOffset === 0) label = '이번 주';
  else if (weekOffset === -1) label = '지난 주';
  else if (weekOffset === 1) label = '다음 주';
  else if (weekOffset < 0) label = `${-weekOffset}주 전`;
  else label = `${weekOffset}주 후`;

  return { start: fmt(monday), end: fmt(sunday), label };
}

// 주차 표시용
export function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getMonth() + 1}월 ${s.getDate()}일 - ${e.getMonth() + 1}월 ${e.getDate()}일`;
}

// 특정 학생의 한 주 데이터 가져오기
export async function fetchWeekInputs(
  studentId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeekInputs> {
  const [attRes, hwRes, fbRes, moodRes, scoreRes] = await Promise.all([
    supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase
      .from('homework')
      .select('date, completed, quality')
      .eq('student_id', studentId)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase
      .from('teacher_feedback')
      .select('date, mood, focus, social')
      .eq('student_id', studentId)
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase
      .from('class_mood_feedback')
      .select('date, mood')
      .gte('date', weekStart)
      .lte('date', weekEnd),
    supabase
      .from('scores')
      .select('date, subject_name, score, max_score, test_type')
      .eq('student_id', studentId)
      .gte('date', weekStart)
      .lte('date', weekEnd),
  ]);

  return {
    attendance: (attRes.data || []).map((a: any) => ({ date: a.date, status: a.status })),
    homework: (hwRes.data || []).map((h: any) => ({
      date: h.date,
      completed: h.completed,
      quality: h.quality,
    })),
    feedback: (fbRes.data || []).map((f: any) => ({
      date: f.date,
      mood: f.mood,
      focus: f.focus,
      social: f.social,
    })),
    classMood: (moodRes.data || []).map((m: any) => ({ date: m.date, mood: m.mood })),
    scores: (scoreRes.data || []).map((s: any) => ({
      date: s.date,
      subject: s.subject_name,
      score: s.score,
      maxScore: s.max_score,
      testType: s.test_type,
    })),
  };
}

// ============================================================
// 학생 태그 기록 (이번 주 빛난 순간용)
// ============================================================
export interface WeekTag {
  date: string;
  tag: string;
}

export async function fetchStudentTags(
  studentId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeekTag[]> {
  const { data, error } = await supabase
    .from('student_tags')
    .select('date, tag')
    .eq('student_id', studentId)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: false });

  if (error) {
    console.error('[fetchStudentTags]', error);
    return [];
  }
  return (data || []) as WeekTag[];
}

// ============================================================
// 요일별 리듬 - 최근 N주치 데이터로 요일별 컨디션 산출
// 출석(+1) + 숙제 high(+1) + 긍정 태그(×2) 로 점수화
// ============================================================
export interface DayRhythm {
  day: string;          // mon, tue, ...
  score: number;        // 누적 점수
  attendance: number;   // 출석 횟수 (참고용)
  highHomework: number; // 숙제 high 횟수
  positiveTags: number; // 긍정 태그 횟수
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export async function fetchWeekRhythm(
  studentId: string,
  weeksBack: number = 4
): Promise<DayRhythm[]> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMon = new Date(today);
  thisMon.setDate(today.getDate() + daysToMonday);
  thisMon.setHours(0, 0, 0, 0);

  // N주 전 월요일
  const start = new Date(thisMon);
  start.setDate(thisMon.getDate() - 7 * (weeksBack - 1));

  // 이번 주 일요일 (오늘 포함)
  const end = new Date(thisMon);
  end.setDate(thisMon.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const startStr = fmt(start);
  const endStr = fmt(end);

  const [attRes, hwRes, tagRes] = await Promise.all([
    supabase
      .from('attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .gte('date', startStr)
      .lte('date', endStr),
    supabase
      .from('homework')
      .select('date, completed, quality')
      .eq('student_id', studentId)
      .gte('date', startStr)
      .lte('date', endStr),
    supabase
      .from('student_tags')
      .select('date, tag')
      .eq('student_id', studentId)
      .gte('date', startStr)
      .lte('date', endStr),
  ]);

  // 요일별 초기화 (mon~fri만 의미 있음, sat/sun은 보통 0)
  const rhythm: Record<string, DayRhythm> = {};
  DAY_KEYS.forEach(d => {
    rhythm[d] = { day: d, score: 0, attendance: 0, highHomework: 0, positiveTags: 0 };
  });

  const getDayKey = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return DAY_KEYS[d.getDay()];
  };

  // 출석 +1
  (attRes.data || []).forEach((r: any) => {
    const k = getDayKey(r.date);
    if (r.status === 'present') {
      rhythm[k].attendance += 1;
      rhythm[k].score += 1;
    }
  });

  // 숙제 high +1
  (hwRes.data || []).forEach((r: any) => {
    if (r.completed && r.quality === 'high') {
      const k = getDayKey(r.date);
      rhythm[k].highHomework += 1;
      rhythm[k].score += 1;
    }
  });

  // 긍정 태그 ×2 (태그는 다 긍정이므로 그대로)
  (tagRes.data || []).forEach((r: any) => {
    const k = getDayKey(r.date);
    rhythm[k].positiveTags += 1;
    rhythm[k].score += 2;
  });

  // 평일만 반환 (월~금)
  return ['mon', 'tue', 'wed', 'thu', 'fri'].map(d => rhythm[d]);
}
