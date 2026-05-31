import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { fetchWeekRhythm, type DayRhythm } from '../../lib/dataFetcher';

interface Props {
  studentId: string;
  childName: string;
}

const DAY_KOR: Record<string, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목', fri: '금',
};

const WEEKS = 4;
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri'];

export default function WeeklyRhythmCard({ studentId, childName }: Props) {
  const [rhythm, setRhythm] = useState<DayRhythm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWeekRhythm(studentId, WEEKS)
      .then(data => {
        if (!cancelled) setRhythm(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) return null;

  // 수업이 있던 요일만 (출석 기록 있는 요일)
  const activeDays = rhythm.filter(r => r.attendance > 0);
  if (activeDays.length === 0) return null;

  // 요일 순서대로 정렬 (월→금)
  const ordered = [...activeDays].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  // best 찾기 (점수 기준)
  const sorted = [...activeDays].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const showBestMention = sorted.length >= 2 && best.score - sorted[1].score >= 2;

  // 각 요일의 컨디션 % = score / max score (max 100%)
  // 가능한 최대 점수: 출석4 + 숙제high4 + 태그매주많이 -> 그 학생이 받은 max를 기준으로 정규화
  const maxScore = Math.max(...activeDays.map(d => d.score), 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-violet-500" />
        </div>
        <h3 className="font-semibold text-gray-800">{childName}의 리듬</h3>
      </div>
      <p className="text-xs text-gray-400 ml-10 mb-4">최근 4주 수업일별 컨디션</p>

      {/* 가로 막대 + % */}
      <div className="space-y-2.5">
        {ordered.map(r => {
          const isBest = r.day === best.day && showBestMention;
          const pct = Math.round((r.score / maxScore) * 100);
          return (
            <div key={r.day} className="flex items-center gap-3">
              <span
                className={`text-sm font-medium w-6 shrink-0 ${
                  isBest ? 'text-violet-600' : 'text-gray-600'
                }`}
              >
                {DAY_KOR[r.day]}
              </span>
              <div className="flex-1 relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                    isBest ? 'bg-violet-500' : 'bg-violet-300'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`text-xs font-semibold w-10 text-right ${
                  isBest ? 'text-violet-600' : 'text-gray-500'
                }`}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {showBestMention && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-violet-600">{DAY_KOR[best.day]}요일</span>에 가장 좋은 컨디션을 보였어요.
            {' '}공부 계획을 잡을 때 참고해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
