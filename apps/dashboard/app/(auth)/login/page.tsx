import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { LoginAccordion } from "@/features/public/login/login-accordion";
import { LoginVideoBackground } from "@/features/public/login/login-video-background";
import { OAuthSignIn } from "@/features/public/login/oauth-sign-in";
import { OTPSignIn } from "@/features/public/login/otp-sign-in";

export const metadata: Metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
function LoginPage() {
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
              <h1 className="mb-4 font-medium text-lg lg:text-xl">
                Welcome to {siteConfig.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in or create an account
              </p>
            </div>

            {/* Sign In Options */}
            <div className="flex w-full items-center justify-center space-y-3">
              <OAuthSignIn provider="google" />
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
            <LoginAccordion>
              <OAuthSignIn provider="github" />
              <OTPSignIn className="border-border border-t pt-8" />
            </LoginAccordion>
          </div>

          {/* Terms and Privacy Policy - Bottom aligned */}
          <div className="mt-auto text-center">
            <p className="font-sans text-muted-foreground text-xs">
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
