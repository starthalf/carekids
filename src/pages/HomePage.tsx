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
import AxisActionGuide from '../components/insight/AxisActionGuide';

export default function HomePage() {
  const {
    currentChild,
    currentReport,
    previousStats,
    currentWeekIndex,
    isLoadingReport,
    isNewStudent,
    goToPreviousWeek,
    goToNextWeek,
    canGoNext,
    canGoPrevious,
    academyName,
  } = useChildData();
  const { myAcademies, selectedKey, selectAcademy, currentAcademy, identityLoaded } = useAuth();

  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'insight' | 'action'>('insight');
  const hasMultiple = myAcademies.length > 1;

  // 백그라운드 정체성 로딩 중 — 빈 학원 메시지 대신 스피너
  if (!identityLoaded && myAcademies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

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
                    selectAcademy(a.parentStudentId);
                    setShowSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                    a.parentStudentId === selectedKey ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.academyName}</p>
                    <p className="text-xs text-gray-500 truncate">{a.studentName}</p>
                  </div>
                  {a.parentStudentId === selectedKey && <Check size={16} className="text-primary-600" />}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 animate-scaleIn">
        <ChildAvatar child={currentChild} size="md" />
      </div>

      {/* 인사이트 / 액션 토글 */}
      {!isLoadingReport && !isNewStudent && currentReport && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('insight')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'insight'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            인사이트
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'action'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            이렇게 도와주세요
          </button>
        </div>
      )}

      {isLoadingReport && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-sm text-gray-400">
          데이터 분석 중...
        </div>
      )}

      {/* 신규 학생 안내 — weekly_insights row 0개 */}
      {!isLoadingReport && isNewStudent && (
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl shadow-sm border border-primary-100 p-6 animate-scaleIn">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-base font-bold text-gray-900 mb-2">
            {currentChild.name}은(는) 키즈위크에 새로 오셨네요!
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            학원에서 한 주~두 주 정도 데이터가 쌓이면<br/>
            {currentChild.name}만의 학습 리듬을 분석해 드릴게요.
          </p>
          <div className="bg-white/70 rounded-xl p-4 border border-primary-100/50">
            <p className="text-xs text-gray-500 leading-relaxed">
              💡 매주 월요일 아침, 한 주치 학원 일상을 분석한<br/>
              따뜻한 리포트가 도착합니다.
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            그동안 "기록" 탭에서 학원 일상을 확인하실 수 있어요
          </p>
        </div>
      )}

      {!isLoadingReport && !isNewStudent && currentReport && activeTab === 'insight' && (
        <>
          {/* 1. 5축 차트 + 해시태그 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-scaleIn">
            <PentagonChart stats={currentReport.stats} prevStats={previousStats} />
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

          {/* 4. 요일별 리듬 */}
          <WeeklyRhythmCard
            studentId={currentChild.id}
            childName={currentChild.name}
          />

          {/* 5. 3개월 전과 비교 */}
          <GrowthCompareCard
            studentId={currentChild.id}
            studentGrade={studentGrade}
            currentStats={currentReport.stats}
          />

          {/* 6. 주간 트렌드 */}
          {currentReport.trends.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-scaleIn">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Weekly Trend</h3>
                <span className="text-[10px] text-gray-400">시험 점수 변동</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                점수는 학습 신호의 한 부분일 뿐이에요.<br/>
                위의 인사이트와 함께 자녀의 한 주를 입체적으로 봐주세요.
              </p>
              <TrendCard trends={currentReport.trends} />
            </div>
          )}
        </>
      )}

      {!isLoadingReport && !isNewStudent && currentReport && activeTab === 'action' && (
        <>
          {/* 축별 맞춤 행동 가이드 */}
          <AxisActionGuide stats={currentReport.stats} prevStats={previousStats} />

          {/* 부모 액션 */}
          {currentReport.insights.parentActions.length > 0 && (
            <ParentActionCard recommendedActions={currentReport.insights.parentActions} />
          )}
        </>
      )}
    </div>
  );
}