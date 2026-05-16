import { AppSiteHeader } from "@/features/_layout/app-header";
export default function Home() {
  return (
    <>
      <AppSiteHeader />

      <div className="container font-mono text-muted-foreground text-xs">
        (Press <kbd>d</kbd> to toggle dark mode)
      </div>
    </>
  );
}
