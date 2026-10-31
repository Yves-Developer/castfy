"use client";

import { SubmitButton } from "@castfy/ui/components/submit-button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { authClient, safeRedirect } from "@/lib/auth-client";

/**
 * Google is the only way in. Signing in creates the account on first use, so
 * there is no separate sign-up.
 */
export function SignInForm() {
  const redirectTo = safeRedirect(useSearchParams().get("redirect"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    // Navigates to Google on success, so busy stays on until the page leaves.
    const { error: signInError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo,
    });
    if (signInError) {
      setBusy(false);
      setError(signInError.message ?? "Couldn't start sign-in. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="font-medium text-xl">Sign in to Castfy</h1>
        <p className="text-muted-foreground text-sm">
          New here? Signing in creates your account.
        </p>
      </div>

      <SubmitButton
        className="w-full"
        isSubmitting={busy}
        onClick={signIn}
        variant="outline"
      >
        <FaGoogle />
        Continue with Google
      </SubmitButton>

      {error ? (
        <p className="text-center text-destructive text-sm">{error}</p>
      ) : null}
    </div>
  );
}
