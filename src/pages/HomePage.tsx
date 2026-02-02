import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChildData } from '../contexts/ChildDataContext';
import { formatDateRange, getRelativeWeekLabel } from '../utils/dateUtils';
import ChildAvatar from '../components/avatar/ChildAvatar';
import TrendCard from '../components/trend/TrendCard';
import PentagonChart from '../components/stats/PentagonChart';
import HashtagList from '../components/insight/HashtagList';
import SeasonInsightCard from '../components/insight/SeasonInsightCard';
import ParentActionCard from '../components/insight/ParentActionCard';

export default function HomePage() {
  const {
    currentChild,
    currentReport,
    currentWeekIndex,
    goToPreviousWeek,
    goToNextWeek,
    canGoNext,
    canGoPrevious,
  } = useChildData();

  return (
    <div className="flex flex-col gap-4 p-4 pb-24"> 
      <header className="text-center py-3">
        <h1 className="text-xl font-bold text-primary-600">도비종합학원</h1>
        <p className="text-sm text-gray-500 mt-1">학습 리포트</p>
      </header>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <button
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrevious ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-primary-600">
            {getRelativeWeekLabel(currentWeekIndex)}
          </p>
          <p className="text-xs text-gray-500">
            {formatDateRange(currentReport.startDate, currentReport.endDate)}
          </p>
        </div>
        <button
          onClick={goToNextWeek}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 1. 아바타 섹션: py-4로 세로 길이를 줄이고 왼쪽 정렬 배치 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center animate-scaleIn">
        <ChildAvatar child={currentChild} size="lg" />
      </div>

      {/* 2. 분석 섹션 (오각형 차트 + 한 줄 해시태그) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-scaleIn">
        <PentagonChart stats={currentReport.stats} />
        <div className="border-t border-gray-100" />
        {/* [수정] 해시태그를 한 줄로 강제하고 폰트 크기를 줄임 */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap gap-1.5 py-1">
            {currentReport.insights.hashtags.map((tag) => (
              <span 
                key={tag} 
                className="whitespace-nowrap px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 인사이트 카드들 */}
      <SeasonInsightCard insight={currentReport.insights.seasonInsight} />
      <ParentActionCard recommendedActions={currentReport.insights.parentActions} />

      {/* 4. Weekly Trend: 최하단 유지 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scaleIn">
        <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-tighter">Weekly Trend</h3>
        <TrendCard trends={currentReport.trends} />
      </div>
    </div>
  );
}