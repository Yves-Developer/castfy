import { Suspense } from "react";
import { ImgCta } from "@/features/_layout/cta";
import { Header } from "@/features/_layout/header";
import { SiteFooter } from "@/features/_layout/site-footer";

export default function AppLayout(props: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="@container mx-auto flex w-full flex-1 flex-col pt-16 xl:max-w-360">
        {props.children}
      </main>
      {/* <Footer /> */}
      <ImgCta />
      <SiteFooter />
    </div>
  );
}
