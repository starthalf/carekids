import React, { useState } from 'react';
import { useChildData } from '../contexts/ChildDataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ChildAvatar } from '../components/avatar/ChildAvatar';
import { TrendCard } from '../components/trend/TrendCard';
import { PentagonChart } from '../components/stats/PentagonChart';
import { HashtagList } from '../components/insight/HashtagList';
import { SeasonInsightCard } from '../components/insight/SeasonInsightCard';
import { ParentActionCard } from '../components/insight/ParentActionCard';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export const HomePage = () => {
  const { currentChild } = useChildData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevDate = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDate = () => setCurrentDate(prev => addDays(prev, 1));

  if (!currentChild) return <div>Loading...</div>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-24">
        {/* 헤더 섹션 */}
        <header className="flex items-center justify-between px-1 py-2">
          <h1 className="text-xl font-bold text-gray-900">도비종합학원</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <span className="sr-only">알림</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
          <button onClick={handlePrevDate} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(currentDate, 'yyyy.MM.dd (eee)', { locale: ko })}</span>
          </div>
          <button onClick={handleNextDate} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 메인 대시보드 카드 */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center pb-10">
          
          {/* 1. ChildAvatar 섹션 (사진과 정보만) */}
          <div className="mb-6">
            <ChildAvatar child={currentChild} size="lg" />
          </div>

          {/* 2. PentagonChart (위로 이동됨) */}
          <div className="w-full flex justify-center mb-8">
             <PentagonChart data={currentChild.stats} size="xl" />
          </div>

          {/* 3. TrendCard (아래로 이동됨) */}
          <div className="w-full mb-8">
            <TrendCard trend={currentChild.trend} />
          </div>

          {/* 4. HashtagList */}
          <div className="w-full">
            <HashtagList tags={currentChild.tags} />
          </div>
        </div>

        {/* 하단 인사이트 카드들 */}
        <SeasonInsightCard 
          season="겨울방학" 
          insight="지난 학기보다 수학 점수가 15% 올랐어요! 이대로면 다음 학기 상위권 진입이 가능해요." 
        />
        
        <ParentActionCard 
          action="칭찬 격려하기"
          description="아이가 최근 과제를 모두 완료했어요. 따뜻한 말 한마디를 건네주세요."
        />
      </div>
    </AppLayout>
  );
};