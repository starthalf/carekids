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
import { AXIS_GUIDES } from '../../data/axisGuide';

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
// 라벨(한글) → 키 역매핑 (탭 시 설명 조회용)
const LABEL_TO_KEY: Record<string, keyof WeeklyStats> = {
  집중력: 'focus',
  성장마인드: 'growthMind',
  이해력: 'comprehension',
  논리력: 'logic',
  에너지: 'energy',
};

type Delta = { text: string; dir: 'up' | 'down' | 'flat' };

// 변동 정보 계산: 화살표+숫자 또는 변동없음(-)
function buildDelta(current: number, prev: number | undefined | null): Delta {
  if (prev === undefined || prev === null) return { text: '', dir: 'flat' };
  const diff = current - prev;
  if (Math.abs(diff) < 2) return { text: '-', dir: 'flat' };
  if (diff > 0) return { text: `↑${diff}`, dir: 'up' };
  return { text: `↓${Math.abs(diff)}`, dir: 'down' };
}

export default function PentagonChart({ stats, prevStats }: PentagonChartProps) {
  const [selectedAxis, setSelectedAxis] = useState<string | null>(null);
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

  // 축 이름(문자열) → 변동 정보 맵. tick 렌더러가 이름으로 조회.
  const deltaMap: Record<string, Delta> = {};
  AXIS_KEYS.forEach(key => {
    deltaMap[AXIS_LABELS[key]] = buildDelta(stats[key], prevStats?.[key]);
  });

  // subject는 반드시 문자열(축 이름)이어야 recharts가 각도 배치 가능
  const data = AXIS_KEYS.map(key => ({
    subject: AXIS_LABELS[key],
    current: animatedStats[key],
    previous: prevStats?.[key] ?? null,
    fullMark: 100,
  }));

  // 커스텀 tick: 이름(1줄) + 변동(2줄)
  const renderAxisTick = (props: any) => {
    const { x, y, cx, cy, payload } = props;
    const name: string = payload.value;
    const delta = deltaMap[name] || { text: '', dir: 'flat' };

    const dx = x - cx;
    const dy = y - cy;
    let anchor: 'start' | 'middle' | 'end' = 'middle';
    if (dx > 20) anchor = 'start';
    else if (dx < -20) anchor = 'end';

    const yOffset = dy < -10 ? -2 : dy > 10 ? 12 : 4;
    const deltaColor = delta.dir === 'up' ? '#16a34a' : delta.dir === 'down' ? '#dc2626' : '#9ca3af';
    const isSelected = selectedAxis === name;

    return (
      <g style={{ cursor: 'pointer' }} onClick={() => setSelectedAxis(isSelected ? null : name)}>
        <text
          x={x}
          y={y + yOffset}
          textAnchor={anchor}
          fill={isSelected ? '#7c3aed' : '#6b7280'}
          fontSize={12}
          fontWeight={600}
          style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' }}
        >
          {name}
        </text>
        {delta.text && (
          <text x={x} y={y + yOffset + 15} textAnchor={anchor} fill={deltaColor} fontSize={11} fontWeight={600}>
            {delta.text}
          </text>
        )}
      </g>
    );
  };

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
              dot={{ r: 4, fill: '#7c3aed', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 선택된 축 설명 또는 탭 안내 */}
      {selectedAxis && LABEL_TO_KEY[selectedAxis] ? (
        <div className="w-full mt-1 mb-1 px-4 animate-slideDown">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">{AXIS_GUIDES[LABEL_TO_KEY[selectedAxis]].emoji}</span>
              <span className="font-semibold text-primary-700 text-sm">{selectedAxis}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {AXIS_GUIDES[LABEL_TO_KEY[selectedAxis]].description}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 mt-1">
          축 이름을 탭하면 설명을 볼 수 있어요
        </p>
      )}
    </div>
  );
}