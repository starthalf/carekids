import type { GrowthTrend } from '../../data/types';
import TrendPill from './TrendPill';

interface TrendCardProps {
  trends: GrowthTrend[];
}

export default function TrendCard({ trends }: TrendCardProps) {
  const upTrends = trends.filter((t) => t.trend === 'up');
  const downTrends = trends.filter((t) => t.trend === 'down');

  return (
    <div className="flex flex-col gap-3">
      {upTrends.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">상승:</span>
          {upTrends.map((trend) => (
            <div
              key={trend.subject}
              className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-2.5 py-1"
            >
              <span className="text-sm font-medium text-emerald-700">
                {trend.subject}
              </span>
              <TrendPill trend={trend.trend} changePercent={trend.changePercent} />
            </div>
          ))}
        </div>
      )}
      {downTrends.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">하락:</span>
          {downTrends.map((trend) => (
            <div
              key={trend.subject}
              className="flex items-center gap-1.5 bg-red-50 rounded-lg px-2.5 py-1"
            >
              <span className="text-sm font-medium text-red-600">
                {trend.subject}
              </span>
              <TrendPill trend={trend.trend} changePercent={trend.changePercent} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
