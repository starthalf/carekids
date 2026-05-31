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
// 추가: 학생 태그 기록 (이번 주 빛난 순간용)
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
// 추가: 학생의 다가오는 수업 일정 (앞으로 7일)
// schedule_slots 구조: [{ day: 'mon', time: '14:00' }, ...]
// ============================================================
export interface UpcomingClass {
  classId: string;
  className: string;
  subjectName?: string;
  day: string;       // mon, tue, ...
  time: string;      // "14:00"
  date: string;      // YYYY-MM-DD
}

export async function fetchUpcomingClasses(studentId: string): Promise<UpcomingClass[]> {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        id,
        name,
        schedule_slots,
        subjects ( name )
      )
    `)
    .eq('student_id', studentId);

  if (error) {
    console.error('[fetchUpcomingClasses]', error);
    return [];
  }
  if (!data) return [];

  const dayMap: Record<string, number> = {
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDow = today.getDay();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const list: UpcomingClass[] = [];
  data.forEach((row: any) => {
    const cls = row.classes;
    if (!cls) return;
    const slots = cls.schedule_slots || [];
    slots.forEach((slot: any) => {
      const targetDow = dayMap[slot.day];
      if (targetDow === undefined) return;

      // 오늘 같은 요일이면 시간 확인해서 이미 지났으면 다음 주로
      let daysAhead = (targetDow - todayDow + 7) % 7;
      if (daysAhead === 0) {
        const [hh, mm] = (slot.time || '00:00').split(':').map(Number);
        const slotMinutes = (hh || 0) * 60 + (mm || 0);
        if (slotMinutes <= nowMinutes) daysAhead = 7;
      }

      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysAhead);

      list.push({
        classId: cls.id,
        className: cls.name,
        subjectName: cls.subjects?.name,
        day: slot.day,
        time: slot.time || '',
        date: nextDate.toISOString().split('T')[0],
      });
    });
  });

  // 날짜+시간 순 정렬, 상위 4개
  return list
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    })
    .slice(0, 4);
}
