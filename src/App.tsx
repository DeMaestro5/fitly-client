import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ResultPage } from './pages/ResultPage';
import { TailorPage } from './pages/TailorPage';
import { ResumeSessionProvider } from './state/session';

export default function App() {
  return (
    <ResumeSessionProvider>
      <Header />
      <Routes>
        <Route path='/' element={<TailorPage />} />
        <Route path='/result' element={<ResultPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </ResumeSessionProvider>
  );
}
