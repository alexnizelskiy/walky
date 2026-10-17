import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PetHeader } from "@/components/pets/pet-header";
import { PetFooter } from "@/components/pets/pet-footer";
import { ThemeScript } from "@/components/theme/theme-toggle";
import { JsonLd } from "@/components/seo/json-ld";
import { RefCapture } from "@/components/referral/ref-capture";
import { RegisterSW } from "@/components/pwa/register-sw";
import { AuthProvider } from "@/components/auth/auth-provider";
import { localBusinessJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { defaultMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

// Gilroy — self-hosted geometric sans (display + body), with Cyrillic.
const gilroy = localFont({
  src: [
    { path: "./fonts/gilroy/Gilroy-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/gilroy/Gilroy-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/gilroy/Gilroy-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/gilroy/Gilroy-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/gilroy/Gilroy-Extrabold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${gilroy.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <JsonLd data={[localBusinessJsonLd(), websiteJsonLd()]} />
        <RefCapture />
        <RegisterSW />
        <AuthProvider>
          <PetHeader />
          <main className="flex-1">{children}</main>
          <PetFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
