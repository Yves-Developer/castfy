import { Suspense } from "react";
import { Footer } from "@/features/_layout/footer";
import { Header } from "@/features/_layout/header";

export default function AppLayout(props: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="mx-auto flex w-full flex-1 flex-col overflow-hidden pt-16 xl:max-w-360">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}
