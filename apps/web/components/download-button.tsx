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
export type Platform = "mac" | "mac-intel" | "windows" | "other" | "mobile";

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

const APPLE_CHIP = /Apple M\d/i;
const OTHER_GPU = /Intel|AMD|Radeon|NVIDIA|GeForce/i;

/**
 * Whether a Mac has Apple silicon or an Intel chip. The user agent can't say:
 * every Mac browser reports "Intel Mac OS X". Chrome and Edge answer when
 * asked; Safari and Firefox are told apart by the graphics chip. Null when
 * there is no telling, and the Apple silicon build stays the default.
 */
export async function detectMacChip(): Promise<"arm" | "intel" | null> {
  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues(
          hints: string[]
        ): Promise<{ architecture?: string }>;
      };
    }
  ).userAgentData;
  if (uaData) {
    try {
      const { architecture } = await uaData.getHighEntropyValues([
        "architecture",
      ]);
      if (architecture === "arm") {
        return "arm";
      }
      if (architecture === "x86") {
        return "intel";
      }
    } catch {
      // Not allowed to ask: fall through to the graphics chip.
    }
  }
  return chipFromGraphics();
}

function chipFromGraphics(): "arm" | "intel" | null {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) {
      return null;
    }
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    // Only Apple's own graphics decode ASTC textures; Safari names every
    // graphics chip "Apple GPU", so this is what tells it apart there.
    const astc = Boolean(gl.getExtension("WEBGL_compressed_texture_astc"));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (APPLE_CHIP.test(renderer)) {
      return "arm";
    }
    if (OTHER_GPU.test(renderer)) {
      return "intel";
    }
    return astc ? "arm" : "intel";
  } catch {
    return null;
  }
}

/** The visitor's platform, once known after the first render. */
export function usePlatform() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => {
    const found = detectPlatform();
    setPlatform(found);
    if (found !== "mac") {
      return;
    }
    let live = true;
    detectMacChip().then((chip) => {
      if (live && chip === "intel") {
        setPlatform("mac-intel");
      }
    });
    return () => {
      live = false;
    };
  }, []);
  return platform;
}

/**
 * Download for the visitor's computer: the Mac build for its chip (Apple
 * silicon unless it is found to be Intel), the Windows installer on Windows, the releases page elsewhere. On a
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
  if (platform === "mac" || platform === "mac-intel") {
    return (
      <SiteButton
        className={className}
        download
        href={platform === "mac" ? "/download/mac" : "/download/mac-intel"}
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
  if (platform === "mac" || platform === "mac-intel") {
    const other =
      platform === "mac"
        ? { href: "/download/mac-intel", label: "Intel Mac" }
        : { href: "/download/mac", label: "Apple silicon Mac" };
    return (
      <p className={className}>
        <a className={link} href={other.href}>
          {other.label}
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
