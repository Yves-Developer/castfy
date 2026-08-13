import HomeSidebar from "./sibebar";

export function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <HomeSidebar className="fixed inset-y-0 left-0 w-65" />

      <div className="ml-65 flex min-h-screen flex-col">
        <main className="flex w-full min-w-0 flex-1 overflow-x-auto px-12.5 py-15">
          {children}
        </main>
      </div>
    </div>
  );
}
