import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useChildData } from '../contexts/ChildDataContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeekInputs, getWeekRange } from '../lib/dataFetcher';
import { calculateFiveAxis, generateHashtags } from '../utils/statsCalculator';
import { formatDateRange } from '../utils/dateUtils';
import { calculateAverageStats } from '../utils/statUtils';

interface HistoryItem {
  weekOffset: number;
  startDate: string;
  endDate: string;
  avgScore: number;
  hashtags: string[];
}

const WEEKS_TO_SHOW = 8;

export default function HistoryPage() {
  const { goToPreviousWeek, currentWeekIndex } = useChildData();
  const { currentAcademy } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentAcademy) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const results: HistoryItem[] = [];
        for (let i = 0; i < WEEKS_TO_SHOW; i++) {
          const offset = -i;
          const { start, end } = getWeekRange(offset);
          const inputs = await fetchWeekInputs(currentAcademy.studentId, start, end);
          const stats = calculateFiveAxis(inputs, currentAcademy.studentGrade);
          const hashtags = generateHashtags(stats, inputs);
          const avgScore = calculateAverageStats(stats);
          results.push({
            weekOffset: offset,
            startDate: start,
            endDate: end,
            avgScore,
            hashtags,
          });
          if (cancelled) return;
        }
        if (!cancelled) setItems(results);
      } catch (err) {
        console.error('[History] load error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [currentAcademy]);

  const getTrendIcon = (current: number, previous: number | null) => {
    if (previous === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const weekLabel = (offset: number) => {
    if (offset === 0) return '이번 주';
    if (offset === -1) return '지난 주';
    return `${-offset}주 전`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="py-3">
        <h1 className="text-xl font-bold text-gray-800">학습 기록</h1>
        <p className="text-sm text-gray-500 mt-1">주간 리포트 히스토리</p>
      </header>

      {isLoading && (
        <div className="text-center py-12 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-400">데이터 분석 중...</p>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">아직 기록된 리포트가 없습니다</p>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            const prevAvg = items[index + 1]?.avgScore ?? null;
            return (
              <div
                key={item.weekOffset}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{weekLabel(item.weekOffset)}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateRange(item.startDate, item.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.avgScore, prevAvg)}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">{item.avgScore}점</p>
                      <p className="text-xs text-gray-500">평균</p>
                    </div>
                  </div>
                </div>

                {item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.hashtags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}