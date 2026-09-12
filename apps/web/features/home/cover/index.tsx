import Image from "next/image";
import coverDark from "@/public/cover-dark.png";
import coverLight from "@/public/cover-light.png";

import { StudioEditor } from "./editor";
import { CoverCmsHeader } from "./header";
import CoverCmsSidebar from "./sidebar";
export function HeroCover() {
  return (
    <>
      <div className="relative hidden rounded-xl border bg-secondary/50 xl:block dark:bg-background">
        <div className="absolute inset-0 z-20" />
        <CoverCmsHeader />
        <div>
          <CoverCmsSidebar />
          <main className="absolute top-12.75 right-0 bottom-0 left-65">
            <StudioEditor />
          </main>
        </div>
      </div>
      <div className="hidden xl:hidden dark:block dark:xl:hidden">
        <Image
          alt="Hero cover"
          className="size-full rounded-lg object-cover"
          height={1516}
          sizes="1161.0554px"
          src={coverDark}
          width={2316}
        />
      </div>

      <div className="block xl:hidden dark:hidden">
        <Image
          alt="Hero cover"
          className="size-full rounded-lg object-cover"
          height={1516}
          sizes="1161.0554px"
          src={coverLight}
          width={2316}
        />
      </div>
    </>
  );
}
