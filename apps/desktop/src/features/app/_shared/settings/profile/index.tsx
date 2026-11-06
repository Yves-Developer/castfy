import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import { Button } from "@castfy/ui/components/button";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { bridge } from "@/lib/bridge";
import { initials, signOut, useAccount } from "@/lib/use-account";

/**
 * "Share usage data": whether the app sends usage events (analytics.js).
 * They say which steps were reached, linked to this account, never what was
 * recorded or typed.
 */
function UsageData() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    bridge
      .settings()
      .then((s) => setOn(s.analytics !== false))
      .catch(() => setOn(true));
  }, []);
  if (on === null) {
    return null;
  }
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3.5">
      <input
        checked={on}
        className="mt-0.5 size-3.5 accent-foreground"
        onChange={(e) => {
          const next = e.target.checked;
          setOn(next);
          bridge.setSettings({ analytics: next }).catch(() => {
            // Preference only; the next event reads whatever was saved.
          });
        }}
        type="checkbox"
      />
      <span className="flex flex-col gap-0.5">
        <span className="font-medium text-[13px]">Share usage data</span>
        <span className="text-[11px] text-muted-foreground">
          Which steps you reach (a demo started, finished, exported) and how
          long they took, with your app version, so we can see where Castfy
          gets stuck. Never what you record, type or name.
        </span>
      </span>
    </label>
  );
}

/**
 * The signed-in account, as Google reports it. Read-only: Google is the only
 * sign-in, so the name, email and photo are changed in the Google account and
 * picked up here the next time the app checks the session.
 */
export function AccountProfile() {
  const account = useAccount();
  const [signingOut, setSigningOut] = useState(false);

  if (account?.status !== "signed-in") {
    return (
      <p className="m-auto text-muted-foreground text-xs">
        You're not signed in.
      </p>
    );
  }
  const { user } = account;

  return (
    <div className="flex h-full flex-col gap-7.5">
      <div className="flex flex-col items-center gap-3">
        <Avatar className="size-20">
          {user.image ? (
            <AvatarImage alt="" referrerPolicy="no-referrer" src={user.image} />
          ) : null}
          <AvatarFallback className="text-lg">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
      </div>

      <dl className="flex flex-1 flex-col gap-5 text-xs">
        <ProfileRow label="Name" value={user.name || "—"} />
        <ProfileRow label="Email" value={user.email} />
        <p className="text-muted-foreground">
          Signed in with Google. To change your name, email or photo, update
          your Google account.
        </p>
      </dl>

      <UsageData />

      <Button
        className="w-full"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true);
          await signOut();
        }}
        size="md"
        variant="secondary"
      >
        {signingOut ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
        Sign out
      </Button>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-medium">{label}</dt>
      <dd className="truncate rounded-md bg-input/50 px-2.5 py-1.5">{value}</dd>
    </div>
  );
}
