// src/components/avatar/StudentPhoto.tsx
// 학생 사진을 안전하게 표시.
// - avatar가 http URL이면 그대로
// - storage 경로면 서명 URL 발급
// - 무엇이든 로드 실패하면 dicebear로 폴백 (깨진 이미지 방지)

import { useState, useEffect } from 'react';
import { getStudentPhotoUrl } from '../../lib/studentPhoto';

interface Props {
  avatar?: string | null;        // students.avatar (경로 또는 URL)
  seed: string;                  // 폴백 dicebear용 (보통 studentId)
  alt?: string;
  className?: string;
}

function dicebear(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

export default function StudentPhoto({ avatar, seed, alt = '', className = '' }: Props) {
  const [src, setSrc] = useState<string>(dicebear(seed));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!avatar) {
        setSrc(dicebear(seed));
        return;
      }
      const url = await getStudentPhotoUrl(avatar);
      if (!cancelled) setSrc(url || dicebear(seed));
    })();
    return () => { cancelled = true; };
  }, [avatar, seed]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        // 로드 실패(403/404/깨진 경로 등) → dicebear로 교체
        const fb = dicebear(seed);
        if (src !== fb) setSrc(fb);
      }}
    />
  );
}