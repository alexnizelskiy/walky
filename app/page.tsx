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
    "Выгул собак, няня и передержка в Ростове-на-Дону: проверенные выгульщики, фотоотчёт с каждой прогулки, страховка. Выгул от 299 ₽.",
  keywords: [
    "выгул собак Ростов-на-Дону",
    "передержка собак Ростов",
    "няня для собаки Ростов",
    "выгульщик собак Ростов",
  ],
  path: "/",
});

const services = [
  { badge: "От 20 мин", title: "Выгулы", desc: "Надёжный выгульщик погуляет и пришлёт отчёт", price: "от 299 ₽", img: "/illustrations/svc-walk.png" },
  { badge: "От 1 часа", title: "Няня", desc: "Присмотрим за питомцем, пока вас нет дома", price: "от 799 ₽", img: "/illustrations/svc-nanny.png" },
  { badge: "От 1 суток", title: "Передержка", desc: "Посидим с питомцем у вас или у ситтера", price: "от 1 899 ₽", img: "/illustrations/svc-boarding.png" },
];

const stats = [
  { icon: ShieldCheck, value: "> 500", label: "Проверенных надёжных исполнителей" },
  { icon: Award, value: "> 100 тыс. раз", label: "Погуляли и посидели с вашими питомцами" },
  { icon: PawPrint, value: "> 15 000", label: "Довольных питомцев" },
];

const benefits = [
  { icon: BadgeCheck, title: "Проверенные выгульщики", desc: "Чтобы попасть к нам — недостаточно просто заполнить анкету. Каждый проходит тестирование по правилам безопасности и обязательную стажировку." },
  { icon: ShieldCheck, title: "Безопасная амуниция", desc: "У каждого выгульщика специальная надёжная экипировка, разработанная кинологами. С ней питомец точно будет в безопасности." },
  { icon: Camera, title: "Фото и отчёт после прогулки", desc: "Маршрут прогулки на карте и фотоотчёт — то, что нас любят и выбирают клиенты. Вы точно знаете, что с питомцем." },
  { icon: Route, title: "Удобные маршруты", desc: "Гуляем в знакомых питомцу местах, по удобному и безопасному маршруту." },
];

const steps = [
  { title: "Закажите услугу на сайте или в боте", desc: "В небольшой анкете спросим у вас всё самое важное — к каждому питомцу индивидуальный подход." },
  { title: "Подберём подходящего исполнителя", desc: "Чтобы был релевантный опыт, находился рядом и мог учесть все пожелания." },
  { title: "Познакомимся с питомцем", desc: "Сначала — знакомство, чтобы вы и питомец могли убедиться: всё пройдёт комфортно. А потом посидим, погуляем, помоем лапы." },
  { title: "Пришлём подробный отчёт", desc: "Вы только посмотрите. Расскажем как всё прошло, приложим фотографии, а на передержке предложим онлайн-звонок." },
  { title: "Всё время будем на связи", desc: "Наша поддержка рядом. Обращайтесь по любому вопросу, всегда поможем." },
];

const faq = [
  { question: "Как проходит первая прогулка?", answer: "Выгульщик знакомится с питомцем в вашем присутствии, уточняет привычки и команды. Дальше можно передавать питомца на прогулки без вашего участия." },
  { question: "Вы присылаете отчёт?", answer: "Да, после каждой прогулки — фотографии и маршрут, а также как прошла прогулка." },
  { question: "Чем няня отличается от передержки?", answer: "Няня приходит к вам и присматривает несколько часов. Передержка — когда питомец гостит у ситтера сутки и дольше." },
  { question: "А если у меня кот?", answer: "Есть отдельный формат «У меня котик!» — визиты от 15 минут, кото-няни и ситтеры." },
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
              href="/order"
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
          <p className="text-2xl font-bold text-brand-500 md:text-3xl">Главное — безопасность</p>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">С нами вы можете не переживать</h2>
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
              Заказать от 299 ₽ <ArrowRight className="size-4" />
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
