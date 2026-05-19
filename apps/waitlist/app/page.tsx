import { Spotlight } from "@/components/custom/spotlight";
import { HomeLines } from "@/components/lines";
import { ModeSwitcher } from "@/components/mode-switcher";
import { WaitlistSection } from "@/components/waitlist";
export default function Home() {
  return (
    <>
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <WaitlistSection />
      <HomeLines />
      <div className="absolute right-4 bottom-4">
        <ModeSwitcher />
      </div>
    </>
  );
}
