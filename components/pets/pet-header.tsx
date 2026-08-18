"use client";

import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { servicePages } from "@/content/service-pages";

const nav = [
  { label: "О сервисе", href: "/o-servise" },
  { label: "Стать выгульщиком или ситтером", href: "/stat-vygulshchikom" },
];

export function PetHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 pt-3 md:pt-4">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 rounded-full bg-white px-4 shadow-[0_10px_40px_-12px_rgba(14,15,30,0.18)] md:pl-6 md:pr-3">
          <Link href="/" aria-label="walky — на главную" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/walky-logo.svg" alt="walky" className="h-8 w-auto md:h-9" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {/* Услуги — выпадающее подменю */}
            <div className="group relative">
              <Link
                href="/#tariffs"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Наши услуги
                <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
              </Link>
              {/* invisible bridge + panel keep it open on hover */}
              <div className="invisible absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-[0_20px_50px_-20px_rgba(14,15,30,0.3)]">
                  {servicePages.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/uslugi/${s.slug}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-lg">{s.emoji}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{s.nav}</span>
                        <span className="block text-xs text-muted-foreground">от {s.priceFrom}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {nav.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            {user ? (
              <Link
                href="/cabinet"
                className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3.5 transition-colors hover:bg-surface"
              >
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <User className="size-4" />
                  )}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">
                  {user.name || "Профиль"}
                </span>
              </Link>
            ) : (
              <Link
                href="/cabinet"
                className="inline-flex items-center rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                Войти
              </Link>
            )}
            <Link
              href="/order"
              className="inline-flex items-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              Заказать
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
