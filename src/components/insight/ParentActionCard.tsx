import { useState } from 'react';
import {
  Sparkles,
  Heart,
  Coffee,
  Moon,
  Footprints,
  Users,
  Ear,
  HeartHandshake,
  // 하위 호환 (mockData에서 기존 아이콘 ID가 남아있을 경우 대비)
  Star,
  Cookie,
  ThumbsUp,
  Gamepad2,
} from 'lucide-react';
import { parentActions } from '../../data/mockData';

const iconMap: Record<string, React.ElementType> = {
  // 새 아이콘 매핑
  sparkles: Sparkles,
  heart: Heart,
  coffee: Coffee,
  moon: Moon,
  footprints: Footprints,
  users: Users,
  ear: Ear,
  'hand-heart': HeartHandshake,
  // 하위 호환
  star: Star,
  cookie: Cookie,
  'thumbs-up': ThumbsUp,
  'gamepad-2': Gamepad2,
};

interface ParentActionCardProps {
  recommendedActions: string[];
}

export default function ParentActionCard({ recommendedActions }: ParentActionCardProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleActionClick = (actionId: string) => {
    setSelectedAction(selectedAction === actionId ? null : actionId);
  };

  const selectedActionData = selectedAction
    ? parentActions.find((a) => a.id === selectedAction)
    : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-slideUp">
      <h3 className="font-semibold text-gray-800 mb-4">이번 주, 이렇게 다가가 보세요</h3>

      <div className="relative">
        {selectedActionData && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 animate-slideDown">
            <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-[220px] text-center leading-relaxed">
              {selectedActionData.description}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {parentActions.map((action) => {
            const Icon = iconMap[action.icon] || Sparkles;
            const isRecommended = recommendedActions.includes(action.id);
            const isSelected = selectedAction === action.id;

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 bg-white min-w-0 ${
                  isSelected
                    ? 'ring-2 ring-primary-500 border border-primary-200 scale-[1.03] shadow-sm'
                    : isRecommended
                    ? 'border border-primary-100 hover:border-primary-200'
                    : 'border border-gray-100 hover:border-gray-200 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-primary-100 text-primary-600'
                      : isRecommended
                      ? 'bg-primary-50 text-primary-500'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap tracking-tight ${
                    isSelected || isRecommended ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4 text-center tracking-tight">
        진하게 표시된 항목이 이번 주 우선 추천이에요 · 눌러서 자세히
      </p>
    </div>
  );
}