import { cn } from "@castfy/ui/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import {
  Hedvig_Letters_Sans,
  Hedvig_Letters_Serif,
  Inter,
  Plus_Jakarta_Sans,
  Roboto,
} from "next/font/google";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const fontRoboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});
const fontPlusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const hedvigSans = Hedvig_Letters_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-sans",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-serif",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const fontVariables = cn(
  GeistSans.variable,
  GeistMono.variable,
  fontInter.variable,
  fontRoboto.variable,
  fontPlusJakartaSans.variable,
  hedvigSans.variable,
  hedvigSerif.variable
);
