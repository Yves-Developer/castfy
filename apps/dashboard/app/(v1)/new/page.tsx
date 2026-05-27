import { AppSiteHeader } from "@/features/_layout/app-header";
import { NewHero } from "@/features/new/hero";
import { NewDemoForm } from "@/features/new/new-form";
export default function NewDemo() {
  return (
    <>
      <AppSiteHeader>
        <span className="text-sm">New demo</span>
      </AppSiteHeader>

      <div className="container mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-5">
        <NewHero />
        <NewDemoForm />
      </div>
    </>
  );
}
