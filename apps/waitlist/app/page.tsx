import { ModeSwitcher } from "@/components/mode-switcher";
import { WaitlistSection } from "@/components/waitlist";
export default function Home() {
  return (
    <>
      <WaitlistSection />
      <div className="absolute top-4 right-4">
        <ModeSwitcher />
      </div>
    </>
  );
}
