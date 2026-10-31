import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import Providers from '@/components/providers';
import { CLIENTS_CHANGED } from '@/lib/events';
import { bridge } from '@/lib/bridge';
import { useAccount } from '@/lib/use-account';
import { Onboarding } from '@/features/app/onboarding';
import { RecorderSetup } from '@/features/app/onboarding/recorder-setup';
import { ChoosePlan } from '@/features/app/onboarding/choose-plan';
import { SignIn } from '@/features/app/onboarding/sign-in';
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
 * Dev only: VITE_FORCE_ONBOARDING=1 shows the first-run gate on every launch,
 * even with an agent connected, so onboarding can be worked on without
 * disconnecting anything. Finishing it still dismisses it until reload.
 */
const FORCE_ONBOARDING =
  import.meta.env.DEV && import.meta.env.VITE_FORCE_ONBOARDING === '1';

/**
 * Route table mirroring the dashboard's app/ directory. Nested routes stand in
 * for its route groups: HomeLayout is (app)/(home), DemoLayout is (app)/(demo).
 * There is no /login route: signing in is the first onboarding gate, done in
 * the browser (onboarding/sign-in.tsx).
 */
export default function App() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  /**
   * First gate: a Castfy account. Kept current by account:changed, so signing
   * in (or out, from settings) moves the app without a reload.
   */
  const account = useAccount();
  /** Dev only: lets onboarding past sign-in while the backend isn't running. */
  const [skippedSignIn, setSkippedSignIn] = useState(false);
  /**
   * Checked before the agent gate: without the browser nothing can record or
   * export, whichever agent is connected. Asked once per launch — it only
   * changes when the download below finishes.
   */
  const [browsersReady, setBrowsersReady] = useState<boolean | null>(null);
  /**
   * Second gate, after sign-in: the plan step, answered once. FORCE_ONBOARDING
   * shows it again until it is answered this session.
   */
  const [planChosen, setPlanChosen] = useState<boolean | null>(null);

  useEffect(() => {
    bridge
      .browserStatus()
      .then((status) => setBrowsersReady(status.ready))
      .catch(() => setBrowsersReady(false));
    bridge
      .settings()
      .then((s) => setPlanChosen(Boolean(s.planChosen) && !FORCE_ONBOARDING))
      .catch(() => setPlanChosen(false));
  }, []);

  const markPlanChosen = useCallback(() => setPlanChosen(true), []);

  const markBrowsersReady = useCallback(() => setBrowsersReady(true), []);

  /** Only read with FORCE_ONBOARDING: whether it was finished this session. */
  const finishedForcedOnboarding = useRef(false);

  const evaluateGate = useCallback(() => {
    if (FORCE_ONBOARDING && !finishedForcedOnboarding.current) {
      setNeedsSetup(true);
      return;
    }
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
    finishedForcedOnboarding.current = true;
    setNeedsSetup(false);
  }, []);

  // Every check is asynchronous; render nothing rather than flash a screen.
  if (account === null || browsersReady === null || needsSetup === null || planChosen === null) {
    return <Providers>{null}</Providers>;
  }

  if (account.status === 'signed-out' && !skippedSignIn) {
    return (
      <Providers>
        <SignIn onSkip={import.meta.env.DEV ? () => setSkippedSignIn(true) : undefined} />
      </Providers>
    );
  }

  // Skipping sign-in (dev only) skips this too: there is no account to bill.
  if (account.status === 'signed-in' && !planChosen) {
    return (
      <Providers>
        <ChoosePlan onDone={markPlanChosen} />
      </Providers>
    );
  }

  if (!browsersReady) {
    return (
      <Providers>
        <RecorderSetup onReady={markBrowsersReady} />
      </Providers>
    );
  }

  return (
    <Providers>
      {needsSetup ? (
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
