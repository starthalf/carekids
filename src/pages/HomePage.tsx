import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check, Sparkles, Search } from 'lucide-react';
import { useChildData } from '../contexts/ChildDataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateRange, getRelativeWeekLabel } from '../utils/dateUtils';
import ChildAvatar from '../components/avatar/ChildAvatar';
import StudentPhoto from '../components/avatar/StudentPhoto';
import TrendCard from '../components/trend/TrendCard';
import PentagonChart from '../components/stats/PentagonChart';
import SeasonInsightCard from '../components/insight/SeasonInsightCard';
import ParentActionCard from '../components/insight/ParentActionCard';
import ReportSkeleton from '../components/skeleton/ReportSkeleton';

export default function HomePage() {
  const {
    currentChild,
    currentReport,
    currentWeekIndex,
    isLoadingReport,
    isAIGenerated,
    goToPreviousWeek,
    goToNextWeek,
    canGoNext,
    canGoPrevious,
    academyName,
  } = useChildData();
  const { myAcademies, selectedKey, selectAcademy, isOwnerPreview } = useAuth();

  const [showSelector, setShowSelector] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const hasMultiple = myAcademies.length > 1;

  // 학원장 미리보기처럼 학생이 많을 때만 검색창 노출 (8명 초과)
  const showSearch = myAcademies.length > 8;

  const filteredAcademies = studentQuery.trim()
    ? myAcademies.filter(a =>
        a.studentName.toLowerCase().includes(studentQuery.trim().toLowerCase())
      )
    : myAcademies;

  // 주차 전환 시 fade 효과를 위한 key
  const [contentKey, setContentKey] = useState(0);
  useEffect(() => {
    if (currentReport) setContentKey(k => k + 1);
  }, [currentReport?.weekId]);

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
      {/* 학원장 미리보기 배너 */}
      {isOwnerPreview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <div className="text-amber-600 shrink-0 mt-0.5">👀</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">원장 미리보기 모드</p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              학부모님께 보이는 실제 화면입니다. 학생을 바꾸려면 상단을 눌러주세요.
            </p>
          </div>
        </div>
      )}

      {/* 헤더 */}
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
            <div className="fixed inset-0 z-10" onClick={() => { setShowSelector(false); setStudentQuery(''); }} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 text-left">학원/자녀 선택</p>
              </div>

              {showSearch && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      autoFocus
                      value={studentQuery}
                      onChange={e => setStudentQuery(e.target.value)}
                      placeholder="학생 이름 검색"
                      className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="max-h-[320px] overflow-y-auto">
                {filteredAcademies.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs text-gray-400">
                    "{studentQuery}" 검색 결과 없음
                  </p>
                )}
                {filteredAcademies.map(a => (
                  <button
                    key={a.parentStudentId}
                    onClick={() => {
                      selectAcademy(a.parentStudentId);
                      setShowSelector(false);
                      setStudentQuery('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                      a.parentStudentId === selectedKey ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <StudentPhoto
                      avatar={a.studentAvatar}
                      seed={a.studentId}
                      alt=""
                      className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{a.studentName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {a.academyName}
                        {a.source === 'owner_preview' && (
                          <span className="ml-1 text-[10px] text-amber-600">· 원장 미리보기</span>
                        )}
                      </p>
                    </div>
                    {a.parentStudentId === selectedKey && (
                      <Check size={16} className="text-primary-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </header>

      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <button
          onClick={goToPreviousWeek}
          disabled={!canGoPrevious || isLoadingReport}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrevious && !isLoadingReport ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-primary-600">
            {getRelativeWeekLabel(currentWeekIndex)}
          </p>
          <p className="text-xs text-gray-500 transition-opacity duration-300">
            {currentReport ? formatDateRange(currentReport.startDate, currentReport.endDate) : '...'}
          </p>
        </div>
        <button
          onClick={goToNextWeek}
          disabled={!canGoNext || isLoadingReport}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext && !isLoadingReport ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 아바타 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center">
        <ChildAvatar child={currentChild} size="lg" />
      </div>

      {/* 로딩 중 - 실제 구조 닮은 스켈레톤 */}
      {isLoadingReport && <ReportSkeleton />}

      {/* 데이터 있을 때 - fade 전환 */}
      {!isLoadingReport && currentReport && (
        <div
          key={contentKey}
          className="flex flex-col gap-4 animate-fadeIn"
        >
          {/* 5각형 + 해시태그 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 relative">
            {/* AI 생성 뱃지 */}
            {isAIGenerated && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-purple-50 rounded-full border border-purple-100">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-[10px] font-medium text-purple-600">AI 분석</span>
              </div>
            )}

            <PentagonChart stats={currentReport.stats} />
            <div className="border-t border-gray-100" />
            {currentReport.insights.hashtags.length > 0 && (
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex flex-nowrap gap-1.5 py-1">
                  {currentReport.insights.hashtags.map((tag, idx) => (
                    <span
                      key={tag}
                      className="whitespace-nowrap px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100 animate-slideInRight"
                      style={{ animationDelay: `${600 + idx * 80}ms`, animationFillMode: 'both' }}
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ animationDelay: '300ms', animationFillMode: 'both' }} className="animate-fadeIn">
            <SeasonInsightCard insight={currentReport.insights.seasonInsight} />
          </div>

          {currentReport.insights.parentActions.length > 0 && (
            <div style={{ animationDelay: '450ms', animationFillMode: 'both' }} className="animate-fadeIn">
              <ParentActionCard recommendedActions={currentReport.insights.parentActions} />
            </div>
          )}

          {currentReport.trends.length > 0 && (
            <div
              style={{ animationDelay: '600ms', animationFillMode: 'both' }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn"
            >
              <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-tighter">Weekly Trend</h3>
              <TrendCard trends={currentReport.trends} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}