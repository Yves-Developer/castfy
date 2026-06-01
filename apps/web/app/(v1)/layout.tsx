import { Cta } from "@/features/_layout/cta";
import { Footer } from "@/features/_layout/footer";
import { Header } from "@/features/_layout/header";

export default function AppLayout(props: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Header />
      <main className="@container container mx-auto flex flex-1 flex-col pt-16 xl:max-w-360">
        {props.children}
      </main>
      <Cta
        desc="Turn your url into demo today."
        link={{ href: "/", label: "Get started" }}
        title="Get started with Castfy"
      />
      <Footer />
    </div>
  );
}
