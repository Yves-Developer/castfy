import DemoHeader from "@/features/app/demo/header";
import DemoSidebar from "@/features/app/demo/sidebar";

export default function DemoLayout(props: LayoutProps<"/demos/[slug]">) {
  return (
    <div className="flex h-screen flex-col">
      <DemoHeader />
      <div>
        <DemoSidebar />
        <main className="absolute top-12.75 right-0 bottom-0 left-65">
          {props.children}
        </main>
      </div>
    </div>
  );
}
