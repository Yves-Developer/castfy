"use client";

import { siteConfig } from "@/config/site";

export default function FooterDate() {
  return (
    <p className="text-center text-muted-foreground text-xs">
      © {new Date().getFullYear()} {siteConfig.name}
    </p>
  );
}
