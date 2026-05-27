import { Button } from "@workspace/ui/components/button";
import { ClapperboardIcon } from "lucide-react";
import Link from "next/link";
import { AppSiteHeader } from "@/features/_layout/app-header";
import { AnalyticCards } from "@/features/home/analytic-cards";
export default function Home() {
  return (
    <>
      <AppSiteHeader showChevron={false}>
        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            className="rounded-full"
            size="sm"
            variant={"secondary"}
          >
            <Link href="/new">
              <ClapperboardIcon />
              New demo
            </Link>
          </Button>
        </div>
      </AppSiteHeader>

      <div className="@container/main container flex flex-col gap-5 py-4">
        <AnalyticCards />
        <div>Recent demos in table with labels</div>
      </div>
    </>
  );
}
