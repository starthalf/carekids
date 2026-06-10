import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWeekRange } from '../lib/dataFetcher';
import { supabase } from '../lib/supabase';
import { formatDateRange } from '../utils/dateUtils';
import { calculateAverageStats } from '../utils/statUtils';
import type { FiveAxisStats } from '../utils/statsCalculator';

interface HistoryItem {
  weekOffset: number;
  startDate: string;
  endDate: string;
  hasReport: boolean;          // 이번 주에 weekly_insights가 있는지
  avgScore: number;            // hasReport=false면 0
  hashtags: string[];          // hasReport=false면 []
}

// HomePage와 동일: W-1부터 시작. W=0(진행 중)은 제외.
const WEEKS_TO_SHOW = 8;
const START_OFFSET = -1;

export default function HistoryPage() {
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
        // 보여줄 주차들의 [start, end] 범위 계산
        const weekRanges = Array.from({ length: WEEKS_TO_SHOW }, (_, i) => {
          const offset = START_OFFSET - i;
          const { start, end } = getWeekRange(offset);
          return { offset, start, end };
        });

        const earliestStart = weekRanges[weekRanges.length - 1].start;
        const latestStart = weekRanges[0].start;

        // weekly_insights를 한 번에 조회 (최대 8개 row)
        const { data: cached, error } = await supabase
          .from('weekly_insights')
          .select('week_start, week_end, stats, hashtags')
          .eq('student_id', currentAcademy.studentId)
          .gte('week_start', earliestStart)
          .lte('week_start', latestStart);

        if (cancelled) return;
        if (error) {
          console.error('[History] cache query error:', error);
        }

        // week_start로 인덱싱
        const byStart = new Map<string, { stats: FiveAxisStats; hashtags: string[] }>();
        (cached || []).forEach((row: any) => {
          byStart.set(row.week_start, {
            stats: row.stats || {},
            hashtags: row.hashtags || [],
          });
        });

        // 주차별 결과 구성
        const results: HistoryItem[] = weekRanges.map(({ offset, start, end }) => {
          const hit = byStart.get(start);
          if (hit && hit.stats) {
            return {
              weekOffset: offset,
              startDate: start,
              endDate: end,
              hasReport: true,
              avgScore: calculateAverageStats(hit.stats),
              hashtags: hit.hashtags,
            };
          }
          return {
            weekOffset: offset,
            startDate: start,
            endDate: end,
            hasReport: false,
            avgScore: 0,
            hashtags: [],
          };
        });

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

  // 이전 주(인덱스가 더 큰 = 더 과거) 중 리포트 있는 주의 점수를 trend 비교용으로 찾음
  const findPrevReportedScore = (currentIdx: number): number | null => {
    for (let i = currentIdx + 1; i < items.length; i++) {
      if (items[i].hasReport) return items[i].avgScore;
    }
    return null;
  };

  const getTrendIcon = (current: number, previous: number | null) => {
    if (previous === null) return <Minus className="w-4 h-4 text-gray-400" />;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const weekLabel = (offset: number) => {
    if (offset === -1) return '지난 주';
    return `${-offset}주 전`;
  };

  const reportedCount = items.filter(i => i.hasReport).length;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="py-3">
        <h1 className="text-xl font-bold text-gray-800">학습 기록</h1>
        <p className="text-sm text-gray-500 mt-1">주간 리포트 히스토리</p>
      </header>

      {isLoading && (
        <div className="text-center py-12 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      )}

      {!isLoading && reportedCount === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">아직 생성된 리포트가 없어요</p>
          <p className="text-xs text-gray-400 mt-1">
            매주 월요일 새벽에 지난 한 주 리포트가 만들어집니다
          </p>
        </div>
      )}

      {!isLoading && reportedCount > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            if (!item.hasReport) {
              // 리포트가 아직 없는 주차 — 비활성 카드
              return (
                <div
                  key={item.weekOffset}
                  className="bg-white/50 rounded-2xl p-4 border border-gray-100 border-dashed animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-400 text-sm">{weekLabel(item.weekOffset)}</p>
                        <p className="text-xs text-gray-400">
                          {formatDateRange(item.startDate, item.endDate)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">리포트 없음</p>
                  </div>
                </div>
              );
            }

            const prevAvg = findPrevReportedScore(index);
            return (
              <div
                key={item.weekOffset}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary-600" />
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