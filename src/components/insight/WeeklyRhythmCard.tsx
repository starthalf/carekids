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

export default function WeeklyRhythmCard({ studentId, childName }: Props) {
  const [rhythm, setRhythm] = useState<DayRhythm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWeekRhythm(studentId, 4) // 최근 4주
      .then(data => {
        if (!cancelled) setRhythm(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) return null;

  const totalScore = rhythm.reduce((sum, r) => sum + r.score, 0);
  if (totalScore === 0) return null; // 데이터 전혀 없으면 숨김

  const maxScore = Math.max(...rhythm.map(r => r.score), 1);
  const sorted = [...rhythm].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // 베스트와 워스트 차이가 의미있을 때만 인사이트 멘트
  const showInsight = best.score > 0 && best.score - worst.score >= 2;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-violet-500" />
        </div>
        <h3 className="font-semibold text-gray-800">{childName}의 리듬</h3>
      </div>
      <p className="text-xs text-gray-400 ml-10 mb-4">최근 4주 요일별 컨디션</p>

      {/* 막대 그래프 */}
      <div className="flex items-end justify-between gap-2 h-28 px-2">
        {rhythm.map(r => {
          const heightPct = (r.score / maxScore) * 100;
          const isBest = r.day === best.day && r.score > 0;
          return (
            <div key={r.day} className="flex-1 flex flex-col items-center gap-1.5 h-full">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isBest
                      ? 'bg-gradient-to-t from-violet-500 to-violet-400'
                      : r.score > 0
                        ? 'bg-gradient-to-t from-violet-200 to-violet-100'
                        : 'bg-gray-100'
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isBest ? 'text-violet-600' : 'text-gray-500'}`}>
                {DAY_KOR[r.day]}
              </span>
            </div>
          );
        })}
      </div>

      {/* 인사이트 멘트 */}
      {showInsight && (
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
