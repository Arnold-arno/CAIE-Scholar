import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { queryClientInstance } from '@/lib/query-client';
import { AppProvider, useAppContext } from '@/context/AppContext';
import Layout        from '@/layouts/Layout';
import Onboarding    from '@/components/academic/Onboarding';
import Home          from '@/pages/Home';
import Login         from '@/pages/Login';
import Signup        from '@/pages/Signup';
import AcademicSuite from '@/pages/AcademicSuite';
import ASLevelSuite  from '@/pages/ASLevelSuite';
import OLevelSuite   from '@/pages/OLevelSuite';
import '@/index.css';

const NO_LAYOUT = ['/login', '/signup', '/onboarding'];

function AppRoutes() {
  const location = useLocation();
  const { showOnboarding } = useAppContext();
  const noLayout = NO_LAYOUT.includes(location.pathname);

  // /onboarding is only accessible when showOnboarding is true (set after signup)
  // Any other direct nav to /onboarding when not freshly signed up redirects home
  if (location.pathname === '/onboarding' && !showOnboarding) {
    return <Navigate to="/" replace />;
  }

  const routes = (
    <Routes>
      <Route path="/"              element={<Home />} />
      <Route path="/Home"          element={<Home />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/signup"        element={<Signup />} />
      <Route path="/onboarding"    element={<Onboarding />} />
      <Route path="/AcademicSuite" element={<AcademicSuite />} />
      <Route path="/ASLevelSuite"  element={<ASLevelSuite />} />
      <Route path="/OLevelSuite"   element={<OLevelSuite />} />
      <Route path="*"              element={<Home />} />
    </Routes>
  );

  return noLayout ? routes : <Layout>{routes}</Layout>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </AppProvider>
);
