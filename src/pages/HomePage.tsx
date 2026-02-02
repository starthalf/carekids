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

      {/* 1. 아바타 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-center animate-scaleIn">
        <ChildAvatar child={currentChild} size="lg" />
      </div>

      {/* 2. 분석 섹션 (오각형 차트 + 해시태그) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-scaleIn">
        <PentagonChart stats={currentReport.stats} />
        <div className="border-t border-gray-100" />
        {/* 해시태그 영역: 컴포넌트 내부에서 한 줄 처리가 되도록 구성됨 */}
        <HashtagList hashtags={currentReport.insights.hashtags} />
      </div>

      {/* 3. 인사이트 카드들 */}
      <SeasonInsightCard insight={currentReport.insights.seasonInsight} />
      <ParentActionCard recommendedActions={currentReport.insights.parentActions} />

      {/* 4. [수정] Weekly Trend를 최하단으로 이동 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scaleIn">
        <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Weekly Trend</h3>
        <TrendCard trends={currentReport.trends} />
      </div>
    </div>
  );
}