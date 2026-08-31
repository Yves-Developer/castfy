import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import Providers from '@/components/providers';
import { CLIENTS_CHANGED } from '@/lib/events';
import { bridge } from '@/lib/bridge';
import { Onboarding } from '@/features/app/onboarding';
import ArchivedDemos from './routes/archived';
import DemoPage from './routes/demo';
import DemoLayout from './routes/demo-layout';
import Home from './routes/home';
import HomeLayout from './routes/home-layout';
import RecordingsPage from './routes/recordings';

/**
 * Setup reached as a route rather than as the first-run gate.
 *
 * The gate stops rendering on its own once a client is connected. This route
 * renders because it was navigated to, so finishing has to navigate away —
 * otherwise the button appears to do nothing.
 */
function SetupRoute({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  return (
    <Onboarding
      onDone={() => {
        onDone();
        navigate('/');
      }}
    />
  );
}

/**
 * Route table mirroring the dashboard's app/ directory. Nested routes stand in
 * for its route groups: HomeLayout is (app)/(home), DemoLayout is (app)/(demo).
 * There is no /login — the desktop app connects an agent instead.
 */
export default function App() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  const evaluateGate = useCallback(() => {
    // Detection is the only thing that decides this. A remembered "setup is
    // done" flag was wrong: disconnecting every client left the flag set, so
    // the app stayed open on a library it could no longer record into.
    bridge
      .detect()
      .then((d) => setNeedsSetup(!d.clients.some((c) => c.status === 'connected')))
      .catch(() => setNeedsSetup(true));
  }, []);

  useEffect(() => {
    evaluateGate();

    // Re-check when the window regains focus, so disconnecting everything in
    // settings takes effect without a restart.
    window.addEventListener('focus', evaluateGate);
    window.addEventListener(CLIENTS_CHANGED, evaluateGate);
    return () => {
      window.removeEventListener('focus', evaluateGate);
      window.removeEventListener(CLIENTS_CHANGED, evaluateGate);
    };
  }, [evaluateGate]);

  const finishSetup = useCallback(() => {
    setNeedsSetup(false);
  }, []);

  return (
    <Providers>
      {needsSetup === null ? null : needsSetup ? (
        <Onboarding onDone={finishSetup} />
      ) : (
        <Routes>
          <Route element={<HomeLayout />}>
            <Route element={<Home />} index />
            <Route element={<ArchivedDemos />} path="archived" />
            <Route element={<RecordingsPage />} path="recordings" />
          </Route>
          <Route element={<DemoLayout />} path="demo/:slug">
            <Route element={<DemoPage />} index />
          </Route>
          <Route element={<SetupRoute onDone={finishSetup} />} path="setup" />
        </Routes>
      )}
    </Providers>
  );
}
