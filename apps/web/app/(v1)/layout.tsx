import { Suspense } from "react";
import { SiteFooter } from "@/features/_layout/site-footer";
import { SiteHeader } from "@/features/_layout/site-header";

export default function AppLayout(props: LayoutProps<"/">) {
  return (
    <div className="relative z-10 flex min-h-svh flex-col">
      <Suspense>
        <SiteHeader />
      </Suspense>
      <main className="@container container mx-auto flex flex-1 flex-col pt-16 xl:max-w-360">
        {props.children}
      </main>
      <SiteFooter />
    </div>
  );
}
