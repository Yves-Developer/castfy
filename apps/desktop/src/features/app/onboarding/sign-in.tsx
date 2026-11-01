import { Button } from "@castfy/ui/components/button";
import { ExternalLinkIcon, Loader2Icon, MousePointer2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import type { SignInProgress } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";

type Step =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "waiting"; userCode: string }
  | { kind: "failed"; message: string };

const FAILURE_COPY: Record<"denied" | "expired", string> = {
  denied: "Sign-in was denied in the browser.",
  expired: "The sign-in code expired before it was approved.",
};

/** The code as the website shows it: ABCD-EFGH. */
function formatCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

/**
 * First onboarding step: sign in to a Castfy account.
 *
 * Sign-in happens in the browser (the device flow in account.js), so the app
 * never handles Google's sign-in itself, only the session it ends in. This
 * screen only starts it and shows the code to match on the website; the app
 * leaves it on its own when account:changed reports a signed-in account.
 */
export function SignIn({ onSkip }: { onSkip?: () => void }) {
  const [step, setStep] = useState<Step>({ kind: "idle" });

  useEffect(
    () =>
      bridge.onSignInProgress((progress: SignInProgress) => {
        switch (progress.status) {
          case "waiting":
            setStep({ kind: "waiting", userCode: progress.userCode });
            break;
          case "denied":
          case "expired":
            setStep({ kind: "failed", message: FAILURE_COPY[progress.status] });
            break;
          case "error":
            setStep({ kind: "failed", message: progress.message });
            break;
          default:
            // "done": the account change takes this screen away.
            break;
        }
      }),
    []
  );

  const start = async () => {
    setStep({ kind: "starting" });
    const result = await bridge.signIn();
    if (!result.ok) {
      setStep({ kind: "failed", message: result.error });
      return;
    }
    setStep({ kind: "waiting", userCode: result.userCode });
  };

  const cancel = async () => {
    await bridge.cancelSignIn();
    setStep({ kind: "idle" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="flex w-full max-w-100 flex-col items-center gap-7 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary">
          <MousePointer2Icon className="size-5 rotate-90 fill-foreground" />
        </span>

        {step.kind === "waiting" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-semibold text-lg tracking-tight">
                Finish signing in in your browser
              </h1>
              <p className="text-balance text-muted-foreground text-sm">
                Approve the request on the page that just opened. Check that it
                shows this code:
              </p>
            </div>
            <p className="rounded-lg bg-secondary px-4 py-2 font-mono text-lg tracking-[0.2em]">
              {formatCode(step.userCode)}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2Icon className="size-3.5 animate-spin" />
              Waiting for approval…
            </div>
            <div className="flex gap-2">
              <Button
                className="h-8 text-xs"
                onClick={() => bridge.reopenSignIn()}
                variant="secondary"
              >
                Open the page again
                <ExternalLinkIcon className="size-3" />
              </Button>
              <Button className="h-8 text-xs" onClick={cancel} variant="ghost">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-semibold text-lg tracking-tight">
                Sign in to Castfy
              </h1>
              <p className="text-balance text-muted-foreground text-sm">
                Your account holds your plan and what you've used. You'll sign
                in with Google, in your browser.
              </p>
            </div>

            {step.kind === "failed" ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs">
                {step.message}
              </p>
            ) : null}

            {/* Castfy's brand blue, as on the website's sign-in page. */}
            <Button
              className="h-9 w-full font-medium text-xs"
              disabled={step.kind === "starting"}
              onClick={start}
              variant="brand"
            >
              {step.kind === "starting" ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <FaGoogle className="size-3.5" />
              )}
              {step.kind === "failed" ? "Try again" : "Sign in with Google"}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              New to Castfy? Signing in creates your account.
            </p>
          </>
        )}

        {onSkip ? (
          <button
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
            onClick={onSkip}
            type="button"
          >
            Skip sign-in (dev only)
          </button>
        ) : null}
      </div>
    </div>
  );
}
