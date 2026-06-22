import { useEffect, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

// 변동 정보 계산: 화살표+숫자 또는 변동없음(-)
function buildDelta(current: number, prev: number | undefined | null): { text: string; dir: 'up' | 'down' | 'flat' } {
  if (prev === undefined || prev === null) return { text: '', dir: 'flat' };
  const diff = current - prev;
  if (Math.abs(diff) < 2) return { text: '-', dir: 'flat' };
  if (diff > 0) return { text: `↑${diff}`, dir: 'up' };
  return { text: `↓${Math.abs(diff)}`, dir: 'down' };
}

// 커스텀 축 라벨: 이름(1줄) + 변동(2줄). 줄바꿈으로 가로폭 절약 → 안 잘림.
function renderAxisTick(props: any) {
  const { x, y, cx, cy, payload } = props;
  const { label, delta } = payload.value as { label: string; delta: { text: string; dir: string } };

  // 라벨이 중심 기준 어느 쪽인지로 정렬 결정
  const dx = x - cx;
  const dy = y - cy;
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  if (dx > 20) anchor = 'start';
  else if (dx < -20) anchor = 'end';

  // 위/아래 위치에 따라 살짝 오프셋
  const yOffset = dy < -10 ? -4 : dy > 10 ? 14 : 4;

  const deltaColor = delta.dir === 'up' ? '#16a34a' : delta.dir === 'down' ? '#dc2626' : '#9ca3af';

  return (
    <g>
      <text
        x={x}
        y={y + yOffset}
        textAnchor={anchor}
        fill="#6b7280"
        fontSize={12}
        fontWeight={600}
      >
        {label}
      </text>
      {delta.text && (
        <text
          x={x}
          y={y + yOffset + 15}
          textAnchor={anchor}
          fill={deltaColor}
          fontSize={11}
          fontWeight={600}
        >
          {delta.text}
        </text>
      )}
    </g>
  );
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
    subject: {
      label: AXIS_LABELS[key],
      delta: buildDelta(stats[key], prevStats?.[key]),
    },
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
      <div className="w-full h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="82%"
            margin={{ top: 24, right: 36, bottom: 24, left: 36 }}
          >
            <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="subject"
              tick={renderAxisTick}
              tickLine={false}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
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