import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Raleway, Belanosima } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { PetHeader } from "@/components/pets/pet-header";
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

// Logo wordmark — Belanosima
const belanosima = Belanosima({
  subsets: ["latin"],
  variable: "--font-belanosima",
  display: "swap",
  weight: ["400", "600", "700"],
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
      className={`${raleway.variable} ${involve.variable} ${belanosima.variable}`}
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
          <footer className="border-t border-border bg-background">
            <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground md:flex-row">
              <p>© {new Date().getFullYear()} {siteConfig.name}. Забота о питомцах в {siteConfig.geo.city}.</p>
              <div className="flex gap-5">
                <a href={siteConfig.contacts.phoneHref} className="hover:text-foreground">{siteConfig.contacts.phone}</a>
                <Link href="/requisites" className="hover:text-foreground">Реквизиты</Link>
                <Link href="/privacy" className="hover:text-foreground">Политика конфиденциальности</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
