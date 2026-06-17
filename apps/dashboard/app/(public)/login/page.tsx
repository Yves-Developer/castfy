import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LoginAccordion } from "@/features/public/login/login-accordion";
import { LoginVideoBackground } from "@/features/public/login/login-video-background";
import { OAuthSignIn } from "@/features/public/login/oauth-sign-in";
import { OTPSignIn } from "@/features/public/login/otp-sign-in";
import { Cookies } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Login",
};

export default async function Page() {
  const cookieStore = await cookies();
  const preferred = cookieStore.get(Cookies.PreferredSignInProvider);

  let moreSignInOptions = null;
  let preferredSignInOption = (
    <OAuthSignIn
      provider="google"
      showLastUsed={!preferred?.value || preferred?.value === "google"}
    />
  );

  switch (preferred?.value) {
    case "github":
      preferredSignInOption = <OAuthSignIn provider="github" showLastUsed />;
      moreSignInOptions = (
        <>
          <OAuthSignIn provider="google" />
          <OTPSignIn className="border-border border-t pt-8" />
        </>
      );
      break;

    case "google":
      preferredSignInOption = <OAuthSignIn provider="google" showLastUsed />;
      moreSignInOptions = (
        <>
          <OAuthSignIn provider="github" />
          <OTPSignIn className="border-border border-t pt-8" />
        </>
      );
      break;

    case "otp":
      preferredSignInOption = <OTPSignIn />;
      moreSignInOptions = (
        <>
          <OAuthSignIn provider="google" />
          <OAuthSignIn provider="github" />
        </>
      );
      break;

    default:
      moreSignInOptions = (
        <>
          <OAuthSignIn provider="github" />
          <OTPSignIn className="border-border border-t pt-8" />
        </>
      );
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Left Side - Video Background */}
      <LoginVideoBackground />

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 pb-2 lg:w-1/2 lg:p-12">
        <div className="flex h-full w-full max-w-md flex-col">
          <div className="flex flex-1 flex-col justify-center space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="mb-4 font-serif text-lg lg:text-xl">
                Welcome to {siteConfig.name}
              </h1>
              <p className="font-sans text-[#878787] text-sm">
                Sign in or create an account
              </p>
            </div>

            {/* Sign In Options */}
            <div className="flex w-full items-center justify-center space-y-3">
              {preferredSignInOption}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-border border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 font-sans text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* More Options Accordion */}
            <LoginAccordion>{moreSignInOptions}</LoginAccordion>
          </div>

          {/* Terms and Privacy Policy - Bottom aligned */}
          <div className="mt-auto text-center">
            <p className="font-sans text-[#878787] text-xs">
              By signing in you agree to our{" "}
              <Link
                className="text-muted-foreground underline transition-colors hover:text-foreground"
                href={`https://${siteConfig.url}/terms`}
              >
                Terms of service
              </Link>{" "}
              &{" "}
              <Link
                className="text-muted-foreground underline transition-colors hover:text-foreground"
                href={`https://${siteConfig.url}/policy`}
              >
                Privacy policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
