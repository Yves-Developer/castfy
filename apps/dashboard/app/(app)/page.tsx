import AppHeader from "@/features/app/home/header";
import AppSidebar from "@/features/app/home/sidebar";
import AppTimelines from "@/features/app/home/timelines";
import AppVideoEditor from "@/features/app/home/video-editor";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />

      <main className="flex min-h-0 flex-1">
        <aside className="w-96 border-r">
          <AppSidebar />
        </aside>

        <section className="min-w-0 flex-1">
          <AppVideoEditor />
        </section>
      </main>

      <footer className="h-30 border-t">
        <AppTimelines />
      </footer>
    </div>
  );
}
