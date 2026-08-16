import type { Metadata } from "next";
import Link from "next/link";
import {
  Star, PawPrint, ShieldCheck, Award, Camera, Route, ArrowRight, BadgeCheck,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import { HeroRotator } from "@/components/pets/hero-rotator";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "walky — выгул, няня и передержка собак в Ростове-на-Дону",
  description:
    "Выгул собак, няня и передержка в Ростове-на-Дону: проверенные выгульщики, фотоотчёт с каждой прогулки, страховка. Выгул от 199 ₽.",
  keywords: [
    "выгул собак Ростов-на-Дону",
    "передержка собак Ростов",
    "няня для собаки Ростов",
    "выгульщик собак Ростов",
  ],
  path: "/",
});

const services = [
  { href: "/uslugi/vygul", badge: "От 20 мин", title: "Выгулы", desc: "Надёжный выгульщик погуляет и пришлёт отчёт", price: "от 199 ₽", img: "/illustrations/svc-walk.png" },
  { href: "/uslugi/nyanya", badge: "От 1 часа", title: "Няня", desc: "Присмотрим за питомцем, пока вас нет дома", price: "от 690 ₽", img: "/illustrations/svc-nanny.png" },
  { href: "/uslugi/peredergka", badge: "От 1 суток", title: "Передержка", desc: "Посидим с питомцем у вас или у ситтера", price: "от 1 290 ₽", img: "/illustrations/svc-boarding.png" },
];

const extraServices = [
  { href: "/uslugi/kotik", emoji: "🐱", title: "У меня котик!", desc: "Кото-няня и визиты от 15 минут", price: "от 459 ₽" },
  { href: "/uslugi/dop-uhod", emoji: "🐾", title: "Дополнительный уход", desc: "Ветеринар, зоотовары, уход за питомцем", price: "от 290 ₽" },
];

const stats = [
  { icon: ShieldCheck, value: "> 500", label: "Проверенных надёжных исполнителей" },
  { icon: Award, value: "> 100 тыс. раз", label: "Погуляли и посидели с вашими питомцами" },
  { icon: PawPrint, value: "> 15 000", label: "Довольных питомцев" },
];

const benefits = [
  { icon: BadgeCheck, title: "Отбираем по-настоящему", desc: "Анкеты мало: каждый кандидат проходит проверку, обучение с кинологами и практику с питомцем." },
  { icon: ShieldCheck, title: "Надёжное снаряжение", desc: "Работаем в проверенной амуниции под размер и характер собаки — прогулка проходит спокойно." },
  { icon: Camera, title: "Честный фотоотчёт", desc: "После каждой встречи присылаем фотографии и маршрут — вы видите, как прошло время с питомцем." },
  { icon: Route, title: "Знакомые маршруты", desc: "Гуляем там, где питомцу привычно и безопасно, — по удобному вам расписанию." },
];

const steps = [
  { title: "Оставляете заявку", desc: "Короткая анкета о питомце и услуге — так мы учтём характер и все пожелания." },
  { title: "Подбираем исполнителя", desc: "Находим человека с нужным опытом, который живёт рядом и подходит вашему питомцу." },
  { title: "Знакомимся с питомцем", desc: "Сначала встреча — чтобы вы и питомец были спокойны. Дальше гуляем, играем и моем лапы." },
  { title: "Присылаем отчёт", desc: "Расскажем, как всё прошло, приложим фотографии, а на передержке созвонимся по видео." },
  { title: "Остаёмся на связи", desc: "Поддержка рядом на каждом шаге — пишите по любому вопросу, поможем." },
];

const faq = [
  { question: "Как проходит первая встреча?", answer: "Исполнитель знакомится с питомцем при вас, уточняет привычки и команды. После этого можно доверять прогулки без вашего участия." },
  { question: "Будет ли отчёт?", answer: "Да, после каждой встречи присылаем фотографии, маршрут и пару строк о том, как всё прошло." },
  { question: "Чем няня отличается от передержки?", answer: "Няня приходит к вам на несколько часов. Передержка — когда питомец гостит у ситтера сутки и дольше." },
  { question: "А если у меня кот?", answer: "Для кошек есть отдельный формат «У меня котик!» — визиты от 15 минут с кото-няней." },
];

export default function Home() {
  return (
    <>
      <JsonLd data={faqJsonLd(faq)} />

      {/* Hero */}
      <section className="container-page pt-10 md:pt-16">
        <p className="flex items-center justify-center gap-2 text-base font-bold text-brand-500">
          <Star className="size-5 fill-brand-500" /> 4.9 — оценка клиентов
        </p>
        <div className="mt-6">
          <HeroRotator />
        </div>
      </section>

      {/* Services */}
      <section id="tariffs" className="container-page mt-12 scroll-mt-24 md:mt-16">
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex flex-col overflow-hidden rounded-3xl bg-surface p-6 transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(14,15,30,0.25)]"
            >
              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted-foreground">{s.badge}</span>
              <h3 className="mt-4 text-2xl font-bold md:text-3xl">{s.title}</h3>
              <p className="mt-2 max-w-[22ch] text-sm text-muted-foreground">{s.desc}</p>
              <div className="relative mt-4 flex min-h-[190px] flex-1 items-end justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.title} className="max-h-52 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <p className="mt-2 text-2xl font-bold">{s.price}</p>
            </Link>
          ))}
        </div>

        {/* Ещё услуги */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {extraServices.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group flex items-center gap-4 rounded-3xl bg-surface p-5 transition-shadow hover:shadow-[0_20px_50px_-20px_rgba(14,15,30,0.25)]"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
              <span className="shrink-0 text-lg font-bold">{s.price}</span>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="mt-14 bg-cyan-300 md:mt-20">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3 md:py-12">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <s.icon className="size-9 shrink-0 text-ink-950" />
              <div>
                <p className="text-2xl font-extrabold text-ink-950 md:text-3xl">{s.value}</p>
                <p className="text-sm text-ink-950/70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section id="why" className="container-page mt-16 scroll-mt-24 md:mt-24">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-500 md:text-3xl">Безопасность на первом месте</p>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">Доверяете питомца — и не переживаете</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-500">
                <b.icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-page mt-16 scroll-mt-24 md:mt-24">
        <div className="grid items-center gap-6 rounded-[2rem] bg-surface p-6 md:grid-cols-[0.8fr_1fr] md:p-10 lg:p-12">
          <div className="relative flex justify-center md:sticky md:top-28 md:self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/howitworks.png" alt="Как это работает" className="max-h-[420px] w-auto object-contain" />
          </div>
          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cyan-300 text-sm font-bold text-ink-950">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-bold md:text-2xl">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{s.desc}</p>
                </div>
              </div>
            ))}
            <Link
              href="/order"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              Заказать от 199 ₽ <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page mt-16 md:mt-24">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Частые вопросы о питомцах</h2>
            <p className="mt-3 text-muted-foreground">Собрали ответы на то, что чаще всего спрашивают клиенты.</p>
          </div>
          <Accordion items={faq} defaultOpen={0} className="rounded-3xl" />
        </div>
      </section>

      {/* CTA band */}
      <section className="container-page mt-16 md:mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="max-w-xl text-3xl font-bold text-white md:text-4xl">Готовы доверить питомца профессионалам?</h2>
              <p className="mt-4 max-w-md text-lg text-white/85">Оформите заказ — подберём проверенного выгульщика. Первая прогулка уже завтра.</p>
              <Link
                href="/order"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                Заказать <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrations/cta-hero.png" alt="" className="max-h-72 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
