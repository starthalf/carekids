import { useState, useEffect } from 'react';
import type { Child } from '../../data/types';
import { getStudentPhotoUrl } from '../../lib/studentPhoto';

interface ChildAvatarProps {
  child: Child;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

function dicebear(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

export default function ChildAvatar({ child, size = 'md' }: ChildAvatarProps) {
  const fallback = dicebear(child.id || child.name || 'child');
  const [src, setSrc] = useState<string>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!child.avatar) {
        setSrc(fallback);
        return;
      }
      const url = await getStudentPhotoUrl(child.avatar);
      if (!cancelled) setSrc(url || fallback);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.avatar, child.id]);

  return (
    <div className="flex flex-row items-center gap-4">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-primary-100 ring-offset-2 flex-shrink-0`}
      >
        <img
          src={src}
          alt={child.name}
          className="w-full h-full object-cover"
          onError={() => { if (src !== fallback) setSrc(fallback); }}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-gray-800 leading-tight">{child.name}</span>
        <span className="text-sm text-gray-500">{child.grade}</span>
      </div>
    </div>
  );
}