import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout';
import { Cursor } from './components/Cursor';
import { IntroLoader } from './components/IntroLoader';
import { PortalProvider } from './components/Portal';
import { RouteTransition } from './components/RouteTransition';
import { SmoothScroll } from './components/SmoothScroll';
import { ToastProvider } from './components/Toasts';

const pages = {
  home: () => import('./pages/home/Home'),
  onboarding: () => import('./pages/app/Onboarding'),
  dashboard: () => import('./pages/app/Dashboard'),
  drills: () => import('./pages/app/Drills'),
  drill: () => import('./pages/app/DrillDetail'),
  nutrition: () => import('./pages/app/Nutrition'),
  progress: () => import('./pages/app/Progress'),
  plan: () => import('./pages/app/Plan'),
  coach: () => import('./pages/app/Coach'),
  learn: () => import('./pages/app/Learn'),
  article: () => import('./pages/app/Article'),
  profile: () => import('./pages/app/Profile'),
  notFound: () => import('./pages/app/NotFound'),
};

const Home = lazy(pages.home);
const Onboarding = lazy(pages.onboarding);
const Dashboard = lazy(pages.dashboard);
const Drills = lazy(pages.drills);
const DrillDetail = lazy(pages.drill);
const Nutrition = lazy(pages.nutrition);
const Progress = lazy(pages.progress);
const Plan = lazy(pages.plan);
const Coach = lazy(pages.coach);
const Learn = lazy(pages.learn);
const Article = lazy(pages.article);
const Profile = lazy(pages.profile);
const NotFound = lazy(pages.notFound);

/** Warm the other screens once the first one is idle, so navigation feels instant. */
function usePrefetch() {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = idle(() => Object.values(pages).forEach((load) => load()));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, []);
}

function FullScreenFallback() {
  return <div className="fullscreen-fallback theme-dark" aria-busy="true" />;
}

export default function App() {
  usePrefetch();
  return (
    <SmoothScroll>
      <PortalProvider>
        <ToastProvider>
          <IntroLoader>
            <RouteTransition>
              {(location) => (
                <Suspense fallback={<FullScreenFallback />}>
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/start" element={<Onboarding />} />
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/drills" element={<Drills />} />
                      <Route path="/drills/:id" element={<DrillDetail />} />
                      <Route path="/nutrition" element={<Nutrition />} />
                      <Route path="/progress" element={<Progress />} />
                      <Route path="/plan" element={<Plan />} />
                      <Route path="/coach" element={<Coach />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/learn/:slug" element={<Article />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              )}
            </RouteTransition>
          </IntroLoader>
          <Cursor />
        </ToastProvider>
      </PortalProvider>
    </SmoothScroll>
  );
}
