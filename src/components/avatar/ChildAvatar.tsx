import React from 'react';
import { Child } from '../../data/types';

interface ChildAvatarProps {
  child: Child;
  size?: 'sm' | 'md' | 'lg';
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({ child, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
  };

  const imageSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* 아이 사진 */}
      <div className={`relative ${imageSizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm mb-2`}>
        <img
          src={child.imageUrl}
          alt={child.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 아이 정보 (이름 & 학년) */}
      <div className="text-center">
        <h3 className="font-bold text-gray-900 leading-tight">{child.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {child.grade} {child.class && `• ${child.class}`}
        </p>
      </div>
    </div>
  );
};

export default ChildAvatar;