import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { queryClientInstance } from '@/lib/query-client';
import { AppProvider, useAppContext } from '@/context/AppContext';
import Layout      from '@/layouts/Layout';
import Onboarding  from '@/components/academic/Onboarding';
import Home        from '@/pages/Home';
import Login       from '@/pages/Login';
import Signup      from '@/pages/Signup';
import Settings    from '@/pages/Settings';
import AcademicHub from '@/pages/AcademicHub';
import ASLevelHub  from '@/pages/ASLevelHub';
import OLevelHub   from '@/pages/OLevelHub';
import '@/index.css';
import { I18nProvider } from '@/context/I18nContext';

const NO_LAYOUT = ['/login', '/signup', '/onboarding'];

// Page wrapper with enter/exit animation
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function GlobalKeyNav() {
  const navigate = useNavigate();
  React.useEffect(() => {
    let seq = '';
    let timer = null;
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
      if (e.key === 'Escape') { window.dispatchEvent(new CustomEvent('closeAll')); return; }
      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focusSearch'));
        return;
      }
      seq += e.key.toUpperCase();
      clearTimeout(timer);
      timer = setTimeout(() => { seq = ''; }, 800);
      if (seq === 'GH') { navigate('/');           seq = ''; }
      if (seq === 'GI') { navigate('/AcademicHub'); seq = ''; }
      if (seq === 'GA') { navigate('/ASLevelHub');  seq = ''; }
      if (seq === 'GO') { navigate('/OLevelHub');   seq = ''; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const { showOnboarding } = useAppContext();
  const noLayout = NO_LAYOUT.includes(location.pathname);

  if (location.pathname === '/onboarding' && !showOnboarding) {
    return <Navigate to="/" replace />;
  }

  const routes = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/Home"          element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login"         element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup"        element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/onboarding"    element={<PageWrapper><Onboarding /></PageWrapper>} />
        <Route path="/settings"      element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/AcademicHub"   element={<PageWrapper><AcademicHub /></PageWrapper>} />
        <Route path="/ASLevelHub"    element={<PageWrapper><ASLevelHub /></PageWrapper>} />
        <Route path="/OLevelHub"     element={<PageWrapper><OLevelHub /></PageWrapper>} />
        <Route path="/AcademicSuite" element={<Navigate to="/AcademicHub" replace />} />
        <Route path="/ASLevelSuite"  element={<Navigate to="/ASLevelHub"  replace />} />
        <Route path="/OLevelSuite"   element={<Navigate to="/OLevelHub"   replace />} />
        <Route path="*"              element={<PageWrapper><Home /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );

  return noLayout ? routes : <Layout><GlobalKeyNav /><ScrollToTop />{routes}</Layout>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nProvider>
  <AppProvider>
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </AppProvider>
  </I18nProvider>
);
