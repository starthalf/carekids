import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Child, WeeklyReport } from '../data/types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchWeekInputs, getWeekRange } from '../lib/dataFetcher';
import {
  calculateFiveAxis,
  calculateTrends,
  generateHashtags,
  suggestParentActions,
  generateSeasonInsight,
  type WeekInputs,
} from '../utils/statsCalculator';

interface ChildDataContextType {
  currentChild: Child;
  currentWeekIndex: number;
  currentReport: WeeklyReport | null;
  isLoadingReport: boolean;
  isAIGenerated: boolean;          // ← Step 3: AI 캐시인지 fallback인지
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  academyName: string;
  hasData: boolean;
}

const ChildDataContext = createContext<ChildDataContextType | undefined>(undefined);

const MAX_PAST_WEEKS = 12;

function gradeToLabel(grade: number): string {
  if (grade >= 1 && grade <= 6) return `초등학교 ${grade}학년`;
  if (grade >= 7 && grade <= 9) return `중학교 ${grade - 6}학년`;
  if (grade >= 10 && grade <= 12) return `고등학교 ${grade - 9}학년`;
  return `${grade}학년`;
}

function gradeToAge(grade: number): number {
  return grade + 6;
}

export function ChildDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const { currentAcademy } = useAuth();
  // 디폴트: 지난 한 주 (W-1). 배치는 일요일에 끝난 한 주를 처리하므로
  // 부모가 보는 디폴트도 "방금 완결된 한 주"가 되어야 함.
  const [weekOffset, setWeekOffset] = useState(-1);
  const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  const currentChild: Child = useMemo(() => {
    if (currentAcademy) {
      return {
        id: currentAcademy.studentId,
        name: currentAcademy.studentName,
        grade: gradeToLabel(currentAcademy.studentGrade),
        age: gradeToAge(currentAcademy.studentGrade),
        avatar: currentAcademy.studentAvatar || 'https://api.dicebear.com/7.x/thumbs/svg?seed=child',
      };
    }
    return {
      id: '0',
      name: '자녀',
      grade: '학년',
      age: 0,
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=default',
    };
  }, [currentAcademy]);

  useEffect(() => {
    if (!currentAcademy) {
      setCurrentReport(null);
      setIsLoadingReport(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      console.log('[ChildData] load start, weekOffset:', weekOffset);
      setIsLoadingReport(true);
      try {
        const { start, end } = getWeekRange(weekOffset);

        // 1. weekly_insights 캐시 먼저 조회
        const { data: cached, error: cacheErr } = await supabase
          .from('weekly_insights')
          .select('*')
          .eq('student_id', currentAcademy.studentId)
          .eq('week_start', start)
          .maybeSingle();

        if (cancelled) return;

        if (cached && !cacheErr) {
          // 캐시 hit! AI가 생성한 리포트
          console.log('[ChildData] cache hit (AI generated)');
          const report: WeeklyReport = {
            weekId: start,
            startDate: start,
            endDate: end,
            stats: cached.stats,
            trends: cached.trends || [],
            insights: {
              hashtags: cached.hashtags || [],
              parentActions: cached.parent_actions || [],
              seasonInsight: cached.season_insight,
            },
          };
          setCurrentReport(report);
          setIsAIGenerated(true);
        } else {
          // 캐시 miss - Step 2 fallback (단순 룰 계산)
          console.log('[ChildData] cache miss, falling back to client calculation');
          await loadFallback(start, end, cancelled);
        }
      } catch (err) {
        console.error('[ChildData] load error:', err);
        if (!cancelled) {
          setCurrentReport(null);
          setIsAIGenerated(false);
        }
      } finally {
        if (!cancelled) setIsLoadingReport(false);
      }
    };

    const loadFallback = async (start: string, end: string, cancelled: boolean) => {
      const prevWeek = getWeekRange(weekOffset - 1);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('fetch timeout 10s')), 10000)
      );
      const fetchAll = Promise.all([
        fetchWeekInputs(currentAcademy.studentId, start, end),
        fetchWeekInputs(currentAcademy.studentId, prevWeek.start, prevWeek.end),
      ]);
      const [thisInputs, prevInputs] = await Promise.race([fetchAll, timeout]) as Awaited<typeof fetchAll>;
      if (cancelled) return;

      const inputsWithPrev: WeekInputs = { ...thisInputs, prevWeekScores: prevInputs.scores };
      const stats = calculateFiveAxis(inputsWithPrev, currentAcademy.studentGrade);
      const trends = calculateTrends(thisInputs.scores, prevInputs.scores);
      const hashtags = generateHashtags(stats, thisInputs);
      const parentActions = suggestParentActions(stats);
      const seasonInsight = generateSeasonInsight(stats, currentAcademy.studentName);

      const report: WeeklyReport = {
        weekId: start,
        startDate: start,
        endDate: end,
        stats,
        trends: trends.map(t => ({ subject: t.subject, trend: t.trend, changePercent: t.changePercent })),
        insights: { hashtags, parentActions, seasonInsight },
      };
      setCurrentReport(report);
      setIsAIGenerated(false);
    };

    load();
    return () => { cancelled = true; };
  }, [currentAcademy, weekOffset]);

  // W-1이 최신 리포트. W(진행 중인 주)나 미래 주차는 보여주지 않음.
  const canGoNext = weekOffset < -1;
  const canGoPrevious = weekOffset > -MAX_PAST_WEEKS;

  const goToPreviousWeek = () => { if (canGoPrevious) setWeekOffset(p => p - 1); };
  const goToNextWeek = () => { if (canGoNext) setWeekOffset(p => p + 1); };

  const hasData = useMemo(() => {
    if (!currentReport) return false;
    const { stats } = currentReport;
    return !(stats.focus === 60 && stats.growthMind === 60 && stats.comprehension === 60 && stats.energy === 60);
  }, [currentReport]);

  const value = useMemo(
    () => ({
      currentChild,
      currentWeekIndex: -weekOffset,
      currentReport,
      isLoadingReport,
      isAIGenerated,
      goToPreviousWeek,
      goToNextWeek,
      canGoNext,
      canGoPrevious,
      academyName: currentAcademy?.academyName || '학원',
      hasData,
    }),
    [currentChild, weekOffset, currentReport, isLoadingReport, isAIGenerated, canGoNext, canGoPrevious, currentAcademy, hasData]
  );

  return (
    <ChildDataContext.Provider value={value}>{childrenProp}</ChildDataContext.Provider>
  );
}

export function useChildData() {
  const context = useContext(ChildDataContext);
  if (context === undefined) throw new Error('useChildData must be used within a ChildDataProvider');
  return context;
}