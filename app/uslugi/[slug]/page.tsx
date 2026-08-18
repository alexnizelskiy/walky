import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { servicePages, getServicePage } from "@/content/service-pages";

export function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getServicePage(slug);
  if (!s) return {};
  return buildMetadata({
    title: s.seo.title,
    description: s.seo.description,
    keywords: s.seo.keywords,
    path: `/uslugi/${slug}`,
  });
}

export default async function ServicePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getServicePage(slug);
  if (!s) notFound();

  return (
    <>
      <JsonLd data={faqJsonLd(s.faq)} />

      {/* Hero */}
      <section className="container-page pt-10 md:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="flex items-center gap-2 text-base font-bold text-brand-500">
              <Star className="size-5 fill-brand-500" /> 4.9 — оценка клиентов
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">{s.hero.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{s.hero.subtitle}</p>
            <Link
              href={`/order?service=${slug}`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-4 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              Заказать от {s.priceFrom} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] bg-surface p-6 md:p-8">
            {s.illustration ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.illustration} alt={s.nav} className="max-h-72 w-auto object-contain" />
            ) : (
              <span className="text-[7rem] leading-none md:text-[9rem]">{s.emoji}</span>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container-page mt-16 md:mt-24">
        <h2 className="text-3xl font-bold md:text-4xl">Как всё проходит</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.steps.map((step, i) => (
            <div key={step.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-full bg-cyan-300 text-base font-bold text-ink-950">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="container-page mt-16 md:mt-24">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-500 md:text-3xl">Спокойно за питомца</p>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">Почему нам можно доверять</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {s.safety.map((b) => (
            <div key={b.title} className="rounded-3xl bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-500">
                <ShieldCheck className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container-page mt-16 md:mt-24">
        <h2 className="text-3xl font-bold md:text-4xl">Стоимость</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.pricing.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-6 ${tier.highlight ? "border-brand-300 bg-brand-50" : "border-border bg-card"}`}
            >
              <h3 className="text-xl font-bold">{tier.name}</h3>
              {tier.note && <p className="mt-1.5 text-sm text-muted-foreground">{tier.note}</p>}
              <ul className="mt-5 flex flex-col gap-2.5">
                {tier.rows.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Check className="size-4 text-brand-500" /> {r.label}
                    </span>
                    <span className="font-bold text-foreground">{r.price}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/order?service=${slug}`}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors ${
                  tier.highlight
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                }`}
              >
                Заказать <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
        {s.pricingNote && <p className="mt-5 max-w-3xl text-sm text-muted-foreground">{s.pricingNote}</p>}
      </section>

      {/* FAQ */}
      <section className="container-page mt-16 md:mt-24">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Частые вопросы</h2>
            <p className="mt-3 text-muted-foreground">Собрали ответы на то, что чаще всего спрашивают.</p>
          </div>
          <Accordion items={s.faq} defaultOpen={0} className="rounded-3xl" />
        </div>
      </section>

      {/* CTA band */}
      <section className="container-page mt-16 md:mt-24">
        <div className="overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="max-w-xl text-3xl font-bold text-white md:text-4xl">Готовы доверить питомца профессионалам?</h2>
              <p className="mt-4 max-w-md text-lg text-white/85">Оформите заказ — подберём проверенного исполнителя. Первый визит уже завтра.</p>
              <Link
                href={`/order?service=${slug}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 text-base font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                Заказать от {s.priceFrom} <ArrowRight className="size-4" />
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
