import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { appConfig } from "@/config/app";
import { createSeoMetadata, JsonLdScript, localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseMetadata = createSeoMetadata({
  title: appConfig.name,
  description: appConfig.description,
  path: "/",
  keywords: ["phòng trọ Hải Phòng", "nhà trọ Hải Phòng", "thuê phòng Hải Phòng"],
});

export const metadata: Metadata = {
  ...baseMetadata,
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AnalyticsScripts />
        <AnalyticsEventTracker />
        <JsonLdScript data={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
