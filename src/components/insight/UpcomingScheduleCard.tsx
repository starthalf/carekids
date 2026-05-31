import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { fetchUpcomingClasses, type UpcomingClass } from '../../lib/dataFetcher';

interface Props {
  studentId: string;
}

const DAY_KOR: Record<string, string> = {
  sun: '일', mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토',
};

function formatRelativeDate(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff < 7) return `${diff}일 후`;
  return `${target.getMonth() + 1}/${target.getDate()}`;
}

export default function UpcomingScheduleCard({ studentId }: Props) {
  const [classes, setClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUpcomingClasses(studentId)
      .then(data => {
        if (!cancelled) setClasses(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) return null;
  if (classes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <h3 className="font-semibold text-gray-800">다가오는 수업</h3>
      </div>

      <ul className="divide-y divide-gray-100">
        {classes.map((c, i) => (
          <li key={`${c.classId}-${c.day}-${i}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-col items-center justify-center w-12 shrink-0">
              <span className="text-xs text-gray-400">{DAY_KOR[c.day] || ''}</span>
              <span className="text-sm font-semibold text-gray-700">
                {formatRelativeDate(c.date)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{c.className}</p>
              {c.subjectName && (
                <p className="text-xs text-gray-500">{c.subjectName}</p>
              )}
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {c.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
