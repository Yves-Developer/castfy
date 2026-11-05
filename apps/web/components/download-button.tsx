"use client";

import { useEffect, useState } from "react";
import { FaApple, FaWindows } from "react-icons/fa6";
import { siteConfig } from "@/config/site";
import { SiteButton } from "./site-button";

const MOBILE = /Android|iPhone|iPad|iPod/i;
const WINDOWS = /Windows/i;
const MAC = /Macintosh|Mac OS X/i;
const MAC_NAME = /Macintosh/;

/** What the visitor is on, as far as the browser says. */
export type Platform = "mac" | "windows" | "other" | "mobile";

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPads ask for the desktop site and say "Macintosh"; touch gives them away.
  if (MOBILE.test(ua) || (MAC_NAME.test(ua) && navigator.maxTouchPoints > 1)) {
    return "mobile";
  }
  if (WINDOWS.test(ua)) {
    return "windows";
  }
  if (MAC.test(ua)) {
    return "mac";
  }
  return "other";
}

/** The visitor's platform, once known after the first render. */
export function usePlatform() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => setPlatform(detectPlatform()), []);
  return platform;
}

/**
 * Download for the visitor's computer: the Mac build (Apple silicon) on a
 * Mac, the Windows installer on Windows, the releases page elsewhere. On a
 * phone, where there is nothing to install, it is not shown.
 */
export function DownloadButton({
  size = "md",
  variant = "primary",
  className,
}: {
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  className?: string;
}) {
  const platform = usePlatform();
  if (platform === "mobile") {
    return null;
  }
  if (platform === "mac") {
    return (
      <SiteButton
        className={className}
        download
        href="/download/mac"
        icon={<FaApple />}
        size={size}
        variant={variant}
      >
        Download for Mac
      </SiteButton>
    );
  }
  if (platform === "windows") {
    return (
      <SiteButton
        className={className}
        download
        href="/download/windows"
        icon={<FaWindows />}
        size={size}
        variant={variant}
      >
        Download for Windows
      </SiteButton>
    );
  }
  return (
    <SiteButton
      className={className}
      external
      href={`${siteConfig.releasesUrl}/latest`}
      size={size}
      variant={variant}
    >
      Download
    </SiteButton>
  );
}

/** The other builds, in a line under a download button. */
export function OtherDownloads({ className }: { className?: string }) {
  const platform = usePlatform();
  const link =
    "underline decoration-border underline-offset-4 hover:text-foreground";
  if (platform === "mac") {
    return (
      <p className={className}>
        <a className={link} href="/download/mac-intel">
          Intel Mac
        </a>{" "}
        ·{" "}
        <a className={link} href="/download/windows">
          Windows
        </a>
      </p>
    );
  }
  if (platform === "windows") {
    return (
      <p className={className}>
        Also for Mac:{" "}
        <a className={link} href="/download/mac">
          Apple silicon
        </a>{" "}
        ·{" "}
        <a className={link} href="/download/mac-intel">
          Intel
        </a>
      </p>
    );
  }
  if (platform === "mobile") {
    return (
      <p className={className}>Castfy runs on a Mac or Windows computer.</p>
    );
  }
  return null;
}
