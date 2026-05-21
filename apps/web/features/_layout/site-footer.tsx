import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";

const socialLinks = [
  {
    href: "#",
    label: "X",
    icon: <XIcon />,
  },
];

export function SiteFooter() {
  return (
    <footer className="* container mt-20 mb-8 w-full">
      <div className="flex flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <Link className="font-semibold text-xl" href="/">
            {siteConfig.name}
          </Link>
          <div className="flex items-center">
            {socialLinks.map(({ href, label, icon }) => (
              <Button asChild key={label} size="icon-sm" variant="ghost">
                <a aria-label={label} href={href}>
                  {icon}
                </a>
              </Button>
            ))}
          </div>
        </div>

        <nav>
          <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a className="hover:text-foreground" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center justify-between gap-4 border-t py-4 text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>

        <ThemeSwitcher />
      </div>
    </footer>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>X / Twitter</title>
      <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
    </svg>
  );
}
