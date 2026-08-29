import { Button } from "@castfy/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@castfy/ui/components/sheet";
import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
export default function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden">
        <MenuIcon className="size-4.5" />
      </SheetTrigger>
      <SheetContent className="data-[side=right]:w-full">
        <SheetHeader className="pb-0">
          <SheetTitle>{siteConfig.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {siteConfig.name} menu
          </SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar flex flex-col gap-5 overflow-y-auto px-4 pt-5 pb-10">
          {navLinks.map((h) => (
            <div key={h.label}>
              <div>
                <Link className="text-lg" href={h.href as Route} key={h.href}>
                  {h.label}
                </Link>
              </div>
            </div>
          ))}
          <div className="mt-12 flex flex-col gap-2">
            <Button className="w-full" variant="outline">
              Join Waitlist
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
