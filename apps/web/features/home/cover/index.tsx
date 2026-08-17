import Image from "next/image";
import cover from "@/public/hero-cover.jpg";
import { CoverCmsHeader } from "./header";
import CoverCmsSidebar from "./sidebar";
import { CoverCmsTable } from "./table";
export function HeroCover() {
  return (
    <>
      <div className="relative hidden rounded-xl border bg-secondary/50 xl:block dark:bg-background">
        <div className="absolute inset-0 z-10" />
        <CoverCmsHeader />
        <div>
          <CoverCmsSidebar />
          <main className="absolute top-12.75 right-0 bottom-0 left-65">
            <CoverCmsTable />
          </main>
        </div>
      </div>
      <div className="aspect-[1.5277] xl:hidden">
        <Image
          alt="Hero cover"
          className="size-full rounded-lg object-cover"
          height="1516"
          sizes="1161.0554px"
          src={cover}
          width="2316"
        />
      </div>
    </>
  );
}
