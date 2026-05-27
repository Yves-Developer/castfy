import { AppSiteHeader } from "@/features/_layout/app-header";
import { HomeHero } from "@/features/home/hero";
import { NewDemoForm } from "@/features/home/new-form";
export default function NewDemo() {
  return (
    <>
      <AppSiteHeader>
        <span>New demo</span>
      </AppSiteHeader>

      <div className="container mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-5">
        <HomeHero />
        <NewDemoForm />
      </div>
    </>
  );
}
