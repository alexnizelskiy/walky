"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sitterSteps,
  emptySitterAnswers,
  getSitterDraft,
  saveSitterDraft,
  clearSitterDraft,
  type SitterField,
} from "@/lib/sitter";

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Choice({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className={cn("grid grid-cols-1 gap-2.5", options.length > 2 ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
            value === o ? "border-brand-500" : "border-border hover:border-brand-300"
          )}
        >
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", value === o ? "border-brand-500" : "border-input")}>
            {value === o && <span className="size-2.5 rounded-full bg-brand-500" />}
          </span>
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ field, value, onChange }: { field: SitterField; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h3 className="text-lg font-bold">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </h3>
      {field.hint && <p className="mt-0.5 text-sm text-muted-foreground">{field.hint}</p>}
      <div className="mt-3">
        {field.type === "choice" ? (
          <Choice options={field.options ?? []} value={value} onChange={onChange} />
        ) : field.type === "textarea" ? (
          <textarea className={cn(inputCls, "h-auto py-3")} rows={4} placeholder={field.placeholder ?? "Напишите ответ здесь…"} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input
            className={inputCls}
            type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
            inputMode={field.type === "email" ? "email" : field.type === "tel" ? "tel" : undefined}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export function SitterForm() {
  const [step, setStep] = React.useState(0);
  const [a, setA] = React.useState<Record<string, string>>(emptySitterAnswers);
  const [consent, setConsent] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const saved = getSitterDraft();
    if (saved) setA({ ...emptySitterAnswers, ...saved });
  }, []);
  React.useEffect(() => { saveSitterDraft(a); }, [a]);

  const total = sitterSteps.length; // + final consent step
  const isFinal = step === total; // consent step index === total
  const set = (key: string, v: string) => setA((s) => ({ ...s, [key]: v }));

  function next() {
    setErr("");
    if (step < total) {
      for (const f of sitterSteps[step].fields) {
        if (f.required && !a[f.key]?.trim()) return setErr("Заполните обязательные поля (отмечены *)");
      }
    }
    setStep((s) => Math.min(total, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErr("");
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setErr("");
    if (!consent) return setErr("Нужно согласие на обработку персональных данных");
    setSaving(true);
    try {
      const res = await fetch("/api/sitter-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: a }),
      });
      if (!res.ok) throw new Error();
      clearSitterDraft();
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErr("Не удалось отправить анкету. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center md:p-10">
          <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-600">
            <Check className="size-8" />
          </span>
          <h1 className="text-2xl font-bold">Анкета отправлена!</h1>
          <p className="text-muted-foreground">
            Спасибо! Мы изучим анкету и свяжемся с вами по указанным контактам. Обычно это занимает пару дней.
          </p>
          <Link href="/" className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600">
            На главную <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const mascot = isFinal ? "Остался последний шаг — подтвердите согласие, и мы получим вашу анкету." : sitterSteps[step].mascot;

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-center text-3xl font-bold md:text-4xl">Анкета выгульщика и ситтера</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
        Заполните анкету — это займёт несколько минут. Данные увидят только координаторы walky.
      </p>

      {/* Progress */}
      <div className="mx-auto mt-6 flex max-w-3xl gap-1.5">
        {Array.from({ length: total + 1 }).map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-brand-500" : "bg-surface-strong")} />
        ))}
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-6 md:grid-cols-[220px_1fr]">
        {/* Mascot */}
        <aside className="hidden md:block">
          <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-2xl">🐶</span>
          <div className="mt-2 rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-700">Денди</p>
            <p className="mt-1 text-sm text-muted-foreground">{mascot}</p>
          </div>
        </aside>

        {/* Step body */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
          <div className="flex flex-col gap-6">
            {!isFinal ? (
              sitterSteps[step].fields.map((f) => (
                <Field key={f.key} field={f} value={a[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
              ))
            ) : (
              <>
                <h3 className="text-lg font-bold">Почти готово</h3>
                <p className="text-sm text-muted-foreground">Проверьте ответы на предыдущих шагах и подтвердите согласие.</p>
                <label className="flex items-start gap-2.5 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                  <span>
                    Даю согласие на обработку персональных данных в соответствии с{" "}
                    <Link href="/privacy" className="text-primary hover:underline">политикой конфиденциальности</Link>.
                  </span>
                </label>
              </>
            )}

            {err && <p className="text-sm text-destructive">{err}</p>}

            {/* Nav */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              {step > 0 && (
                <button type="button" onClick={back} className="grid size-11 place-items-center rounded-full bg-surface-strong text-foreground hover:bg-border">
                  <ArrowLeft className="size-5" />
                </button>
              )}
              {!isFinal ? (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600">
                  Далее <ArrowRight className="size-4" />
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                  {saving ? "Отправляем…" : "Отправить анкету"} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
