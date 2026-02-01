import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Child, WeeklyReport } from '../data/types';
import { children, weeklyReports } from '../data/mockData';

interface ChildDataContextType {
  currentChild: Child;
  currentWeekIndex: number;
  currentReport: WeeklyReport;
  allReports: WeeklyReport[];
  setCurrentChild: (child: Child) => void;
  setCurrentWeekIndex: (index: number) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const ChildDataContext = createContext<ChildDataContextType | undefined>(undefined);

export function ChildDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const [currentChild, setCurrentChild] = useState<Child>(children[0]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const currentReport = useMemo(() => {
    return weeklyReports[currentWeekIndex];
  }, [currentWeekIndex]);

  const canGoNext = currentWeekIndex > 0;
  const canGoPrevious = currentWeekIndex < weeklyReports.length - 1;

  const goToPreviousWeek = () => {
    if (canGoPrevious) {
      setCurrentWeekIndex((prev) => prev + 1);
    }
  };

  const goToNextWeek = () => {
    if (canGoNext) {
      setCurrentWeekIndex((prev) => prev - 1);
    }
  };

  const value = useMemo(
    () => ({
      currentChild,
      currentWeekIndex,
      currentReport,
      allReports: weeklyReports,
      setCurrentChild,
      setCurrentWeekIndex,
      goToPreviousWeek,
      goToNextWeek,
      canGoNext,
      canGoPrevious,
    }),
    [currentChild, currentWeekIndex, currentReport, canGoNext, canGoPrevious]
  );

  return (
    <ChildDataContext.Provider value={value}>{childrenProp}</ChildDataContext.Provider>
  );
}

export function useChildData() {
  const context = useContext(ChildDataContext);
  if (context === undefined) {
    throw new Error('useChildData must be used within a ChildDataProvider');
  }
  return context;
}
