import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/features/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    // The form reads ?redirect=, which is only known in the browser.
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
