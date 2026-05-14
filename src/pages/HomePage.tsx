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

export default function HomePage() {
  const {
    currentChild,
    currentReport,
    currentWeekIndex,
    goToPreviousWeek,
    goToNextWeek,
    canGoNext,
    canGoPrevious,
    academyName,
  } = useChildData();
  const { myAcademies, selectedAcademyId, selectAcademy } = useAuth();

  const [showSelector, setShowSelector] = useState(false);
  const hasMultiple = myAcademies.length > 1;

  // 연결된 학원이 없으면
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

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* 헤더: 학원/자녀 선택 가능 */}
      <header className="text-center py-3 relative">
        <button
          onClick={() => hasMultiple && setShowSelector(!showSelector)}
          className={`inline-flex items-center gap-1.5 ${hasMultiple ? 'hover:bg-gray-50 px-3 py-1.5 rounded-lg' : ''}`}
        >
          <h1 className="text-xl font-bold text-primary-600">{academyName}</h1>
          {hasMultiple && <ChevronDown size={18} className="text-primary-600" />}
        </button>
        <p className="text-sm text-gray-500 mt-1">학습 리포트</p>

        {/* 학원 선택 드롭다운 */}
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
                  <img
                    src={a.studentAvatar || 'https://api.dicebear.com/7.x/thumbs/svg?seed=' + a.studentId}
                    alt=""
                    className="w-10 h-10 rounded-full bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{a.studentName}</p>
                    <p className="text-xs text-gray-500 truncate">{a.academyName}</p>
                  </div>
                  {a.academyId === selectedAcademyId && (
                    <Check size={16} className="text-primary-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
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

      {/* 아바타 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center animate-scaleIn">
        <ChildAvatar child={currentChild} size="lg" />
      </div>

      {/* 5각형 차트 + 해시태그 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-scaleIn">
        <PentagonChart stats={currentReport.stats} />
        <div className="border-t border-gray-100" />
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

      {/* 인사이트 카드들 */}
      <SeasonInsightCard insight={currentReport.insights.seasonInsight} />
      <ParentActionCard recommendedActions={currentReport.insights.parentActions} />

      {/* Weekly Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scaleIn">
        <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-tighter">Weekly Trend</h3>
        <TrendCard trends={currentReport.trends} />
      </div>

      {/* Step 1 안내 (Mock 데이터 알림 - Step 2~3에서 제거) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <p className="font-semibold mb-1">📝 알림</p>
        <p>
          현재 보이는 통계/해시태그/조언은 데모용 데이터입니다.
          충분한 데이터가 쌓이면 자녀의 실제 분석으로 자동 전환됩니다.
        </p>
      </div>
    </div>
  );
}
