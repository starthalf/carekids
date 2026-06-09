import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Child, WeeklyReport } from '../data/types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { fetchWeekInputs, getWeekRange } from '../lib/dataFetcher';
import {
  calculateFiveAxis,
  calculateTrendsV2,
  generateHashtags,
  suggestParentActions,
  generateSeasonInsight,
  type WeekInputs,
} from '../utils/statsCalculator';

interface ChildDataContextType {
  currentChild: Child;
  currentWeekIndex: number;
  currentReport: WeeklyReport | null;
  previousStats: WeeklyReport['stats'] | null;   // 지난 주 stats (펜타곤 비교용)
  isLoadingReport: boolean;
  isAIGenerated: boolean;
  isNewStudent: boolean;                          // weekly_insights row 0개 = 신규 학생 (안내 카드용)
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
  const [weekOffset, setWeekOffset] = useState(-1);
  const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
  const [previousStats, setPreviousStats] = useState<WeeklyReport['stats'] | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);

  const currentChild: Child = useMemo(() => {
    if (currentAcademy) {
      return {
        id: currentAcademy.studentId,
        name: currentAcademy.studentName,
        grade: gradeToLabel(currentAcademy.studentGrade),
        age: gradeToAge(currentAcademy.studentGrade),
        avatar: currentAcademy.studentAvatar || '',
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
      setPreviousStats(null);
      setIsNewStudent(false);
      setIsLoadingReport(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      console.log('[ChildData] load start, weekOffset:', weekOffset);
      setIsLoadingReport(true);
      try {
        const { start, end } = getWeekRange(weekOffset);
        const prev = getWeekRange(weekOffset - 1);

        // 캐시 조회 — 현재 주 + 지난 주 + row 총 개수(신규 학생 판정)
        const [thisRes, prevRes, countRes] = await Promise.all([
          supabase
            .from('weekly_insights')
            .select('*')
            .eq('student_id', currentAcademy.studentId)
            .eq('week_start', start)
            .maybeSingle(),
          supabase
            .from('weekly_insights')
            .select('stats')
            .eq('student_id', currentAcademy.studentId)
            .eq('week_start', prev.start)
            .maybeSingle(),
          supabase
            .from('weekly_insights')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', currentAcademy.studentId),
        ]);

        if (cancelled) return;

        const cached = thisRes.data;
        const cacheErr = thisRes.error;
        const prevCached = prevRes.data;
        const totalReports = countRes.count ?? 0;

        // 신규 학생 판정: weekly_insights row가 하나도 없음
        setIsNewStudent(totalReports === 0);

        if (cached && !cacheErr) {
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
          setPreviousStats(prevCached?.stats ?? null);
          setIsAIGenerated(true);
        } else {
          console.log('[ChildData] cache miss, falling back to client calculation');
          setPreviousStats(prevCached?.stats ?? null);
          await loadFallback(start, end, cancelled);
        }
      } catch (err) {
        console.error('[ChildData] load error:', err);
        if (!cancelled) {
          setCurrentReport(null);
          setPreviousStats(null);
          setIsAIGenerated(false);
        }
      } finally {
        if (!cancelled) setIsLoadingReport(false);
      }
    };

    const loadFallback = async (start: string, end: string, cancelled: boolean) => {
      const w1 = getWeekRange(weekOffset - 1);
      const w2 = getWeekRange(weekOffset - 2);
      const w3 = getWeekRange(weekOffset - 3);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('fetch timeout 10s')), 10000)
      );
      const fetchAll = Promise.all([
        fetchWeekInputs(currentAcademy.studentId, start, end),
        fetchWeekInputs(currentAcademy.studentId, w1.start, w1.end),
        fetchWeekInputs(currentAcademy.studentId, w2.start, w2.end),
        fetchWeekInputs(currentAcademy.studentId, w3.start, w3.end),
      ]);
      const [thisInputs, prevInputs, w2Inputs, w3Inputs] = await Promise.race([fetchAll, timeout]) as Awaited<typeof fetchAll>;
      if (cancelled) return;

      const inputsWithPrev: WeekInputs = { ...thisInputs, prevWeekScores: prevInputs.scores };
      const stats = calculateFiveAxis(inputsWithPrev, currentAcademy.studentGrade);
      const trends = calculateTrendsV2([
        thisInputs.scores,
        prevInputs.scores,
        w2Inputs.scores,
        w3Inputs.scores,
      ]);
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
      previousStats,
      isLoadingReport,
      isAIGenerated,
      isNewStudent,
      goToPreviousWeek,
      goToNextWeek,
      canGoNext,
      canGoPrevious,
      academyName: currentAcademy?.academyName || '학원',
      hasData,
    }),
    [currentChild, weekOffset, currentReport, previousStats, isLoadingReport, isAIGenerated, isNewStudent, canGoNext, canGoPrevious, currentAcademy, hasData]
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