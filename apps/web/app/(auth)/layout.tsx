import { MousePointer2Icon } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/**
 * Sign-in and the pages the desktop app sends people to. No marketing header
 * or footer: these are steps in a task, usually opened from the app.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col items-center px-4 py-8">
      <Link
        aria-label={`${siteConfig.name} - Go to homepage`}
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
        href="/"
      >
        <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />
        <span className="font-medium text-foreground text-lg">
          {siteConfig.name}
        </span>
      </Link>
      <main className="flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        {children}
      </main>
    </div>
  );
}
