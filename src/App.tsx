import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChildDataProvider } from './contexts/ChildDataContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ChildDataProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </ChildDataProvider>
    </BrowserRouter>
  );
}
