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
      hashtags: ['집중력향상', '논리적사고', '꾸준한성장', '자기주도학습'],
      parentActions: ['praise', 'encourage', 'snack'],
      seasonInsight: '겨울방학 동안 수학 실력이 눈에 띄게 향상되었습니다. 특히 문제 해결 능력과 논리적 사고력이 발전했어요. 지금처럼 꾸준히 학습하면 다음 학기에도 좋은 성과를 기대할 수 있습니다.',
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
      hashtags: ['성실함', '기초탄탄', '호기심왕'],
      parentActions: ['trust', 'rest', 'praise'],
      seasonInsight: '이번 주는 전반적으로 안정적인 학습 패턴을 보여주었습니다. 영어 읽기 능력이 조금씩 향상되고 있어요.',
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
      hashtags: ['과학탐구', '독서습관', '회복중'],
      parentActions: ['rest', 'encourage', 'snack'],
      seasonInsight: '방학 초반이라 에너지가 조금 낮아졌지만, 과학에 대한 관심이 높아지고 있습니다. 충분한 휴식과 함께 흥미로운 과학 실험을 해보면 좋겠어요.',
    },
  },
];

export const parentActions: ParentAction[] = [
  {
    id: 'praise',
    label: '칭찬하기',
    icon: 'star',
    description: '오늘 열심히 한 점을 구체적으로 칭찬해주세요',
  },
  {
    id: 'trust',
    label: '믿어주기',
    icon: 'heart',
    description: '아이의 선택을 존중하고 믿어주세요',
  },
  {
    id: 'snack',
    label: '간식주기',
    icon: 'cookie',
    description: '맛있는 간식으로 에너지를 충전해주세요',
  },
  {
    id: 'rest',
    label: '쉬게하기',
    icon: 'moon',
    description: '충분한 휴식으로 다음 학습을 준비해요',
  },
  {
    id: 'encourage',
    label: '격려하기',
    icon: 'thumbs-up',
    description: '포기하지 않도록 따뜻하게 격려해주세요',
  },
  {
    id: 'play',
    label: '놀아주기',
    icon: 'gamepad-2',
    description: '함께 놀면서 유대감을 쌓아보세요',
  },
  {
    id: 'listen',
    label: '들어주기',
    icon: 'ear',
    description: '아이의 이야기를 경청해주세요',
  },
  {
    id: 'hug',
    label: '안아주기',
    icon: 'hand-heart',
    description: '따뜻한 스킨십으로 사랑을 전해주세요',
  },
];
