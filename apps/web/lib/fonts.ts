import { Geist_Mono, Inter } from "next/font/google";

/**
 * Only the fonts the site uses. Every preloaded font competes with the hero
 * for the first second of bandwidth, so only Inter, the text font, is
 * preloaded. Geist Mono is for small labels below the first screen and loads
 * when it is first needed.
 */
const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
});

export const fontVariables = `${fontInter.variable} ${fontMono.variable}`;
