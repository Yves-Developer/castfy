import { DashboardHeader } from "@/features/_layout/header";
import { AnalyticCards } from "@/features/home/analytic-cards";
import RecentDemos from "@/features/home/recent";
export default function Home() {
  return (
    <>
      <DashboardHeader title="Overview" />
      <div className="@container/main container flex flex-col gap-5 py-4">
        <AnalyticCards />
        <RecentDemos />
      </div>
    </>
  );
}
