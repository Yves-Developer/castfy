import type { Metadata } from "next";
import "./globals.css";

import "@castfy/ui/globals.css";
import Providers from "@/components/providers";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Turn your url into demo`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Rathon",
      url: "https://rathon-rw.com",
    },
  ],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/favicon.ico`,
  sameAs: [
    "https://x.com/castfy",
    "https://github.com/castfy",
    "https://linkedin.com/company/castfy",
  ],
  description: siteConfig.description,
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
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: for now
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </head>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
