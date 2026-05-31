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

  // 전체 평일 (월~금) 데이터 - 수업 없는 요일도 포함
  const allDays = DAY_ORDER.map(
    day => rhythm.find(r => r.day === day) || { day, score: 0, attendance: 0, highHomework: 0, positiveTags: 0 }
  );

  // 수업 있던 요일만 (best 판단용)
  const activeDays = allDays.filter(d => d.attendance > 0);
  if (activeDays.length === 0) return null;

  const sorted = [...activeDays].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const showBestMention = sorted.length >= 2 && best.score - sorted[1].score >= 2;
  const maxScore = Math.max(...activeDays.map(d => d.score), 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      {/* 헤더 + 기간 뱃지 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-violet-500" />
          </div>
          <h3 className="font-semibold text-gray-800">{childName}의 리듬</h3>
        </div>
        <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
          최근 4주 평균
        </span>
      </div>
      <p className="text-xs text-gray-400 ml-10 mb-5">요일별 컨디션 패턴</p>

      {/* 가로 막대 (월~금) */}
      <div className="flex items-end justify-between gap-2 px-1">
        {allDays.map(r => {
          const hasClass = r.attendance > 0;
          const isBest = hasClass && r.day === best.day && showBestMention;
          const pct = hasClass ? Math.round((r.score / maxScore) * 100) : 0;
          const barHeightPx = hasClass ? Math.max((pct / 100) * 80, 8) : 0;

          return (
            <div key={r.day} className="flex-1 flex flex-col items-center gap-1.5">
              {/* 퍼센트 */}
              <span
                className={`text-[10px] font-semibold h-4 ${
                  !hasClass
                    ? 'text-gray-300'
                    : isBest
                      ? 'text-violet-600'
                      : 'text-gray-500'
                }`}
              >
                {hasClass ? `${pct}%` : '-'}
              </span>

              {/* 막대 영역 (고정 높이 80px) */}
              <div className="w-full h-20 flex items-end justify-center">
                {hasClass ? (
                  <div
                    className={`w-full rounded-md transition-all ${
                      isBest
                        ? 'bg-gradient-to-t from-violet-500 to-violet-400'
                        : 'bg-gradient-to-t from-violet-300 to-violet-200'
                    }`}
                    style={{ height: `${barHeightPx}px` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-gray-200" />
                  </div>
                )}
              </div>

              {/* 요일 라벨 */}
              <span
                className={`text-xs font-medium ${
                  !hasClass
                    ? 'text-gray-300'
                    : isBest
                      ? 'text-violet-600'
                      : 'text-gray-600'
                }`}
              >
                {DAY_KOR[r.day]}
              </span>

              {/* 수업 없음 표기 */}
              {!hasClass && (
                <span className="text-[9px] text-gray-300 leading-none">수업없음</span>
              )}
            </div>
          );
        })}
      </div>

      {showBestMention && (
        <div className="mt-5 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-violet-600">{DAY_KOR[best.day]}요일</span>에 가장 좋은 컨디션을 보였어요.
            {' '}공부 계획을 잡을 때 참고해보세요.
          </p>
        </div>
      )}
    </div>
  );
}