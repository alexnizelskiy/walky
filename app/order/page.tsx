"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuth, useRoleFlags } from "@/components/auth/auth-provider";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  walkDurations,
  walkPrice,
  nannyHours,
  boardingPerDay,
  draftTotal,
  serviceMeta,
  petHasOptions,
  accessOptions,
  emptyPetWalkDraft,
  getPetDraft,
  savePetDraft,
  clearPetDraft,
  type PetWalkDraft,
  type PetService,
} from "@/lib/pets";

const SERVICES: PetService[] = ["vygul", "nyanya", "peredergka"];

const MASCOT: Record<number, string> = {
  0: "Гав! Я помогу подобрать проверенного специалиста для вашего питомца.",
  1: "Расскажите про питомца — так мы учтём все нюансы.",
  2: "Теперь про поведение — чтобы всё прошло спокойно и безопасно.",
  3: "Осталось выбрать детали услуги.",
  4: "Последний шаг — ваши контакты, и мы подберём специалиста.",
};

const inputCls =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function Choice({
  options,
  value,
  onChange,
  cols = "sm:grid-cols-2",
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-2.5", cols)}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
            value === o.v ? "border-brand-500" : "border-border hover:border-brand-300"
          )}
        >
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", value === o.v ? "border-brand-500" : "border-input")}>
            {value === o.v && <span className="size-2.5 rounded-full bg-brand-500" />}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function PetOrderWizard() {
  const router = useRouter();
  const { user, refresh: refreshAuth } = useAuth();
  const { canOrder, dashboardPath, loading: roleLoading } = useRoleFlags();

  React.useEffect(() => {
    if (!roleLoading && !canOrder && dashboardPath) router.replace(dashboardPath);
  }, [roleLoading, canOrder, dashboardPath, router]);

  const [step, setStep] = React.useState(0);
  const [d, setD] = React.useState<PetWalkDraft>(emptyPetWalkDraft);
  const [contact, setContact] = React.useState({ name: "", phone: "", email: "", address: "" });
  const [consent, setConsent] = React.useState(true);
  const [smsOpen, setSmsOpen] = React.useState(false);
  const [smsMode, setSmsMode] = React.useState<"login" | "finish">("finish");
  const [loginPhone, setLoginPhone] = React.useState("");
  const [prefillNote, setPrefillNote] = React.useState("");
  const [petFromProfile, setPetFromProfile] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  // Pull the returning client's saved pet into the draft (cookie-based, so it
  // works right after a fresh login without waiting for the auth context).
  const loadSavedPetIntoDraft = React.useCallback(async () => {
    try {
      const r = await fetch("/api/pets").then((x) => x.json());
      const pets = r.ok ? (r.pets as Array<Record<string, unknown>>) : [];
      if (pets.length) {
        const p = pets[0];
        setD((s) => ({
          ...s,
          pet: {
            name: (p.name as string) || "",
            breed: (p.breed as string) || "",
            gender: (p.gender as "female" | "male" | null) ?? null,
            birthday: (p.birthday as string) || "",
            weight: (p.weight as number) || 10,
            has: (p.has as string[]) || [],
            clinic: (p.clinic as string) || "",
            hasIllness: p.hasIllness ? "yes" : "no",
            illnessText: (p.illnessText as string) || "",
          },
          behavior: { ...s.behavior, ...((p.behavior as Record<string, string>) || {}) },
        }));
        setPetFromProfile(true);
        setPrefillNote(`Данные питомца «${p.name}» подставлены — осталось выбрать детали услуги.`);
      } else {
        setPetFromProfile(false);
        setPrefillNote("Профиль питомца ещё не заполнен — укажите данные на следующем шаге.");
      }
    } catch { /* ignore */ }
  }, []);

  function onReturningChange(v: "yes" | "no") {
    setErr("");
    setPrefillNote("");
    setPetFromProfile(false);
    setD((s) => ({ ...s, returning: v }));
    if (v === "yes" && user) loadSavedPetIntoDraft();
  }

  React.useEffect(() => {
    const saved = getPetDraft();
    const base = saved ? { ...emptyPetWalkDraft, ...saved } : emptyPetWalkDraft;
    // preselect service from ?service= (from a service page)
    const param = new URLSearchParams(window.location.search).get("service");
    const service = (SERVICES as string[]).includes(param ?? "") ? (param as PetService) : base.service;
    setD({ ...base, service });
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      if (data.user) {
        setContact((c) => ({ ...c, name: c.name || data.user.name || "", phone: c.phone || data.user.phone || "" }));
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => { savePetDraft(d); }, [d]);

  const service = d.service;
  const meta = serviceMeta[service];
  const STEPS = ["Начало", "Питомец", "Поведение", meta.label, "Контакты"];
  const firstWalk = service === "vygul" && d.returning === "no";
  const total = draftTotal(d);

  const setPet = (patch: Partial<PetWalkDraft["pet"]>) => setD((s) => ({ ...s, pet: { ...s.pet, ...patch } }));
  const setBeh = (patch: Partial<PetWalkDraft["behavior"]>) => setD((s) => ({ ...s, behavior: { ...s.behavior, ...patch } }));
  const setWalk = (patch: Partial<PetWalkDraft["walk"]>) => setD((s) => ({ ...s, walk: { ...s.walk, ...patch } }));
  const setNanny = (patch: Partial<PetWalkDraft["nanny"]>) => setD((s) => ({ ...s, nanny: { ...s.nanny, ...patch } }));
  const setBoarding = (patch: Partial<PetWalkDraft["boarding"]>) => setD((s) => ({ ...s, boarding: { ...s.boarding, ...patch } }));

  function summaryLine(): string {
    if (service === "nyanya") return `Няня · ${d.nanny.hours} ч`;
    if (service === "peredergka")
      return `Передержка · ${d.boarding.days} сут${d.boarding.atHome === "home" ? " · у вас дома" : " · у ситтера"}`;
    return `Выгул ${d.walk.durationMin} мин${firstWalk ? " · первый выгул со скидкой" : ""}`;
  }

  // Returning client with a saved profile skips «Питомец» и «Поведение» —
  // спрашиваем только детали услуги.
  const flow = petFromProfile ? [0, 3, 4] : [0, 1, 2, 3, 4];
  const flowIdx = Math.max(0, flow.indexOf(step));
  const isLastStep = flowIdx === flow.length - 1;

  function next() {
    setErr("");
    if (step === 0 && !d.returning) return setErr("Выберите вариант");
    if (step === 1 && !d.pet.name.trim()) return setErr("Укажите кличку питомца");
    if (step === 3 && service === "peredergka" && !d.boarding.atHome) return setErr("Выберите, где будет питомец");
    setStep(flow[Math.min(flow.length - 1, flowIdx + 1)]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErr("");
    setStep(flow[Math.max(0, flowIdx - 1)]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitOrder() {
    const title = summaryLine();
    const data = {
      kind: `pet_${service}`,
      service,
      title,
      services: [{ id: `pet_${service}`, title, qty: 1, price: total }],
      pet: d.pet,
      behavior: d.behavior,
      walk: service === "vygul" ? d.walk : undefined,
      nanny: service === "nyanya" ? d.nanny : undefined,
      boarding: service === "peredergka" ? d.boarding : undefined,
      firstWalk,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      street: contact.address,
      city: "Ростов-на-Дону",
      payment: "card",
      price: { total },
    };
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, total }),
    });
    if (res.status === 401) return false;
    if (!res.ok) throw new Error();
    const { id } = (await res.json()) as { id: string };
    clearPetDraft();
    // Save the pet profile so it's reused next time and shown in the cabinet.
    fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.pet.name,
        breed: d.pet.breed,
        gender: d.pet.gender,
        birthday: d.pet.birthday,
        weight: d.pet.weight,
        has: d.pet.has,
        clinic: d.pet.clinic,
        hasIllness: d.pet.hasIllness === "yes",
        illnessText: d.pet.illnessText,
        behavior: d.behavior,
      }),
    }).catch(() => {});
    const pay = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    }).then((r) => r.json()).catch(() => ({ ok: false }));
    if (pay.ok && pay.url) { window.location.href = pay.url; return true; }
    router.push("/cabinet");
    return true;
  }

  async function finish() {
    setErr("");
    if (!contact.name.trim()) return setErr("Укажите имя");
    if (contact.phone.replace(/\D/g, "").length < 10) return setErr("Укажите телефон");
    if (!consent) return setErr("Нужно согласие на обработку данных");
    setSaving(true);
    try {
      if (!user) {
        setSaving(false);
        setSmsMode("finish");
        setSmsOpen(true);
        return;
      }
      const ok = await submitOrder();
      if (!ok) { setSaving(false); setSmsMode("finish"); setSmsOpen(true); }
    } catch {
      setSaving(false);
      setErr("Не удалось оформить заказ. Попробуйте ещё раз.");
    }
  }

  if (!roleLoading && !canOrder) {
    return <div className="container-page py-14"><div className="h-64 rounded-3xl border border-border bg-card" /></div>;
  }

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-center text-3xl font-bold md:text-4xl">Заказать {meta.verb} в Ростове-на-Дону</h1>

      {/* Service switcher */}
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2.5">
        {SERVICES.map((sv) => {
          const m = serviceMeta[sv];
          const on = service === sv;
          return (
            <button
              key={sv}
              type="button"
              onClick={() => setD((s) => ({ ...s, service: sv }))}
              aria-pressed={on}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
                on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:border-brand-300"
              )}
            >
              <span className="text-lg">{m.emoji}</span> {m.label}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mx-auto mt-5 flex max-w-3xl gap-1.5">
        {flow.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= flowIdx ? "bg-brand-500" : "bg-surface-strong")} />
        ))}
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-6 md:grid-cols-[220px_1fr]">
        {/* Mascot */}
        <aside className="hidden md:block">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl">🐶</span>
          </div>
          <div className="mt-2 rounded-2xl bg-brand-50 p-4">
            <p className="text-sm font-bold text-brand-700">Денди</p>
            <p className="mt-1 text-sm text-muted-foreground">{MASCOT[step]}</p>
          </div>
        </aside>

        {/* Step body */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-7">
          <div className="flex flex-col gap-6">
            {step === 0 && (
              <>
                <Q title="Вы заказывали у нас раньше?" hint={service === "vygul" ? "Для новых клиентов — скидка на первый выгул" : undefined}>
                  <Choice
                    value={d.returning ?? ""}
                    onChange={(v) => onReturningChange(v as "yes" | "no")}
                    options={[{ v: "yes", label: "Да" }, { v: "no", label: "Нет" }]}
                  />
                </Q>

                {/* Returning + not logged in → offer login to reuse saved pet data */}
                {d.returning === "yes" && !user && (
                  <div className="rounded-2xl bg-brand-50 p-4">
                    <p className="text-sm font-bold text-brand-700">Войдите — подставим данные питомца</p>
                    <p className="mt-1 text-sm text-muted-foreground">Не придётся заполнять анкету заново.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="tel"
                        inputMode="tel"
                        className={cn(inputCls, "sm:flex-1")}
                        placeholder="+7 (___) ___-__-__"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (loginPhone.replace(/\D/g, "").length < 10) return setErr("Введите корректный номер");
                          setErr("");
                          setSmsMode("login");
                          setSmsOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                      >
                        Войти
                      </button>
                    </div>
                    <div className="mt-3">
                      <OAuthButtons onSuccess={() => { refreshAuth(); loadSavedPetIntoDraft(); }} />
                    </div>
                  </div>
                )}

                {prefillNote && (
                  <p className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">{prefillNote}</p>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <Q title="Как зовут питомца?">
                  <input className={inputCls} placeholder="Арчи" value={d.pet.name} onChange={(e) => setPet({ name: e.target.value })} />
                </Q>
                <Q title="Какая порода?">
                  <input className={inputCls} placeholder="Кавалер кинг-чарльз-спаниель" value={d.pet.breed} onChange={(e) => setPet({ breed: e.target.value })} />
                </Q>
                <Choice value={d.pet.gender ?? ""} onChange={(v) => setPet({ gender: v as "female" | "male" })} options={[{ v: "female", label: "Девочка" }, { v: "male", label: "Мальчик" }]} />
                <Q title="День рождения любимца" hint="Можно приблизительно">
                  <input className={inputCls} placeholder="10.02.2024" value={d.pet.birthday} onChange={(e) => setPet({ birthday: e.target.value })} />
                </Q>
                <Q title="Вес питомца" hint={`Приблизительно, ${d.pet.weight} кг`}>
                  <input type="range" min={1} max={60} value={d.pet.weight} onChange={(e) => setPet({ weight: Number(e.target.value) })} className="w-full accent-[var(--primary)]" />
                </Q>
                <Q title="Что из этого есть у питомца?" hint="Отметьте один или несколько вариантов">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {petHasOptions.map((o) => {
                      const on = d.pet.has.includes(o);
                      return (
                        <button key={o} type="button" onClick={() => setPet({ has: on ? d.pet.has.filter((x) => x !== o) : [...d.pet.has, o] })}
                          className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors", on ? "border-brand-500" : "border-border hover:border-brand-300")}>
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded border-2", on ? "border-brand-500 bg-brand-500 text-white" : "border-input")}>{on && "✓"}</span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </Q>
                <Q title="В какую ветклинику ходите?">
                  <input className={inputCls} value={d.pet.clinic} onChange={(e) => setPet({ clinic: e.target.value })} />
                </Q>
                <Q title="Есть ли болезни у питомца?">
                  <Choice value={d.pet.hasIllness ?? ""} onChange={(v) => setPet({ hasIllness: v as "no" | "yes" })} options={[{ v: "no", label: "Нет" }, { v: "yes", label: "Да" }]} />
                  {d.pet.hasIllness === "yes" && (
                    <textarea className={cn(inputCls, "mt-2.5 h-auto py-3")} rows={2} placeholder="Опишите" value={d.pet.illnessText} onChange={(e) => setPet({ illnessText: e.target.value })} />
                  )}
                </Q>
              </>
            )}

            {step === 2 && (
              <>
                <Q title="Тянет за поводок?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.pullsLeash} onChange={(v) => setBeh({ pullsLeash: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Иногда", label: "Иногда" }, { v: "Сильно", label: "Сильно" }]} />
                </Q>
                <Q title="Подбирает с земли?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.picksUp} onChange={(v) => setBeh({ picksUp: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Иногда", label: "Иногда" }, { v: "Сильно", label: "Сильно" }]} />
                </Q>
                <Q title="Если подберёт, можно отобрать?">
                  <Choice cols="sm:grid-cols-3" value={d.behavior.canTakeAway} onChange={(v) => setBeh({ canTakeAway: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Да", label: "Да" }, { v: "Будет сложно", label: "Будет сложно" }]} />
                </Q>
                <Q title="Есть к чему-то агрессия?">
                  <Choice value={d.behavior.aggression} onChange={(v) => setBeh({ aggression: v })} options={[{ v: "Нет", label: "Нет" }, { v: "Да", label: "Да" }]} />
                </Q>
                <Q title="Можно отпускать на площадке без поводка?">
                  <Choice value={d.behavior.offLeash} onChange={(v) => setBeh({ offLeash: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Можно контактировать с другими собаками?">
                  <Choice value={d.behavior.contactDogs} onChange={(v) => setBeh({ contactDogs: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
              </>
            )}

            {/* ─── Step 3: service-specific ─── */}
            {step === 3 && service === "vygul" && (
              <>
                <Q title="Какая длительность выгула нужна питомцу?" hint="Цена без учёта накопленной скидки и доп. услуг">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {walkDurations.map((w) => (
                      <button key={w.min} type="button" onClick={() => setWalk({ durationMin: w.min })} aria-pressed={d.walk.durationMin === w.min}
                        className={cn("flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors", d.walk.durationMin === w.min ? "border-brand-500" : "border-border hover:border-brand-300")}>
                        <span className="flex items-center gap-2.5">
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", d.walk.durationMin === w.min ? "border-brand-500" : "border-input")}>
                            {d.walk.durationMin === w.min && <span className="size-2.5 rounded-full bg-brand-500" />}
                          </span>
                          {w.min} минут
                        </span>
                        <span className="text-muted-foreground">{formatPrice(firstWalk ? w.first : w.price)}</span>
                      </button>
                    ))}
                  </div>
                  {firstWalk && (
                    <p className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                      🎁 Первый выгул — со скидкой. {d.walk.durationMin} минут за <b>{formatPrice(walkPrice(d.walk.durationMin, true))}</b>.
                    </p>
                  )}
                </Q>
                <Q title="Как часто требуются выгулы?">
                  <Choice value={d.walk.frequency} onChange={(v) => setWalk({ frequency: v })} options={[{ v: "В конкретные даты", label: "В конкретные даты" }, { v: "По расписанию", label: "По постоянному расписанию" }]} />
                </Q>
                <Q title="По какому расписанию надо гулять?" hint="Например, в ПН с 9 до 11 и в ЧТ с 18 до 20">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} value={d.walk.schedule} onChange={(e) => setWalk({ schedule: e.target.value })} />
                </Q>
                <Q title="Покормить после прогулки?">
                  <Choice value={d.walk.feed} onChange={(v) => setWalk({ feed: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Помыть лапки после прогулки?">
                  <Choice value={d.walk.washPaws} onChange={(v) => setWalk({ washPaws: v })} options={[{ v: "Да", label: "Да" }, { v: "Нет", label: "Нет" }]} />
                </Q>
                <Q title="Как нам попасть к питомцу?">
                  <Choice value={d.walk.access} onChange={(v) => setWalk({ access: v })} options={accessOptions.map((a) => ({ v: a, label: a }))} />
                </Q>
                <Q title="Нужно ли что-то дополнительно знать?">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} placeholder="Например, лапы мыть только своим шампунем" value={d.walk.notes} onChange={(e) => setWalk({ notes: e.target.value })} />
                </Q>
              </>
            )}

            {step === 3 && service === "nyanya" && (
              <>
                <Q title="Сколько часов нужна няня?">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {nannyHours.map((n) => (
                      <button key={n.h} type="button" onClick={() => setNanny({ hours: n.h })} aria-pressed={d.nanny.hours === n.h}
                        className={cn("flex items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors", d.nanny.hours === n.h ? "border-brand-500" : "border-border hover:border-brand-300")}>
                        <span className="flex items-center gap-2.5">
                          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", d.nanny.hours === n.h ? "border-brand-500" : "border-input")}>
                            {d.nanny.hours === n.h && <span className="size-2.5 rounded-full bg-brand-500" />}
                          </span>
                          {n.h === 8 ? "Полный день (до 8 ч)" : `${n.h} ч`}
                        </span>
                        <span className="text-muted-foreground">{formatPrice(n.price)}</span>
                      </button>
                    ))}
                  </div>
                </Q>
                <Q title="Когда нужна няня?" hint="Дата и время, например: 20 июня с 10 до 12">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} value={d.nanny.schedule} onChange={(e) => setNanny({ schedule: e.target.value })} />
                </Q>
                <Q title="Покормить питомца?">
                  <Choice value={d.nanny.feed} onChange={(v) => setNanny({ feed: v })} options={[{ v: "Да", label: "Да, по графику" }, { v: "Нет", label: "Не нужно" }]} />
                </Q>
                <Q title="Как попасть к питомцу?">
                  <Choice value={d.nanny.access} onChange={(v) => setNanny({ access: v })} options={accessOptions.map((a) => ({ v: a, label: a }))} />
                </Q>
                <Q title="Что важно знать няне?">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} placeholder="Привычки, команды, что можно и нельзя" value={d.nanny.notes} onChange={(e) => setNanny({ notes: e.target.value })} />
                </Q>
              </>
            )}

            {step === 3 && service === "peredergka" && (
              <>
                <Q title="Где будет питомец?">
                  <Choice
                    value={d.boarding.atHome ?? ""}
                    onChange={(v) => setBoarding({ atHome: v as "sitter" | "home" })}
                    options={[
                      { v: "sitter", label: "У проверенного ситтера" },
                      { v: "home", label: "У меня дома (ситтер приедет)" },
                    ]}
                  />
                </Q>
                <Q title="На сколько суток?" hint={`${formatPrice(boardingPerDay(d.boarding.days, d.boarding.atHome === "home"))} за сутки`}>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setBoarding({ days: Math.max(1, d.boarding.days - 1) })} className="grid size-11 place-items-center rounded-xl border border-border text-xl font-bold hover:border-brand-300">−</button>
                    <span className="min-w-[4ch] text-center text-2xl font-bold">{d.boarding.days}</span>
                    <button type="button" onClick={() => setBoarding({ days: Math.min(60, d.boarding.days + 1) })} className="grid size-11 place-items-center rounded-xl border border-border text-xl font-bold hover:border-brand-300">+</button>
                    <span className="ml-2 text-sm text-muted-foreground">суток</span>
                  </div>
                </Q>
                <Q title="Дата заезда" hint="Можно приблизительно">
                  <input className={inputCls} placeholder="20.06.2026" value={d.boarding.dateFrom} onChange={(e) => setBoarding({ dateFrom: e.target.value })} />
                </Q>
                <Q title="Нужны ли прогулки?">
                  <Choice value={d.boarding.walk} onChange={(v) => setBoarding({ walk: v })} options={[{ v: "Да", label: "Да, гулять" }, { v: "Нет", label: "Без прогулок" }]} />
                </Q>
                <Q title="Кормление">
                  <Choice value={d.boarding.feed} onChange={(v) => setBoarding({ feed: v })} options={[{ v: "Свой корм", label: "Дам свой корм" }, { v: "Ваш корм", label: "Кормите вашим" }]} />
                </Q>
                <Q title="Как попасть к питомцу / передать его?">
                  <Choice value={d.boarding.access} onChange={(v) => setBoarding({ access: v })} options={accessOptions.map((a) => ({ v: a, label: a }))} />
                </Q>
                <Q title="Что важно знать ситтеру?">
                  <textarea className={cn(inputCls, "h-auto py-3")} rows={2} placeholder="Привычки, режим, особенности здоровья" value={d.boarding.notes} onChange={(e) => setBoarding({ notes: e.target.value })} />
                </Q>
              </>
            )}

            {step === 4 && (
              <>
                <Q title="Как вас зовут?">
                  <input className={inputCls} placeholder="Наталья" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
                </Q>
                <Q title="Телефон">
                  <input type="tel" inputMode="tel" className={inputCls} placeholder="+7 (___) ___-__-__" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
                </Q>
                <Q title="E-mail" hint="Для отчётов и подтверждений">
                  <input type="email" className={inputCls} placeholder="you@mail.ru" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
                </Q>
                <Q title="Ваш адрес" hint="Куда приехать специалисту">
                  <input className={inputCls} placeholder="ул. Пушкинская, 10, кв. 5" value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
                </Q>
                <div className="rounded-xl bg-surface-strong p-4 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">К оплате</span>
                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{summaryLine()}. Спишем перед оказанием услуги.</p>
                </div>
                <label className="flex items-start gap-2.5 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                  <span>Даю согласие на обработку персональных данных в соответствии с{" "}
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
              {!isLastStep ? (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600">
                  Далее <ArrowRight className="size-4" />
                </button>
              ) : (
                <button type="button" onClick={finish} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                  {saving ? "Оформляем…" : "Оформить заказ"} <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SmsAuthModal
        open={smsOpen}
        phone={smsMode === "login" ? loginPhone : contact.phone}
        onClose={() => setSmsOpen(false)}
        onVerified={async () => {
          setSmsOpen(false);
          refreshAuth();
          if (smsMode === "login") {
            // logged in at step 0 — pull saved pet data, stay in the wizard
            setContact((c) => ({ ...c, phone: c.phone || loginPhone }));
            await loadSavedPetIntoDraft();
            return;
          }
          setSaving(true);
          try { await submitOrder(); } catch { setSaving(false); setErr("Не удалось оформить заказ."); }
        }}
      />
    </div>
  );
}
