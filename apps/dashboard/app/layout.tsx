import type { Metadata } from "next";

import "@castfy/ui/globals.css";
import "./globals.css";

import Providers from "@/components/providers";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: "Lecon & Evye",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Turn your url into demo`,
    description: siteConfig.description,
    images: [`${siteConfig.ogImage}`],
    creator: "@lecon",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${fontVariables} antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <head />

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
