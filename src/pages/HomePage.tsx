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
    <div className="flex flex-col gap-4 p-4">
      <header className="text-center py-3">
        <h1 className="text-xl font-bold text-primary-600">도비종합학원</h1>
        <p className="text-sm text-gray-500 mt-1">학습 리포트</p>
      </header>

      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <button
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrevious
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
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
            canGoNext
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-scaleIn">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4"> {/* gap 추가로 안전거리 확보 */}
  {/* 아바타는 크기 유지 */}
  <div className="flex-shrink-0">
    <ChildAvatar child={currentChild} size="md" />
  </div>

  {/* TrendCard 영역은 유연하게 줄어들 수 있게 flex-1 또는 min-w-0 적용 */}
  <div className="flex-1 min-w-0">
    <TrendCard trends={currentReport.trends} />
  </div>
</div>

          <div className="border-t border-gray-100" />

          <div className="flex flex-col gap-6">
            <PentagonChart stats={currentReport.stats} />
            <HashtagList hashtags={currentReport.insights.hashtags} />
          </div>
        </div>
      </div>

      <SeasonInsightCard insight={currentReport.insights.seasonInsight} />

      <ParentActionCard recommendedActions={currentReport.insights.parentActions} />
    </div>
  );
}
