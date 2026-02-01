// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChildDataProvider } from './contexts/ChildDataContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // 방금 만든 로그인 페이지

function App() {
  return (
    <ChildDataProvider>
      <Routes>
        {/* 1. 로그인 페이지 (레이아웃 없이 꽉 찬 화면) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. 메인 화면 (AppLayout으로 감싸서 하단 탭바 표시) */}
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        
        {/* 3. 그 외 이상한 주소로 들어오면 홈(또는 로그인)으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChildDataProvider>
  );
}

export default App;