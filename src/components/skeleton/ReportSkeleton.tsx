// src/components/skeleton/ReportSkeleton.tsx
// 실제 리포트 화면 구조를 닮은 skeleton

export default function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* 5각형 + 해시태그 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
        {/* Learning Agility 제목 */}
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />

        {/* 5각형 자리 - SVG 윤곽 */}
        <div className="w-full h-[280px] flex items-center justify-center">
          <svg width="240" height="240" viewBox="0 0 240 240" className="animate-pulse">
            {/* 5각형 외곽 (큰 거) */}
            <polygon
              points="120,30 200,90 170,180 70,180 40,90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1.5"
            />
            {/* 5각형 안쪽 그리드 */}
            <polygon
              points="120,68 175,108 153,175 87,175 65,108"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <polygon
              points="120,105 150,125 137,170 103,170 90,125"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            {/* 중심에서 각 꼭짓점 */}
            <line x1="120" y1="120" x2="120" y2="30" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="120" y1="120" x2="200" y2="90" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="120" y1="120" x2="170" y2="180" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="120" y1="120" x2="70" y2="180" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="120" y1="120" x2="40" y2="90" stroke="#e5e7eb" strokeWidth="1" />

            {/* 라벨 자리 (회색 막대) */}
            <rect x="105" y="14" width="30" height="6" rx="3" fill="#e5e7eb" />
            <rect x="206" y="86" width="30" height="6" rx="3" fill="#e5e7eb" />
            <rect x="175" y="190" width="30" height="6" rx="3" fill="#e5e7eb" />
            <rect x="35" y="190" width="30" height="6" rx="3" fill="#e5e7eb" />
            <rect x="4" y="86" width="30" height="6" rx="3" fill="#e5e7eb" />
          </svg>
        </div>

        <div className="border-t border-gray-100" />

        {/* 해시태그 라인 */}
        <div className="flex gap-2 py-1">
          <div className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-5 w-14 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-5 w-18 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* 이번 주 인사이트 카드 */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-11/12 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* 부모 액션 카드 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}