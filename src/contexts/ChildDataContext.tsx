import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Child, WeeklyReport } from '../data/types';
import { weeklyReports } from '../data/mockData';
import { useAuth } from './AuthContext';

interface ChildDataContextType {
  currentChild: Child;
  currentWeekIndex: number;
  currentReport: WeeklyReport;
  allReports: WeeklyReport[];
  setCurrentWeekIndex: (index: number) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  // 학원 메타 정보
  academyName: string;
}

const ChildDataContext = createContext<ChildDataContextType | undefined>(undefined);

// 학년 → 학교 표기 변환
function gradeToLabel(grade: number): string {
  if (grade >= 1 && grade <= 6) return `초등학교 ${grade}학년`;
  if (grade >= 7 && grade <= 9) return `중학교 ${grade - 6}학년`;
  if (grade >= 10 && grade <= 12) return `고등학교 ${grade - 9}학년`;
  return `${grade}학년`;
}

function gradeToAge(grade: number): number {
  // 초1 = 7세 기준
  return grade + 6;
}

export function ChildDataProvider({ children: childrenProp }: { children: ReactNode }) {
  const { currentAcademy } = useAuth();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // 실제 자녀 정보 (Supabase 기반)로 Child 객체 구성
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
    // fallback (인증 안 된 상태에서 일시적으로 렌더링)
    return {
      id: '0',
      name: '자녀',
      grade: '학년',
      age: 0,
      avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=default',
    };
  }, [currentAcademy]);

  // 일단 Mock 리포트 사용 (Step 2~3에서 실제 데이터로 교체 예정)
  const currentReport = useMemo(() => weeklyReports[currentWeekIndex], [currentWeekIndex]);

  const canGoNext = currentWeekIndex > 0;
  const canGoPrevious = currentWeekIndex < weeklyReports.length - 1;

  const goToPreviousWeek = () => {
    if (canGoPrevious) setCurrentWeekIndex(prev => prev + 1);
  };
  const goToNextWeek = () => {
    if (canGoNext) setCurrentWeekIndex(prev => prev - 1);
  };

  const value = useMemo(
    () => ({
      currentChild,
      currentWeekIndex,
      currentReport,
      allReports: weeklyReports,
      setCurrentWeekIndex,
      goToPreviousWeek,
      goToNextWeek,
      canGoNext,
      canGoPrevious,
      academyName: currentAcademy?.academyName || '학원',
    }),
    [currentChild, currentWeekIndex, currentReport, canGoNext, canGoPrevious, currentAcademy]
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
