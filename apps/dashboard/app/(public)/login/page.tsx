import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { LoginAccordion } from "@/features/public/login/login-accordion";
import { LoginVideoBackground } from "@/features/public/login/login-video-background";
import { OAuthSignIn } from "@/features/public/login/oauth-sign-in";
import { OTPSignIn } from "@/features/public/login/otp-sign-in";
import { Cookies } from "@/utils/constants";

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
          <OTPSignIn className="border-t border-border pt-8" />
        </>
      );
      break;

    case "google":
      preferredSignInOption = <OAuthSignIn provider="google" showLastUsed />;
      moreSignInOptions = (
        <>
          <OAuthSignIn provider="github" />
          <OTPSignIn className="border-t border-border pt-8" />
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
          <OTPSignIn className="border-t border-border pt-8" />
        </>
      );
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Left Side - Video Background */}
      <LoginVideoBackground />

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 pb-2">
        <div className="w-full max-w-md flex flex-col h-full">
          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-lg lg:text-xl mb-4 font-serif">
                Welcome to {siteConfig.name}
              </h1>
              <p className="font-sans text-sm text-[#878787]">
                Sign in or create an account
              </p>
            </div>

            {/* Sign In Options */}
            <div className="space-y-3 flex items-center justify-center w-full">
              {preferredSignInOption}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background font-sans text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* More Options Accordion */}
            <LoginAccordion>{moreSignInOptions}</LoginAccordion>
          </div>

          {/* Terms and Privacy Policy - Bottom aligned */}
          <div className="text-center mt-auto">
            <p className="font-sans text-xs text-[#878787]">
              By signing in you agree to our{" "}
              <Link
                href={`https://${siteConfig.url}/terms`}
                className="text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Terms of service
              </Link>{" "}
              &{" "}
              <Link
                href={`https://${siteConfig.url}/policy`}
                className="text-muted-foreground hover:text-foreground transition-colors underline"
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
