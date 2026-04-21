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
      hashtags: ['감정조절잘해요', '회복탄력성UP', '긍정적사고', '자기표현력쑥쑥'],
      parentActions: ['praise', 'hug', 'listen'],
      seasonInsight: '이번 주 민준이는 감정을 스스로 조절하는 모습이 눈에 띄었어요. 속상한 상황에서도 금방 마음을 추스르고, 친구와의 갈등을 대화로 해결하려는 시도가 인상적이었습니다. 회복탄력성이 탄탄하게 자라고 있어요.',
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
      hashtags: ['공감능력높아요', '사회성발달중', '호기심왕'],
      parentActions: ['trust', 'play', 'listen'],
      seasonInsight: '친구들의 감정을 잘 읽고 배려하는 모습이 자주 보였어요. 모둠 활동에서 먼저 의견을 묻고 조율하는 태도가 자연스러워졌습니다. 사회적 사고력과 공감 능력이 균형 있게 성장하고 있어요.',
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
      hashtags: ['스트레스신호감지', '에너지충전필요', '창의적사고중'],
      parentActions: ['rest', 'hug', 'encourage'],
      seasonInsight: '이번 주는 평소보다 에너지가 낮고 예민한 반응이 조금 늘었어요. 피로가 쌓인 신호일 수 있으니 충분한 수면과 자유로운 놀이 시간을 확보해주세요. 억지로 집중을 요구하기보다 심리적 여유를 먼저 채워주는 것이 중요해요.',
    },
  },
];

export const parentActions: ParentAction[] = [
  {
    id: 'praise',
    label: '칭찬하기',
    icon: 'star',
    description: '결과보다 노력하는 과정 자체를 구체적으로 칭찬해주세요. 자존감이 높아져요.',
  },
  {
    id: 'trust',
    label: '믿어주기',
    icon: 'heart',
    description: '아이 스스로 결정하고 해낼 수 있다고 믿어주세요. 자기효능감이 자랍니다.',
  },
  {
    id: 'snack',
    label: '간식주기',
    icon: 'cookie',
    description: '맛있는 간식을 함께 먹으며 긴장을 풀어주세요. 뇌도 쉬어야 잘 생각해요.',
  },
  {
    id: 'rest',
    label: '쉬게하기',
    icon: 'moon',
    description: '충분한 수면과 자유 시간을 보장해주세요. 정서 안정의 기본은 회복이에요.',
  },
  {
    id: 'encourage',
    label: '격려하기',
    icon: 'thumbs-up',
    description: '힘든 상황에서도 "넌 잘하고 있어"라고 말해주세요. 회복탄력성을 키워줍니다.',
  },
  {
    id: 'play',
    label: '놀아주기',
    icon: 'gamepad-2',
    description: '규칙 없는 자유 놀이를 충분히 하게 해주세요. 창의적 사고력의 원천이에요.',
  },
  {
    id: 'listen',
    label: '들어주기',
    icon: 'ear',
    description: '판단 없이 끝까지 들어주세요. 감정을 말로 표현하는 능력이 쑥쑥 자랍니다.',
  },
  {
    id: 'hug',
    label: '안아주기',
    icon: 'hand-heart',
    description: '따뜻한 스킨십은 스트레스 호르몬을 낮추고 정서적 안정감을 높여줍니다.',
  },
];
