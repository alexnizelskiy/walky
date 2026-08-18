import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Send, MessageCircle, Clock, MapPin, ArrowRight, PawPrint } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Контакты walky — выгул и передержка собак в Ростове-на-Дону",
  description:
    "Связаться с walky в Ростове-на-Дону: телефон, e-mail, Telegram, WhatsApp и часы работы. Ответим на любой вопрос о выгуле, няне и передержке питомцев.",
  keywords: ["контакты walky", "выгул собак Ростов телефон", "walky связаться"],
  path: "/contacts",
});

const { contacts, geo, social } = siteConfig;

const channels = [
  { icon: Phone, label: "Телефон", value: contacts.phone, href: contacts.phoneHref },
  { icon: Send, label: "Telegram", value: contacts.telegramLabel, href: contacts.telegram, external: true },
  { icon: MessageCircle, label: "WhatsApp", value: contacts.whatsappLabel, href: contacts.whatsapp, external: true },
  { icon: Mail, label: "E-mail", value: contacts.email, href: contacts.emailHref },
];

export default function ContactsPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-page pt-10 md:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-sm font-semibold text-brand-700">
          <PawPrint className="size-4" /> Контакты
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          Свяжитесь с нами
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Ответим на любой вопрос о выгуле, няне и передержке — и подберём проверенного исполнителя для вашего питомца.
        </p>
      </section>

      {/* Channels */}
      <section className="container-page mt-10 md:mt-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-3xl bg-surface p-6 transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(14,15,30,0.25)]"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-500">
                <c.icon className="size-6" />
              </span>
              <span className="mt-4 text-sm text-muted-foreground">{c.label}</span>
              <span className="mt-0.5 font-bold group-hover:text-primary">{c.value}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="container-page mt-8 md:mt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-surface p-6 md:p-8">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-500">
              <Clock className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Часы работы</h2>
            <p className="mt-1.5 text-muted-foreground">{contacts.workingHours}</p>
            <p className="mt-1 text-sm text-muted-foreground">Заявку через сайт можно оставить круглосуточно.</p>
          </div>
          <div className="rounded-3xl bg-surface p-6 md:p-8">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-500">
              <MapPin className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Где мы работаем</h2>
            <p className="mt-1.5 text-muted-foreground">{geo.city} и {geo.region}.</p>
            {social.yandexMaps && (
              <a href={social.yandexMaps} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
                Посмотреть на карте →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Legal + CTA */}
      <section className="container-page mt-8 md:mt-10">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold">Реквизиты</h2>
          <p className="mt-2 text-muted-foreground">
            {siteConfig.legal.sellerShort}, ИНН {siteConfig.legal.inn}.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <Link href="/requisites" className="font-semibold text-primary hover:underline">Все реквизиты →</Link>
            <Link href="/privacy" className="font-semibold text-primary hover:underline">Политика конфиденциальности →</Link>
          </div>
        </div>
      </section>

      <section className="container-page mt-10 md:mt-14 mb-4">
        <div className="overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 text-center md:px-12 md:py-14">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white md:text-4xl">Нужен выгул или передержка?</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/85">Оформите заказ — подберём проверенного исполнителя рядом с вами.</p>
          <Link
            href="/order"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
          >
            Заказать <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
