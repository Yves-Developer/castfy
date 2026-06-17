"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getUrl } from "@/lib/environment";

export type OAuthProvider = "google" | "github";

interface ProviderConfig {
  icon: "Google" | "Github";
  name: string;
  queryParams?: Record<string, string>;
  scopes?: string;
  supportsReturnTo: boolean;
  variant: "primary" | "secondary";
}

const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    name: "Google",
    icon: "Google",
    queryParams: { prompt: "select_account" },
    variant: "secondary",
    supportsReturnTo: true,
  },

  github: {
    name: "Github",
    icon: "Github",
    variant: "secondary",
    supportsReturnTo: true,
  },
};

export function useOAuthSignIn(provider: OAuthProvider) {
  const [isLoading, setLoading] = useState(false);
  // const supabase = createClient();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to");
  const config = OAUTH_PROVIDERS[provider];

  const handleSignIn = () => {
    setLoading(true);

    const redirectTo = new URL("/api/auth/callback", getUrl());
    redirectTo.searchParams.append("provider", provider);

    // const isDesktop = isDesktopApp();

    if (config.supportsReturnTo && returnTo) {
      redirectTo.searchParams.append("return_to", returnTo);
    }

    // const queryParams = config.queryParams;

    // await supabase.auth.signInWithOAuth({
    //   provider: provider as Provider,
    //   options: {
    //     redirectTo: redirectTo.toString(),
    //     scopes: config.scopes,
    //     queryParams,
    //   },
    // });

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return { handleSignIn, isLoading, config };
}
