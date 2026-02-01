import type { Child } from '../../data/types';

interface ChildAvatarProps {
  child: Child;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export default function ChildAvatar({ child, size = 'md' }: ChildAvatarProps) {
  return (
    // [수정] flex-row -> flex-col, items-center, text-center 추가
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-primary-100 ring-offset-2 flex-shrink-0`}
      >
        <img
          src={child.avatar}
          alt={child.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-semibold text-gray-800">{child.name}</span>
        <span className="text-sm text-gray-500">{child.grade}</span>
      </div>
    </div>
  );
}