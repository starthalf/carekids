import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyStats } from '../../data/types';
import { getStatsForRadarChart } from '../../utils/statUtils';

interface PentagonChartProps {
  stats: WeeklyStats;
}

export default function PentagonChart({ stats }: PentagonChartProps) {
  // stats가 바뀔 때마다 0에서 시작해서 차오르도록
  const [animatedStats, setAnimatedStats] = useState<WeeklyStats>({
    focus: 0,
    growthMind: 0,
    comprehension: 0,
    logic: 0,
    energy: 0,
  });

  useEffect(() => {
    // 다음 프레임에 실제 값으로 업데이트 → Recharts가 자동으로 0→실제값 트윈
    const t = setTimeout(() => {
      setAnimatedStats(stats);
    }, 50);
    return () => clearTimeout(t);
  }, [stats]);

  const data = getStatsForRadarChart(animatedStats);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-start px-2 mb-2">
        <span className="text-sm font-medium text-gray-500">Learning Agility</span>
      </div>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.25}
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{
                r: 4,
                fill: '#7c3aed',
                strokeWidth: 0,
              }}
              activeDot={{
                r: 6,
                fill: '#7c3aed',
                strokeWidth: 2,
                stroke: '#fff',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}