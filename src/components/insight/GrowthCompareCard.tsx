import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { fetchWeekInputs, getWeekRange } from '../../lib/dataFetcher';
import { calculateFiveAxis, type FiveAxisStats } from '../../utils/statsCalculator';

interface Props {
  studentId: string;
  studentGrade: number;
  currentStats: FiveAxisStats;
}

const AXIS_LABELS: Record<keyof FiveAxisStats, string> = {
  focus: '집중력',
  growthMind: '성장 마인드',
  comprehension: '이해력',
  logic: '논리력',
  energy: '에너지',
};

const COMPARE_WEEKS_AGO = 12; // 3개월 전

export default function GrowthCompareCard({ studentId, studentGrade, currentStats }: Props) {
  const [pastStats, setPastStats] = useState<FiveAxisStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const past = getWeekRange(-COMPARE_WEEKS_AGO);
    fetchWeekInputs(studentId, past.start, past.end)
      .then(inputs => {
        if (cancelled) return;
        // 데이터가 거의 없으면 baseline(60)이 떠서 의미 없는 비교가 됨
        const hasRealData =
          inputs.attendance.length + inputs.homework.length + inputs.scores.length > 0;
        if (!hasRealData) {
          setPastStats(null);
          return;
        }
        setPastStats(calculateFiveAxis(inputs, studentGrade));
      })
      .catch(() => setPastStats(null))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [studentId, studentGrade]);

  if (loading || !pastStats) return null;

  const diffs = (Object.keys(currentStats) as (keyof FiveAxisStats)[]).map(key => ({
    key,
    label: AXIS_LABELS[key],
    current: currentStats[key],
    past: pastStats[key],
    diff: currentStats[key] - pastStats[key],
  }));

  // 의미 있는 변화 (절대값 3 이상) 상위 3개
  const meaningful = diffs
    .filter(d => Math.abs(d.diff) >= 3)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3);

  if (meaningful.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <h3 className="font-semibold text-gray-800">3개월 전과 비교</h3>
      </div>
      <p className="text-xs text-gray-400 ml-10 mb-4">남이 아닌, 과거의 우리 아이와</p>

      <div className="space-y-3">
        {meaningful.map(d => {
          const isUp = d.diff > 0;
          const pct = Math.round((Math.abs(d.diff) / Math.max(d.past, 1)) * 100);
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 w-20 shrink-0">{d.label}</span>
              <div className="flex-1 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full ${
                    isUp ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(d.current, 100)}%` }}
                />
              </div>
              <span
                className={`text-sm font-semibold w-14 text-right ${
                  isUp ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {isUp ? '+' : '−'}{pct}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        12주 전 같은 주의 기록과 비교했어요
      </p>
    </div>
  );
}
