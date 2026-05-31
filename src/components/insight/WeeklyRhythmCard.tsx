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
const MAX_DOTS = WEEKS; // 한 요일당 최대 4점 (4주)

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

  // 수업이 있던 요일만 (출석 기록이 1번이라도 있는 요일)
  const activeDays = rhythm.filter(r => r.attendance > 0);
  if (activeDays.length === 0) return null;

  // 정렬: 점수 높은 요일이 위로
  const sorted = [...activeDays].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const showBestMention = sorted.length >= 2 && best.score - sorted[1].score >= 2;
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

      <div className="space-y-2.5">
        {sorted.map(r => {
          const isBest = r.day === best.day && showBestMention;
          const dotCount = Math.min(r.attendance, MAX_DOTS);
          const fillRatio = r.score / maxScore;

          return (
            <div key={r.day} className="flex items-center gap-4">
              <span
                className={`text-sm font-medium w-6 shrink-0 ${
                  isBest ? 'text-violet-600' : 'text-gray-600'
                }`}
              >
                {DAY_KOR[r.day]}
              </span>
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: MAX_DOTS }).map((_, i) => {
                  const filled = i < dotCount;
                  if (!filled) {
                    return <span key={i} className="w-3 h-3 rounded-full bg-gray-100" />;
                  }
                  return (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        isBest
                          ? 'bg-violet-500'
                          : fillRatio >= 0.8
                            ? 'bg-violet-400'
                            : fillRatio >= 0.5
                              ? 'bg-violet-300'
                              : 'bg-violet-200'
                      }`}
                    />
                  );
                })}
              </div>
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
