import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ResultPage } from './pages/ResultPage';
import { TailorPage } from './pages/TailorPage';
import { ResumeSessionProvider } from './state/session';
import { MasterResumePage } from './pages/MasterResume';
import { JobsPage } from './pages/JobsPage';
import { JobsViewProvider } from './state/jobs-view';

export default function App() {
  return (
    <ResumeSessionProvider>
      <JobsViewProvider>
        <Header />
        <Routes>
          <Route path='/' element={<TailorPage />} />
          <Route path='/result' element={<ResultPage />} />
          <Route path='/master' element={<MasterResumePage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
          <Route path='/jobs' element={<JobsPage />} />
        </Routes>
      </JobsViewProvider>
    </ResumeSessionProvider>
  );
}
