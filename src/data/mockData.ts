import type { Child, WeeklyReport, ParentAction } from './types';

export const children: Child[] = [
  {
    id: '1',
    name: '민준',
    grade: '초등학교 3학년',
    age: 9,
    avatar: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  },
  {
    id: '2',
    name: '서연',
    grade: '초등학교 5학년',
    age: 11,
    avatar: 'https://images.pexels.com/photos/1557843/pexels-photo-1557843.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  },
];

export const weeklyReports: WeeklyReport[] = [
  {
    weekId: '2026-w05',
    startDate: '2026-01-26',
    endDate: '2026-02-01',
    stats: {
      focus: 85,
      growthMind: 78,
      comprehension: 92,
      logic: 88,
      energy: 75,
    },
    trends: [
      { subject: '수학', trend: 'up', changePercent: 12 },
      { subject: '영어', trend: 'stable', changePercent: 0 },
      { subject: '과학', trend: 'up', changePercent: 8 },
      { subject: '국어', trend: 'down', changePercent: -5 },
      { subject: '사회', trend: 'up', changePercent: 15 },
    ],
    insights: {
      hashtags: ['집중력최상', '끈기있는태도', '논리력성장중', '자기조절잘해요'],
      parentActions: ['praise', 'encourage', 'listen'],
      seasonInsight: '이번 주는 어려운 문제를 만났을 때 포기하지 않고 끝까지 붙잡는 모습이 인상적이었어요. 집중력도 평소보다 높게 유지되었고, 결과가 기대에 못 미쳐도 크게 흔들리지 않는 안정된 태도를 보였습니다. 이런 마음의 힘이 실력 성장의 토대가 됩니다.',
    },
  },
  {
    weekId: '2026-w04',
    startDate: '2026-01-19',
    endDate: '2026-01-25',
    stats: {
      focus: 80,
      growthMind: 75,
      comprehension: 88,
      logic: 82,
      energy: 70,
    },
    trends: [
      { subject: '수학', trend: 'up', changePercent: 8 },
      { subject: '영어', trend: 'up', changePercent: 5 },
      { subject: '과학', trend: 'stable', changePercent: 0 },
      { subject: '국어', trend: 'stable', changePercent: 2 },
      { subject: '사회', trend: 'down', changePercent: -3 },
    ],
    insights: {
      hashtags: ['꾸준한흐름', '이해력탄탄', '호기심주도형'],
      parentActions: ['trust', 'encourage', 'snack'],
      seasonInsight: '전반적으로 안정적인 한 주였어요. 새로운 개념을 접했을 때 바로 묻고 확인하려는 습관이 생기고 있어서 좋습니다. 모르는 걸 모른다고 말할 수 있는 용기, 그 자체가 이미 성장이에요.',
    },
  },
  {
    weekId: '2026-w03',
    startDate: '2026-01-12',
    endDate: '2026-01-18',
    stats: {
      focus: 72,
      growthMind: 70,
      comprehension: 85,
      logic: 78,
      energy: 65,
    },
    trends: [
      { subject: '수학', trend: 'stable', changePercent: 2 },
      { subject: '영어', trend: 'down', changePercent: -4 },
      { subject: '과학', trend: 'up', changePercent: 10 },
      { subject: '국어', trend: 'up', changePercent: 7 },
      { subject: '사회', trend: 'stable', changePercent: 0 },
    ],
    insights: {
      hashtags: ['에너지회복중', '집중력기복있음', '창의적시도눈에띄어'],
      parentActions: ['rest', 'praise', 'encourage'],
      seasonInsight: '이번 주는 컨디션 기복이 좀 있었지만, 그 와중에도 자기만의 방식으로 문제를 풀어보려는 시도가 있었어요. 지금은 무리하게 밀어붙이기보다 충분히 쉬어가는 타이밍이에요. 회복 후에 집중력이 다시 돌아올 거예요.',
    },
  },
];

// ID는 Edge Function의 parent_actions와 호환 유지 (praise/trust/snack/rest/encourage/play/listen/hug)
// 라벨·아이콘·설명은 학원 학부모(초중고) 톤에 맞게 어른스럽게 재구성
export const parentActions: ParentAction[] = [
  {
    id: 'praise',
    label: '강점 알아주기',
    icon: 'sparkles',
    description: '잘한 점을 구체적으로 짚어 인정해주세요. "열심히 했네"보다 "그 부분을 스스로 해냈구나"가 더 힘이 됩니다.',
  },
  {
    id: 'trust',
    label: '믿고 기다리기',
    icon: 'heart',
    description: '스스로 방법을 찾을 시간을 주세요. 답을 먼저 주기보다 믿고 지켜보는 것이 사고력을 키웁니다.',
  },
  {
    id: 'snack',
    label: '기분 전환',
    icon: 'coffee',
    description: '좋아하는 것 한 가지로 잠시 마음의 결을 바꿔주세요. 작은 환기가 다음 흐름을 만듭니다.',
  },
  {
    id: 'rest',
    label: '충분한 쉼',
    icon: 'moon',
    description: '충분한 수면과 멍때리는 시간을 확보해주세요. 뇌는 쉴 때 정보를 정리하고 아이디어를 만듭니다.',
  },
  {
    id: 'encourage',
    label: '과정 응원',
    icon: 'footprints',
    description: '결과보다 과정을 알아봐 주세요. "시도한 것 자체가 의미 있어"라는 한 마디가 회복력을 키웁니다.',
  },
  {
    id: 'play',
    label: '함께 시간',
    icon: 'users',
    description: '학습 이야기 말고 일상을 나누는 시간을 만들어주세요. 부모와의 편안한 시간이 정서의 토대가 됩니다.',
  },
  {
    id: 'listen',
    label: '끝까지 듣기',
    icon: 'ear',
    description: '오늘 어땠는지 먼저 물어봐주세요. 평가 없이 끝까지 듣는 것만으로 아이는 생각을 정리하게 됩니다.',
  },
  {
    id: 'hug',
    label: '정서 공감',
    icon: 'hand-heart',
    description: '말보다 먼저 마음을 알아주세요. "많이 속상했겠다" 한 마디가 어떤 조언보다 큰 위로가 됩니다.',
  },
];