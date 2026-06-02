import { Cta } from "@/features/_layout/cta";
import { Footer } from "@/features/_layout/footer";
import { Header } from "@/features/_layout/header";
import { Suspense } from "react";

export default function AppLayout(props: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-svh flex-col">
   <Suspense>
       <Header />
   </Suspense>
      <main className="flex flex-1 flex-col pt-16 xl:max-w-360 mx-auto  overflow-hidden ">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}
