import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchStudentTags, type WeekTag } from '../../lib/dataFetcher';
import { getTagInfo } from '../../lib/studentTags';

interface Props {
  studentId: string;
  weekStart: string;
  weekEnd: string;
}

function formatMd(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function WeeklyHighlightsCard({ studentId, weekStart, weekEnd }: Props) {
  const [tags, setTags] = useState<WeekTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!studentId || studentId === '0') return;  // ← 추가
    let cancelled = false;
    setLoading(true);
    fetchStudentTags(studentId, weekStart, weekEnd)
      .then(data => {
        if (!cancelled) setTags(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId, weekStart, weekEnd]);

  if (loading) return null;
  if (tags.length === 0) return null;

  const display = tags.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="font-semibold text-gray-800">이번 주 빛난 순간</h3>
      </div>

      <ul className="space-y-2.5">
        {display.map((t, i) => {
          const info = getTagInfo(t.tag);
          return (
            <li key={`${t.date}-${t.tag}-${i}`} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{info.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">{info.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatMd(t.date)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {tags.length > display.length && (
        <p className="text-xs text-gray-400 text-center mt-3">
          외 {tags.length - display.length}개의 칭찬 받음
        </p>
      )}
    </div>
  );
}
