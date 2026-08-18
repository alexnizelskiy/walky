import type { Metadata } from "next";
import Link from "next/link";
import {
  Star, ArrowRight, Send, CalendarClock, Wallet, ShieldCheck, GraduationCap, MapPin, HeartHandshake, Check,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Стать выгульщиком или ситтером в Ростове-на-Дону | walky",
  description:
    "Работа выгульщиком и ситтером в walky (Ростов-на-Дону): свободный график, стабильный доход, заказы рядом с домом, обучение с кинологами и поддержка. Оставьте заявку.",
  keywords: ["работа выгульщиком Ростов", "стать выгульщиком собак", "работа с животными Ростов", "ситтер для животных вакансия"],
  path: "/stat-vygulshchikom",
});

const perks = [
  { icon: CalendarClock, title: "Свободный график", desc: "Берите заказы тогда, когда удобно — рядом с домом, работой или учёбой." },
  { icon: Wallet, title: "Стабильный доход", desc: "Прозрачная оплата за каждый выгул и визит. Чем больше заказов — тем выше доход." },
  { icon: GraduationCap, title: "Обучение с кинологами", desc: "Бесплатный курс и практика: научим безопасно и уверенно работать с питомцами." },
  { icon: ShieldCheck, title: "Поддержка и страховка", desc: "Мы на связи по любому вопросу, а питомцы и прогулки застрахованы." },
  { icon: MapPin, title: "Заказы рядом", desc: "Подбираем прогулки поблизости, чтобы не тратить время на дорогу." },
  { icon: HeartHandshake, title: "Любимое дело", desc: "Проводите время с собаками и кошками — и получайте за это деньги." },
];

const selection = [
  { title: "Знакомимся и проверяем", desc: "Смотрим документы и профили в соцсетях — для нас важна безопасность питомцев и хозяев." },
  { title: "Учим и проверяем знания", desc: "Даём курс, подготовленный с кинологами, и небольшой тест по правилам безопасности." },
  { title: "Пробуем на практике", desc: "Проводим настоящую прогулку и смотрим, как вы ведёте себя с собакой." },
  { title: "Открываем доступ к заказам", desc: "Первый заказ появляется только после всех этапов — так мы бережём качество сервиса." },
];

const requirements = [
  "Вам есть 18 лет",
  "Любите животных и ответственно к ним относитесь",
  "Готовы обучаться и соблюдать правила безопасности",
  "Есть смартфон для заказов и отчётов",
  "Пунктуальность и аккуратность",
];

const faq = [
  { question: "Нужен ли опыт?", answer: "Необязательно. Мы бесплатно обучаем: курс с кинологами, тест и практическое занятие. Главное — любовь к животным и ответственность." },
  { question: "Сколько можно зарабатывать?", answer: "Доход зависит от числа заказов и услуг. Вы сами выбираете, сколько брать прогулок, визитов и передержек — оплата прозрачная, за каждый заказ." },
  { question: "Как устроен график?", answer: "Полностью свободный. Берите заказы, когда удобно, рядом с домом. Можно совмещать с работой или учёбой." },
  { question: "Как подать заявку?", answer: "Напишите нам в Telegram или позвоните — расскажем подробности, ответим на вопросы и пригласим на обучение." },
];

export default function BecomeWalkerPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />

      {/* Hero */}
      <section id="join" className="container-page scroll-mt-24 pt-10 md:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="flex items-center gap-2 text-base font-bold text-brand-500">
              <Star className="size-5 fill-brand-500" /> Работа с питомцами
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">
              Станьте выгульщиком или ситтером walky
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Проводите время с собаками и кошками, работайте по свободному графику и получайте стабильный доход. Обучим, поддержим и подберём заказы рядом с домом.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/stat-vygulshchikom/anketa"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-4 text-base font-bold text-white transition-colors hover:bg-brand-600"
              >
                <Send className="size-4" /> Заполнить анкету
              </Link>
              <a
                href={siteConfig.contacts.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                {siteConfig.contacts.phone}
              </a>
            </div>
          </div>
          <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] bg-surface p-6 md:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/howitworks.png" alt="Выгульщик walky" className="max-h-80 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="container-page mt-16 md:mt-24">
        <h2 className="text-3xl font-bold md:text-4xl">Почему выгульщики выбирают walky</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-500">
                <p.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selection */}
      <section className="container-page mt-16 md:mt-24">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-500 md:text-3xl">В команду проходят не все</p>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">Как стать частью walky</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {selection.map((s, i) => (
            <div key={s.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-full bg-cyan-300 text-base font-bold text-ink-950">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="container-page mt-16 md:mt-24">
        <div className="grid gap-8 rounded-[2rem] bg-surface p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Что нужно от вас</h2>
            <p className="mt-3 text-muted-foreground">Никакого специального образования — всему научим. Главное — любить животных и быть ответственным.</p>
          </div>
          <ul className="flex flex-col gap-3">
            {requirements.map((r) => (
              <li key={r} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                  <Check className="size-4" />
                </span>
                <span className="text-sm font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page mt-16 md:mt-24">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Частые вопросы</h2>
            <p className="mt-3 text-muted-foreground">Собрали ответы на то, что чаще всего спрашивают будущие выгульщики.</p>
          </div>
          <Accordion items={faq} defaultOpen={0} className="rounded-3xl" />
        </div>
      </section>

      {/* CTA band */}
      <section className="container-page mt-16 md:mt-24">
        <div className="overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="max-w-xl text-3xl font-bold text-white md:text-4xl">Готовы начать работать с питомцами?</h2>
              <p className="mt-4 max-w-md text-lg text-white/85">Заполните анкету — изучим её, ответим на вопросы и пригласим на обучение.</p>
              <Link
                href="/stat-vygulshchikom/anketa"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                <Send className="size-4" /> Заполнить анкету
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrations/cta-hero.png" alt="" className="max-h-64 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
