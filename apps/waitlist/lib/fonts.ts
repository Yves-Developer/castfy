import { cn } from "@workspace/ui/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Inter, Roboto } from "next/font/google";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const fontRoboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const fontVariables = cn(
  GeistSans.variable,
  GeistMono.variable,
  fontInter.variable,
  fontRoboto.variable
);
