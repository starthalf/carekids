import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyStats } from '../../data/types';

interface PentagonChartProps {
  stats: WeeklyStats;
  prevStats?: WeeklyStats | null;
}

const AXIS_KEYS: (keyof WeeklyStats)[] = ['focus', 'growthMind', 'comprehension', 'logic', 'energy'];
const AXIS_LABELS: Record<keyof WeeklyStats, string> = {
  focus: '집중력',
  growthMind: '성장마인드',
  comprehension: '이해력',
  logic: '논리력',
  energy: '에너지',
};

// 축 라벨에 변동 화살표(↑3) 붙임. 변동이 작으면 (±2) 표시 생략.
function buildLabel(key: keyof WeeklyStats, current: number, prev: number | undefined): string {
  if (prev === undefined || prev === null) return AXIS_LABELS[key];
  const diff = current - prev;
  if (Math.abs(diff) < 2) return AXIS_LABELS[key];
  const arrow = diff > 0 ? '↑' : '↓';
  return `${AXIS_LABELS[key]} ${arrow}${Math.abs(diff)}`;
}

export default function PentagonChart({ stats, prevStats }: PentagonChartProps) {
  const [animatedStats, setAnimatedStats] = useState<WeeklyStats>({
    focus: 0,
    growthMind: 0,
    comprehension: 0,
    logic: 0,
    energy: 0,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setAnimatedStats(stats);
    }, 50);
    return () => clearTimeout(t);
  }, [stats]);

  const data = AXIS_KEYS.map(key => ({
    subject: buildLabel(key, stats[key], prevStats?.[key]),
    current: animatedStats[key],
    previous: prevStats?.[key] ?? null,
    fullMark: 100,
  }));

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <span className="text-sm font-medium text-gray-500">Learning Agility</span>
        {prevStats && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-primary-500" /> 이번 주
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-0.5"
                style={{
                  background: 'repeating-linear-gradient(90deg, #9ca3af 0, #9ca3af 2px, transparent 2px, transparent 4px)',
                }}
              />
              지난 주
            </span>
          </div>
        )}
      </div>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />
            {prevStats && (
              <Radar
                name="Previous"
                dataKey="previous"
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                fill="none"
                isAnimationActive={false}
              />
            )}
            <Radar
              name="Current"
              dataKey="current"
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