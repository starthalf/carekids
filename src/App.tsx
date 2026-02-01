import { Routes, Route, Navigate } from 'react-router-dom';
import { ChildDataProvider } from './contexts/ChildDataContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ChildDataProvider>
      <Routes>
        {/* 1. 기본 주소('/')로 들어오면 -> 무조건 로그인('/login')으로 보냄 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. 홈 화면 (이제 주소는 '/home'이 됩니다) */}
        <Route
          path="/home"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        
        {/* 4. 이상한 주소로 들어오면 -> 로그인 페이지로 보냄 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ChildDataProvider>
  );
}

export default App;