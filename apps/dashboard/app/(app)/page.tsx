import { Button } from "@castfy/ui/components/button";
import { CircleFadingPlusIcon } from "lucide-react";
import Link from "next/link";
import { AppSiteHeader } from "@/features/_layout/app-header";
import { AnalyticCards } from "@/features/home/analytic-cards";
import RecentDemos from "@/features/home/recent";
export default function Home() {
  return (
    <>
      <AppSiteHeader />

      <div className="@container/main container flex flex-col gap-5 py-4">
        <AnalyticCards />
        <RecentDemos />
      </div>
    </>
  );
}
