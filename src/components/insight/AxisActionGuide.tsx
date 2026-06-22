import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WeeklyStats } from '../../data/types';
import { AXIS_GUIDES, AXIS_ORDER, dirFromDiff, type ChangeDir } from '../../data/axisGuide';

interface AxisActionGuideProps {
  stats: WeeklyStats;
  prevStats?: WeeklyStats | null;
}

const dirMeta: Record<ChangeDir, { tag: string; color: string; bg: string }> = {
  down: { tag: '관심이 필요해요', color: '#dc2626', bg: '#fef2f2' },
  up: { tag: '잘하고 있어요', color: '#16a34a', bg: '#f0fdf4' },
  flat: { tag: '안정적이에요', color: '#6b7280', bg: '#f9fafb' },
};

export default function AxisActionGuide({ stats, prevStats }: AxisActionGuideProps) {
  // 변동 큰 축이 위로 오도록 정렬 (하락 우선 → 상승 → 유지)
  const rows = AXIS_ORDER.map(key => {
    const cur = stats[key];
    const prev = prevStats?.[key];
    const diff = prev === undefined || prev === null ? 0 : cur - prev;
    const dir = prevStats ? dirFromDiff(diff) : 'flat';
    return { key, guide: AXIS_GUIDES[key], diff, dir };
  });

  const priority: Record<ChangeDir, number> = { down: 0, up: 1, flat: 2 };
  rows.sort((a, b) => {
    if (priority[a.dir] !== priority[b.dir]) return priority[a.dir] - priority[b.dir];
    return Math.abs(b.diff) - Math.abs(a.diff);
  });

  // 기본으로 첫 번째(가장 관심 필요한) 항목만 펼침
  const [openKey, setOpenKey] = useState<string | null>(rows[0]?.key ?? null);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <h3 className="font-semibold text-gray-800 mb-1">이렇게 도와주세요</h3>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        이번 주 변화에 맞춰 집에서 해볼 수 있는 것들이에요.<br />
        정답은 아니니, 우리 아이에게 맞는 걸 골라보세요.
      </p>

      <div className="flex flex-col gap-2">
        {rows.map(({ key, guide, diff, dir }) => {
          const meta = dirMeta[dir];
          const isOpen = openKey === key;
          const arrow = dir === 'up' ? `↑${Math.abs(diff)}` : dir === 'down' ? `↓${Math.abs(diff)}` : '–';
          const suggestions = guide.suggestions[dir];

          return (
            <div key={key} className="rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{guide.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{guide.label}</span>
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      {arrow}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{guide.summary[dir]}</p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 animate-slideDown">
                  <div className="mb-3 pl-1"> 
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: meta.color }}
                    >
                      {meta.tag}
                    </span>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: meta.color }}
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}