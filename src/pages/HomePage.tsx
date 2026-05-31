import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useChildData } from '../contexts/ChildDataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateRange, getRelativeWeekLabel } from '../utils/dateUtils';
import ChildAvatar from '../components/avatar/ChildAvatar';
import TrendCard from '../components/trend/TrendCard';
import PentagonChart from '../components/stats/PentagonChart';
import SeasonInsightCard from '../components/insight/SeasonInsightCard';
import ParentActionCard from '../components/insight/ParentActionCard';
import WeeklyHighlightsCard from '../components/insight/WeeklyHighlightsCard';
import WeeklyRhythmCard from '../components/insight/WeeklyRhythmCard';
import GrowthCompareCard from '../components/insight/GrowthCompareCard';

export default function HomePage() {
  const {
    currentChild,
    currentReport,
    currentWeekIndex,
    isLoadingReport,
    goToPreviousWeek,
    goToNextWeek,
    canGoNext,
    canGoPrevious,
    academyName,
  } = useChildData();
  const { myAcademies, selectedAcademyId, selectAcademy, currentAcademy } = useAuth();

  const [showSelector, setShowSelector] = useState(false);
  const hasMultiple = myAcademies.length > 1;

  if (myAcademies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">😊</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">연결된 학원이 없어요</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          학원에서 새 초대 링크를 받으시면<br/>
          링크를 클릭해서 연결해주세요.
        </p>
      </div>
    );
  }

  // 이번 주를 보고 있을 때만 "리듬"과 "성장 비교" 표시
  const isCurrentWeek = currentWeekIndex === 0;
  const studentGrade = currentAcademy?.studentGrade ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="text-center py-3 relative">
        <button
          onClick={() => hasMultiple && setShowSelector(!showSelector)}
          className={`inline-flex items-center gap-1.5 ${hasMultiple ? 'hover:bg-gray-50 px-3 py-1.5 rounded-lg' : ''}`}
        >
          <h1 className="text-xl font-bold text-primary-600">{academyName}</h1>
          {hasMultiple && <ChevronDown size={18} className="text-primary-600" />}
        </button>
        <p className="text-sm text-gray-500 mt-1">학습 리포트</p>

        {showSelector && hasMultiple && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSelector(false)} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 text-left">학원/자녀 선택</p>
              </div>
              {myAcademies.map(a => (
                <button
                  key={a.parentStudentId}
                  onClick={() => {
                    selectAcademy(a.academyId);
                    setShowSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                    a.academyId === selectedAcademyId ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.academyName}</p>
                    <p className="text-xs text-gray-500 truncate">{a.studentName}</p>
                  </div>
                  {a.academyId === selectedAcademyId && <Check size={16} className="text-primary-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      {/* 주차 네비게이션 */}
      <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
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
          <p className="text-sm font-semibold text-gray-800">
            {getRelativeWeekLabel(currentWeekIndex)}
          </p>
          <p className="text-xs text-gray-500">
            {currentReport ? formatDateRange(currentReport.startDate, currentReport.endDate) : '...'}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center animate-scaleIn">
        <ChildAvatar child={currentChild} size="lg" />
      </div>

      {isLoadingReport && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-sm text-gray-400">
          데이터 분석 중...
        </div>
      )}

      {!isLoadingReport && currentReport && (
        <>
          {/* 1. 5축 차트 + 해시태그 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-scaleIn">
            <PentagonChart stats={currentReport.stats} />
            <div className="border-t border-gray-100" />
            {currentReport.insights.hashtags.length > 0 && (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex flex-nowrap gap-1.5 py-1">
                  {currentReport.insights.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="whitespace-nowrap px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. 시즌 인사이트 */}
          <SeasonInsightCard insight={currentReport.insights.seasonInsight} />

          {/* 3. 이번 주 빛난 순간 */}
          <WeeklyHighlightsCard
            studentId={currentChild.id}
            weekStart={currentReport.startDate}
            weekEnd={currentReport.endDate}
          />

          {/* 4. 요일별 리듬 (이번 주 볼 때만, 최근 4주 누적) */}
          {isCurrentWeek && (
            <WeeklyRhythmCard
              studentId={currentChild.id}
              childName={currentChild.name}
            />
          )}

          {/* 5. 3개월 전과 비교 (이번 주 볼 때만) */}
          {isCurrentWeek && (
            <GrowthCompareCard
              studentId={currentChild.id}
              studentGrade={studentGrade}
              currentStats={currentReport.stats}
            />
          )}

          {/* 6. 부모 액션 */}
          {currentReport.insights.parentActions.length > 0 && (
            <ParentActionCard recommendedActions={currentReport.insights.parentActions} />
          )}

          {/* 7. 주간 트렌드 */}
          {currentReport.trends.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scaleIn">
              <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-tighter">Weekly Trend</h3>
              <TrendCard trends={currentReport.trends} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
