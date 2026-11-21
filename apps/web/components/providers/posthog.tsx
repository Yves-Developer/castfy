"use client";

import { PostHogProvider as PHProvider } from "@posthog/react";

import posthog from "posthog-js";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-05-30",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <IdentifySignedIn />
      {children}
    </PHProvider>
  );
}

/**
 * Once someone is signed in on the site (to buy, or to approve the desktop
 * app at /device), their visits join their Castfy account: the same id the
 * app identifies with and a purchase is recorded under. A website download
 * and the app's first launch are then one person's journey, not two.
 */
function IdentifySignedIn() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  useEffect(() => {
    if (!user?.id) {
      return;
    }
    if (posthog.get_distinct_id() !== user.id) {
      posthog.identify(user.id, { email: user.email, name: user.name });
    }
  }, [user?.id, user?.email, user?.name]);
  return null;
}
