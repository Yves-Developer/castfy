import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import { Button } from "@castfy/ui/components/button";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { initials, signOut, useAccount } from "@/lib/use-account";

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
