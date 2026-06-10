// src/lib/studentTags.ts
// 학원 앱과 키가 정확히 일치 (DB student_tags.tag check constraint와 일치)
export type StudentTag =
  | 'question'
  | 'help_friend'
  | 'persistent'
  | 'try_new'
  | 'good_answer'
  | 'deep_focus'
  | 'fun_friend'
  | 'self_driven'
  | 'creative';

export interface TagDef {
  key: StudentTag;
  emoji: string;
  label: string;
  axes: string[];
  description: string;
}

export const STUDENT_TAGS: TagDef[] = [
  { key: 'question',    emoji: '🙋', label: '질문 많이 함',   axes: ['growthMind', 'logic', 'energy'],         description: '수업 중 손 들고 질문' },
  { key: 'help_friend', emoji: '🤝', label: '친구 도와줌',    axes: ['social', 'growthMind'],                  description: '친구의 모르는 부분 알려줌' },
  { key: 'persistent',  emoji: '💪', label: '끈기 있게 풂',   axes: ['focus', 'growthMind'],                   description: '어려운 문제 포기 않고 도전' },
  { key: 'try_new',     emoji: '✨', label: '새로운 시도',    axes: ['growthMind', 'energy'],                  description: '평소와 다른 방식·표현' },
  { key: 'good_answer', emoji: '💡', label: '좋은 답변',     axes: ['comprehension', 'logic'],                description: '정확하고 명료한 답' },
  { key: 'deep_focus',  emoji: '🎯', label: '깊이 몰입',     axes: ['focus'],                                 description: '한 가지에 깊게 빠져듬' },
  { key: 'fun_friend',  emoji: '😊', label: '친구와 즐거움', axes: ['social', 'energy'],                      description: '친구들과 어울려 즐거워함' },
  { key: 'self_driven', emoji: '🌱', label: '자기 주도',     axes: ['growthMind', 'autonomy'],                description: '시키지 않아도 스스로' },
  { key: 'creative',    emoji: '🎨', label: '창의적 사고',    axes: ['creativity', 'logic', 'comprehension'], description: '독특한 풀이·관점' },
];

export const TAG_BY_KEY: Record<StudentTag, TagDef> = STUDENT_TAGS.reduce(
  (acc, t) => ({ ...acc, [t.key]: t }),
  {} as Record<StudentTag, TagDef>
);

export function getTagInfo(key: string): TagDef {
  return TAG_BY_KEY[key as StudentTag] || {
    key: key as StudentTag,
    emoji: '⭐',
    label: key,
    axes: [],
    description: '',
  };
}
