"use client";

import { SubmitButton } from "@castfy/ui/components/submit-button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { type OAuthProvider, useOAuthSignIn } from "@/hooks/use-oauth-sign-in";

type Props = {
  provider: OAuthProvider;
  showLastUsed?: boolean;
};

const iconMap = {
  Google: FcGoogle,
  Github: FaGithub,
} as const;

export function OAuthSignIn({ provider, showLastUsed = false }: Props) {
  const { handleSignIn, isLoading, config } = useOAuthSignIn(provider);
  const Icon = iconMap[config.icon];

  return (
    <div className="relative w-full">
      <SubmitButton
        type="button"
        onClick={handleSignIn}
        isSubmitting={isLoading}
        variant={"outline"}
        className="w-full"
        size="xl"
      >
        <div className="flex items-center justify-center gap-2">
          <Icon size={16} />
          <span>Continue with {config.name}</span>
        </div>
      </SubmitButton>
      {showLastUsed && !isLoading && (
        <div className="absolute top-4.5 right-3 -translate-y-1/2 pointer-events-none">
          <span className="font-sans text-[10px] text-muted-foreground">
            Last used
          </span>
        </div>
      )}
    </div>
  );
}
