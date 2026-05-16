import { WaitlistSection } from "@/components/waitlist-section";
export default function Home() {
  return (
    <>
      <WaitlistSection />
      <div className="container py-10">
        <div className="font-mono text-muted-foreground text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </>
  );
}
