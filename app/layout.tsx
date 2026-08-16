import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
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

// Body text — Raleway (Google, with Cyrillic)
const raleway = Raleway({
  subsets: ["latin", "cyrillic"],
  variable: "--font-raleway",
  display: "swap",
});

// Headings & nav — Involve (self-hosted, Latin only; Cyrillic falls back to Raleway)
const involve = localFont({
  src: [
    { path: "./fonts/involve/Involve-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/involve/Involve-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/involve/Involve-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/involve/Involve-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-involve",
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
      className={`${raleway.variable} ${involve.variable}`}
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
