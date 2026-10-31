"use client";

import { Button } from "@castfy/ui/components/button";
import { Field, FieldLabel } from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { Spinner } from "@castfy/ui/components/spinner";
import { SubmitButton } from "@castfy/ui/components/submit-button";
import { CircleCheckIcon, CircleXIcon, MonitorIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Status =
  | { kind: "checking" }
  | { kind: "pending" }
  | { kind: "approved" }
  | { kind: "denied" }
  | { kind: "error"; message: string };

/** The code as the app shows it: ABCD-EFGH. Dashes are ignored by the API. */
function formatCode(code: string): string {
  const clean = code.replace(/-/g, "").toUpperCase();
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

/**
 * The browser half of desktop sign-in. The Castfy app opens this page with
 * ?user_code=…; once the signed-in user approves, the app's polling of
 * /device/token returns a session and the app is signed in.
 */
export function DeviceApproval() {
  const router = useRouter();
  const urlCode = useSearchParams().get("user_code");
  const [userCode, setUserCode] = useState(urlCode ?? "");
  const [submittedCode, setSubmittedCode] = useState(urlCode);
  const { data: session, isPending } = authClient.useSession();
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [busy, setBusy] = useState(false);

  const devicePath = submittedCode
    ? `/device?user_code=${encodeURIComponent(submittedCode)}`
    : "/device";

  // Signed out: sign in first, then come straight back here with the code.
  useEffect(() => {
    if (!(isPending || session)) {
      router.replace(`/login?redirect=${encodeURIComponent(devicePath)}`);
    }
  }, [isPending, session, router, devicePath]);

  // Looking the code up while signed in also claims it for this account,
  // which approving requires.
  useEffect(() => {
    if (!(session && submittedCode)) {
      return;
    }
    let cancelled = false;
    setStatus({ kind: "checking" });
    authClient
      .device({ query: { user_code: submittedCode } })
      .then(({ data, error }) => {
        if (cancelled) {
          return;
        }
        if (error || !data) {
          setStatus({
            kind: "error",
            message:
              error?.error_description ??
              "This code isn't valid. Start sign-in again from the app.",
          });
          return;
        }
        setStatus({ kind: data.status as "pending" | "approved" | "denied" });
      });
    return () => {
      cancelled = true;
    };
  }, [session, submittedCode]);

  const decide = async (approve: boolean) => {
    if (!submittedCode) {
      return;
    }
    setBusy(true);
    const request = approve
      ? authClient.device.approve({ userCode: submittedCode })
      : authClient.device.deny({ userCode: submittedCode });
    const { error } = await request;
    setBusy(false);
    if (error) {
      setStatus({
        kind: "error",
        message: error.error_description ?? "Something went wrong. Try again.",
      });
      return;
    }
    setStatus({ kind: approve ? "approved" : "denied" });
  };

  const switchAccount = async () => {
    await authClient.signOut();
    router.replace(`/login?redirect=${encodeURIComponent(devicePath)}`);
  };

  if (isPending || !session) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!submittedCode) {
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          setSubmittedCode(userCode.trim());
        }}
      >
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="font-medium text-xl">Connect the Castfy app</h1>
          <p className="text-muted-foreground text-sm">
            Enter the code the app is showing.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="user-code">Code</FieldLabel>
          <Input
            autoComplete="off"
            autoFocus
            className="text-center font-mono uppercase tracking-widest"
            id="user-code"
            onChange={(event) => setUserCode(event.target.value)}
            placeholder="ABCD-EFGH"
            required
            value={userCode}
          />
        </Field>
        <SubmitButton className="w-full" isSubmitting={false} type="submit">
          Continue
        </SubmitButton>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <DeviceStatus status={status} />

      {status.kind === "pending" ? (
        <>
          <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm tracking-widest">
            {formatCode(submittedCode)}
          </p>
          <p className="text-balance text-muted-foreground text-xs">
            Only approve if this matches the code in the app. Approving signs
            the app in as{" "}
            <span className="text-foreground">{session.user.email}</span>.
          </p>
          <div className="flex w-full flex-col gap-2">
            <SubmitButton
              className="w-full"
              isSubmitting={busy}
              onClick={() => decide(true)}
            >
              Approve
            </SubmitButton>
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => decide(false)}
              variant="ghost"
            >
              Deny
            </Button>
          </div>
          <button
            className="text-muted-foreground text-xs underline hover:text-foreground"
            onClick={switchAccount}
            type="button"
          >
            Not {session.user.email}? Use another account
          </button>
        </>
      ) : null}
    </div>
  );
}

function DeviceStatus({ status }: { status: Status }) {
  switch (status.kind) {
    case "checking":
      return <Spinner />;
    case "pending":
      return (
        <StatusHeading
          description="The Castfy app on your computer is asking to sign in."
          icon={<MonitorIcon className="size-10" />}
          title="Connect the Castfy app?"
        />
      );
    case "approved":
      return (
        <StatusHeading
          description="Go back to the Castfy app. You can close this tab."
          icon={<CircleCheckIcon className="size-10 text-emerald-500" />}
          title="The app is signed in"
        />
      );
    case "denied":
      return (
        <StatusHeading
          description="The app was not signed in. You can close this tab."
          icon={<CircleXIcon className="size-10 text-muted-foreground" />}
          title="Request denied"
        />
      );
    default:
      return (
        <StatusHeading
          description={status.message}
          icon={<CircleXIcon className="size-10 text-destructive" />}
          title="Couldn't connect the app"
        />
      );
  }
}

function StatusHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {icon}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-medium text-xl">{title}</h1>
        <p className="text-balance text-muted-foreground text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
