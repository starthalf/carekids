// src/lib/studentPhoto.ts
// 부모용: 학생 사진 표시용 서명 URL 발급 (private 버킷, 읽기 전용)

import { supabase } from './supabase';

const BUCKET = 'student-photos';
const SIGNED_URL_TTL = 60 * 60; // 1시간

// avatar 값이 storage 경로면 서명 URL, http(s)면 그대로.
export async function getStudentPhotoUrl(avatar: string | null | undefined): Promise<string | null> {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(avatar, SIGNED_URL_TTL);
  if (error) return null;
  return data?.signedUrl ?? null;
}

// 여러 개 한 번에
export async function getStudentPhotoUrls(
  avatars: (string | null | undefined)[]
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(avatars.length).fill(null);
  const toSign: { idx: number; path: string }[] = [];

  avatars.forEach((a, i) => {
    if (!a) return;
    if (a.startsWith('http://') || a.startsWith('https://')) {
      results[i] = a;
    } else {
      toSign.push({ idx: i, path: a });
    }
  });

  if (toSign.length > 0) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(toSign.map(t => t.path), SIGNED_URL_TTL);
    (data || []).forEach((d: any, k: number) => {
      if (d?.signedUrl) results[toSign[k].idx] = d.signedUrl;
    });
  }
  return results;
}