import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ToastProvider } from '@/components/ui/overlays';
import { LanguageProvider } from '@/components/LanguageContext';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { LandingPage } from '@/pages/Landing';
import { ResponsePage } from '@/pages/Response';
import { EvidencePage } from '@/pages/Evidence';
import { ExposureScanPage } from '@/pages/ExposureScan';
import { ReportPage } from '@/pages/Report';
import { ResourcesPage } from '@/pages/Resources';
import { PrivacyPage } from '@/pages/Privacy';
import { DashboardPage } from '@/pages/Dashboard';
import '@/styles/index.css';

function App() {
  return (
    // Honour the OS reduced-motion setting for every JS-driven animation.
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <BrowserRouter>
          <ToastProvider>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/response" element={<ResponsePage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/scan" element={<ExposureScanPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<LandingPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </BrowserRouter>
      </LanguageProvider>
    </MotionConfig>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
