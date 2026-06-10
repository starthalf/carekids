import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: '주간 리포트는 언제 받을 수 있나요?',
    a: '매주 월요일 새벽에 AI가 한 주치 데이터를 분석해 자동 생성합니다. 보통 월요일 아침에 알림을 받으실 수 있어요.',
  },
  {
    q: 'AI는 우리 아이를 어떻게 분석하나요?',
    a: '학원 선생님이 매일 입력하는 출결·숙제·시험 점수·수업 태도 기록을 종합해, 집중력·성장마인드·이해력·논리력·에너지 5가지 측면으로 풀어드립니다. 점수만 보는 게 아니라 아이의 한 주를 따뜻하게 짚어드리는 것이 KidsInside의 차별점이에요.',
  },
  {
    q: '점수가 떨어진 주에도 리포트가 오나요?',
    a: '네, 옵니다. 다만 KidsInside는 점수를 비난하지 않아요. "잠깐 호흡을 고르는 시기"처럼 따뜻하게 풀고, 아이의 좋은 모습을 함께 짚어 부모님이 불안하지 않게 합니다.',
  },
  {
    q: '우리 아이 데이터는 안전한가요?',
    a: '학원별로 완전히 격리해 저장합니다. 다른 학원이 우리 학원 데이터를 볼 수 없고, 부모님은 본인 자녀 데이터만 보입니다. 자세한 내용은 설정 → 개인정보 보호에서 확인하실 수 있어요.',
  },
  {
    q: '오각형 차트는 어떻게 봐야 하나요?',
    a: '5축(집중력·성장마인드·이해력·논리력·에너지) 점수예요. 높낮이의 절대값보다, 매주 어느 부분이 잘 자라고 있는지의 흐름을 봐주세요. 한 축이 낮다고 걱정하지 마시고요 — 이건 아이의 모습을 입체적으로 보여주는 그림이에요.',
  },
  {
    q: '학원을 옮기면 이전 기록은 어떻게 되나요?',
    a: '이전 학원의 인사이트 기록은 그대로 보존됩니다. "기록" 탭에서 언제든 확인 가능해요. 새 학원에 가입하시면 새로운 학원의 기록이 함께 보입니다.',
  },
];

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <p className="font-medium text-gray-800 text-sm flex-1">{item.q}</p>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-xs text-gray-600 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="py-3 flex items-center gap-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">도움말</h1>
          <p className="text-sm text-gray-500 mt-0.5">FAQ 및 문의하기</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 text-sm">자주 묻는 질문</h2>
        </div>
        {FAQS.map((item, index) => (
          <FaqAccordion
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 text-sm">문의하기</h2>
          <p className="text-xs text-gray-500 mt-1">
            FAQ에 없는 궁금증이 있다면 편하게 연락주세요.
          </p>
        </div>
        <a
          href="mailto:support@kidsinside.com"
          className="w-full p-4 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-800 text-sm">이메일</p>
            <p className="text-xs text-gray-500 mt-0.5">support@kidsinside.com</p>
          </div>
        </a>
        <a
          href="https://pf.kakao.com/_kidsinside"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-gray-800 text-sm">카카오톡 채널</p>
            <p className="text-xs text-gray-500 mt-0.5">@kidsinside</p>
          </div>
        </a>
      </div>

      <p className="text-xs text-gray-400 text-center px-4 mt-2">
        평일 오전 10시 ~ 오후 6시 응답
      </p>
    </div>
  );
}