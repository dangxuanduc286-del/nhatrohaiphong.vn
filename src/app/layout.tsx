import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { appConfig } from "@/config/app";
import { createSeoMetadata, JsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createSeoMetadata({
  title: appConfig.name,
  description: appConfig.description,
  path: "/",
  keywords: ["phòng trọ Hải Phòng", "nhà trọ Hải Phòng", "thuê phòng Hải Phòng"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <JsonLdScript data={[organizationJsonLd(), websiteJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
