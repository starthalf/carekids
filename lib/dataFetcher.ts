import { supabase } from '../lib/supabase';
import type { WeekInputs } from '../utils/statsCalculator';

// 로컬 타임 기준 YYYY-MM-DD (toISOString은 UTC 변환 버그 있음)
function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

  let label = '';
  if (weekOffset === 0) label = '이번 주';
  else if (weekOffset === -1) label = '지난 주';
  else if (weekOffset === 1) label = '다음 주';
  else if (weekOffset < 0) label = `${-weekOffset}주 전`;
  else label = `${weekOffset}주 후`;

  return { start: fmtLocal(monday), end: fmtLocal(sunday), label };
}

export function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getMonth() + 1}월 ${s.getDate()}일 - ${e.getMonth() + 1}월 ${e.getDate()}일`;
}

export async function fetchWeekInputs(
  studentId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeekInputs> {
  const [attRes, hwRes, fbRes, moodRes, scoreRes] = await Promise.all([
    supabase.from('attendance').select('date, status').eq('student_id', studentId).gte('date', weekStart).lte('date', weekEnd),
    supabase.from('homework').select('date, completed, quality').eq('student_id', studentId).gte('date', weekStart).lte('date', weekEnd),
    supabase.from('teacher_feedback').select('date, mood, focus, social').eq('student_id', studentId).gte('date', weekStart).lte('date', weekEnd),
    supabase.from('class_mood_feedback').select('date, mood').gte('date', weekStart).lte('date', weekEnd),
    supabase.from('scores').select('date, subject_name, score, max_score, test_type').eq('student_id', studentId).gte('date', weekStart).lte('date', weekEnd),
  ]);

  return {
    attendance: (attRes.data || []).map((a: any) => ({ date: a.date, status: a.status })),
    homework: (hwRes.data || []).map((h: any) => ({ date: h.date, completed: h.completed, quality: h.quality })),
    feedback: (fbRes.data || []).map((f: any) => ({ date: f.date, mood: f.mood, focus: f.focus, social: f.social })),
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
// 요일별 리듬 - 최근 N주
// ============================================================
export interface DayRhythm {
  day: string;
  score: number;
  attendance: number;
  highHomework: number;
  positiveTags: number;
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

  const start = new Date(thisMon);
  start.setDate(thisMon.getDate() - 7 * (weeksBack - 1));

  const end = new Date(thisMon);
  end.setDate(thisMon.getDate() + 6);

  const startStr = fmtLocal(start);
  const endStr = fmtLocal(end);

  const [attRes, hwRes, tagRes] = await Promise.all([
    supabase.from('attendance').select('date, status').eq('student_id', studentId).gte('date', startStr).lte('date', endStr),
    supabase.from('homework').select('date, completed, quality').eq('student_id', studentId).gte('date', startStr).lte('date', endStr),
    supabase.from('student_tags').select('date, tag').eq('student_id', studentId).gte('date', startStr).lte('date', endStr),
  ]);

  const rhythm: Record<string, DayRhythm> = {};
  DAY_KEYS.forEach(d => {
    rhythm[d] = { day: d, score: 0, attendance: 0, highHomework: 0, positiveTags: 0 };
  });

  const getDayKey = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return DAY_KEYS[d.getDay()];
  };

  (attRes.data || []).forEach((r: any) => {
    const k = getDayKey(r.date);
    if (r.status === 'present') {
      rhythm[k].attendance += 1;
      rhythm[k].score += 1;
    }
  });

  (hwRes.data || []).forEach((r: any) => {
    if (r.completed && r.quality === 'high') {
      const k = getDayKey(r.date);
      rhythm[k].highHomework += 1;
      rhythm[k].score += 1;
    }
  });

  (tagRes.data || []).forEach((r: any) => {
    const k = getDayKey(r.date);
    rhythm[k].positiveTags += 1;
    rhythm[k].score += 2;
  });

  return ['mon', 'tue', 'wed', 'thu', 'fri'].map(d => rhythm[d]);
}