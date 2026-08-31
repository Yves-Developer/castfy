import { cn } from "@castfy/ui/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { footerNavs, footerSocialIcons } from "@/config/data";
import { siteConfig } from "@/config/site";
import FooterDate from "./footer-date";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-20 md:mt-30 xl:max-w-360", className)}>
      <div className="container flex w-full flex-col items-start gap-10 pt-5 pb-20 md:flex-row md:gap-25">
        <Link className="font-medium text-lg" href="/">
          {siteConfig.name}
        </Link>
        <div className="grid w-full flex-1 grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5">
          {footerNavs.map((section) => (
            <div
              className="flex w-full flex-col gap-11 first:mt-0"
              key={section.group}
            >
              {section.categories.map((cat) => (
                <div className="flex flex-col justify-between" key={cat.title}>
                  <span className="font-medium text-[15px]">{cat.title}</span>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {cat.navs.map((nav, i) => (
                      <li key={i}>
                        <Link
                          className="flex items-center gap-1 text-muted-foreground text-sm transition duration-250 hover:text-foreground"
                          href={nav.href as Route}
                          rel={nav.external ? "noopener noreferrer" : undefined}
                          target={nav.external ? "_blank" : undefined}
                        >
                          {nav.label}
                          {nav.external && (
                            <ArrowUpRightIcon className="size-3" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="container flex w-full flex-wrap items-center justify-center gap-3 md:justify-between md:gap-5 xl:max-w-360">
        <div className="flex items-center gap-3.75" id="socialmedia">
          <p className="text-muted-foreground text-xs">Follow us</p>
          <div className="flex items-center gap-2.5">
            {footerSocialIcons.map((item, i) => (
              <a href={item.href} key={i} rel="noopener" target="_blank">
                <item.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <Suspense>
          <FooterDate />
        </Suspense>

        <ThemeSwitcher />
      </div>
      <div className="overflow-hidden sm:transform">
        <h1
          className={cn(
            "-mb-60 select-none text-[200px] leading-none sm:text-[508px]",
            "text-secondary",
            "[WebkitTextStroke:1px_var(--muted-foreground)]",
            "[textStroke:1px_var(--muted-foreground)]"
          )}
          style={{
            WebkitTextStroke: "1px var(--muted-foreground)",
            color: "var(--secondary)",
          }}
        >
          {siteConfig.name}
        </h1>
      </div>
    </footer>
  );
}
