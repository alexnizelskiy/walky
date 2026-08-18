import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, Eye, BadgeCheck, ArrowRight, PawPrint } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "О сервисе walky — забота о питомцах в Ростове-на-Дону",
  description:
    "walky — сервис выгула, няни и передержки для собак и кошек в Ростове-на-Дону. Проверенные исполнители, обучение с кинологами, фотоотчёт и поддержка на каждом шаге.",
  keywords: ["о сервисе walky", "выгул собак Ростов сервис", "передержка питомцев Ростов"],
  path: "/o-servise",
});

const values = [
  { icon: ShieldCheck, title: "Безопасность", desc: "Проверяем каждого исполнителя, обучаем с кинологами и работаем в надёжной амуниции." },
  { icon: HeartHandshake, title: "Забота", desc: "Относимся к питомцам как к своим — с вниманием к привычкам, режиму и настроению." },
  { icon: Eye, title: "Прозрачность", desc: "Фотоотчёт и маршрут после каждой встречи. Вы всегда знаете, что происходит с питомцем." },
  { icon: BadgeCheck, title: "Ответственность", desc: "Отвечаем за качество и остаёмся на связи по любому вопросу — до, во время и после услуги." },
];

const facts = [
  { value: "5", label: "услуг для питомцев — от выгула до передержки" },
  { value: "2 этапа", label: "отбора и обучения перед первым заказом" },
  { value: "100%", label: "встреч с фотоотчётом" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-page pt-10 md:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-sm font-semibold text-brand-700">
          <PawPrint className="size-4" /> О сервисе
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          walky — забота о питомцах, когда вам некогда
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Мы помогаем жителям Ростова-на-Дону не переживать за питомца в течение дня. Выгул, няня, передержка и уход —
          с проверенными исполнителями, обучением и фотоотчётом после каждой встречи.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-3xl bg-surface p-6">
              <p className="text-3xl font-extrabold text-brand-500">{f.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="container-page mt-16 md:mt-24">
        <div className="grid gap-8 rounded-[2rem] bg-surface p-6 md:grid-cols-2 md:p-10 lg:p-12">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Зачем мы это делаем</h2>
            <p className="mt-4 text-muted-foreground">
              Питомец не должен оставаться один, пока вы на работе, в поездке или просто заняты. А доверить его хочется тому,
              кто действительно любит животных и знает, как с ними обращаться.
            </p>
            <p className="mt-3 text-muted-foreground">
              walky связывает владельцев с проверенными выгульщиками и ситтерами рядом с домом — и берёт на себя всё
              остальное: подбор, безопасность, отчёты и поддержку.
            </p>
          </div>
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/cta-hero.png" alt="" className="max-h-72 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page mt-16 md:mt-24">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Наши принципы</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-500">
                <v.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal */}
      <section className="container-page mt-16 md:mt-24">
        <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Кто мы юридически</h2>
          <p className="mt-3 text-muted-foreground">
            Услуги оказывает {siteConfig.legal.sellerShort} (ИНН {siteConfig.legal.inn}),
            {" "}{siteConfig.geo.city}. Работаем официально, в режиме {siteConfig.legal.taxRegime.toLowerCase()}.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/requisites" className="font-semibold text-primary hover:underline">Реквизиты →</Link>
            <Link href="/privacy" className="font-semibold text-primary hover:underline">Политика конфиденциальности →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-16 md:mt-24">
        <div className="overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 text-center md:px-12 md:py-14">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white md:text-4xl">Доверьте питомца профессионалам</h2>
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
