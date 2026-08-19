"use client";

import * as React from "react";
import Link from "next/link";
import {
  PawPrint, Plus, Trash2, Pencil, Check, X, MapPin, CalendarClock, Clock, Stethoscope, ShieldCheck,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { petHasOptions } from "@/lib/pets";

const BEHAVIOR_QUESTIONS: { key: string; label: string; options: string[] }[] = [
  { key: "pullsLeash", label: "Тянет за поводок?", options: ["Нет", "Иногда", "Сильно"] },
  { key: "picksUp", label: "Подбирает с земли?", options: ["Нет", "Иногда", "Сильно"] },
  { key: "canTakeAway", label: "Если подберёт, можно отобрать?", options: ["Нет", "Да", "Будет сложно"] },
  { key: "aggression", label: "Есть к чему-то агрессия?", options: ["Нет", "Да"] },
  { key: "offLeash", label: "Можно отпускать без поводка?", options: ["Да", "Нет"] },
  { key: "contactDogs", label: "Контакт с другими собаками?", options: ["Да", "Нет"] },
];

interface PetBehavior {
  pullsLeash: string; picksUp: string; canTakeAway: string;
  aggression: string; offLeash: string; contactDogs: string;
}
interface Pet {
  id: string;
  name: string;
  breed: string;
  gender: "female" | "male" | null;
  birthday: string;
  weight: number;
  has: string[];
  clinic: string;
  hasIllness: boolean;
  illnessText: string;
  behavior: PetBehavior;
}

interface WalkBooking {
  id: string;
  kind?: string;
  title?: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: string;
  firstWalk?: boolean;
  walk?: { durationMin?: number; schedule?: string; frequency?: string };
  pet?: { name?: string };
  street?: string;
  city?: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  searching: { label: "Ищем выгульщика", cls: "bg-warning/15 text-warning-foreground" },
  assigned: { label: "Выгульщик назначен", cls: "bg-brand-100 text-brand-700" },
  in_progress: { label: "На прогулке", cls: "bg-brand-100 text-brand-700" },
  done: { label: "Завершён", cls: "bg-brand-100 text-brand-700" },
  cancelled: { label: "Отменён", cls: "bg-surface-strong text-muted-foreground" },
};

function petAge(birthday: string): string {
  const m = birthday.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (!m) return "";
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (Number.isNaN(d.getTime())) return "";
  const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years < 0 || years > 40) return "";
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} мес.`;
  }
  const yr = Math.floor(years);
  const word = yr % 10 === 1 && yr % 100 !== 11 ? "год" : yr % 10 >= 2 && yr % 10 <= 4 && (yr % 100 < 10 || yr % 100 >= 20) ? "года" : "лет";
  return `${yr} ${word}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const behaviorLabels: { key: keyof PetBehavior; label: string }[] = [
  { key: "pullsLeash", label: "Тянет поводок" },
  { key: "picksUp", label: "Подбирает с земли" },
  { key: "canTakeAway", label: "Можно отобрать" },
  { key: "aggression", label: "Агрессия" },
  { key: "offLeash", label: "Без поводка" },
  { key: "contactDogs", label: "Контакт с собаками" },
];

export function PetCabinet() {
  const [pets, setPets] = React.useState<Pet[] | null>(null);
  const [orders, setOrders] = React.useState<WalkBooking[] | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [p, b] = await Promise.all([
        fetch("/api/pets").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ]);
      setPets(p.ok ? (p.pets as Pet[]) : []);
      setOrders(
        b.ok ? (b.bookings as WalkBooking[]).filter((x) => x.kind?.startsWith("pet")) : []
      );
    } catch {
      setPets([]);
      setOrders([]);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Мои питомцы</h2>
          {pets && pets.length > 0 && !adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface"
            >
              <Plus className="size-4" /> Добавить питомца
            </button>
          )}
        </div>

        {pets === null ? (
          <div className="h-40 rounded-2xl border border-border bg-card" />
        ) : adding ? (
          <AddPetForm onDone={() => { setAdding(false); load(); }} onCancel={() => setAdding(false)} />
        ) : pets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700">
              <PawPrint className="size-6" />
            </span>
            <p className="mt-3 font-semibold">Заполните профиль питомца</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Расскажите о питомце один раз — и при заказе не придётся вводить данные заново. Это займёт минуту.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Plus className="size-4" /> Добавить питомца
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onChanged={load} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">История выгулов</h2>
        {orders === null ? (
          <div className="h-32 rounded-2xl border border-border bg-card" />
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Здесь появятся ваши заказы на выгул.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
            {orders.map((o) => {
              const st = STATUS[o.status] ?? { label: o.status, cls: "bg-surface-strong text-muted-foreground" };
              return (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Clock className="size-4 text-brand-500" />
                        {o.title ?? (o.walk?.durationMin ? `Выгул ${o.walk.durationMin} мин` : "Заказ")}
                      </span>
                      {o.firstWalk && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          Первый выгул
                        </span>
                      )}
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {o.pet?.name && <span>{o.pet.name}</span>}
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3.5" /> {formatDate(o.createdAt)}
                      </span>
                      {(o.street || o.city) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" /> {[o.city, o.street].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(o.total)}</p>
                    <p className="text-xs text-muted-foreground">{o.paid ? "Оплачено" : "Ожидает оплаты"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function PetCard({ pet, onChanged }: { pet: Pet; onChanged: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [form, setForm] = React.useState({
    name: pet.name, breed: pet.breed, birthday: pet.birthday,
    weight: pet.weight, clinic: pet.clinic,
  });

  React.useEffect(() => {
    setForm({ name: pet.name, breed: pet.breed, birthday: pet.birthday, weight: pet.weight, clinic: pet.clinic });
  }, [pet]);

  const age = petAge(pet.birthday);

  async function save() {
    setBusy(true);
    try {
      await fetch(`/api/pets/${pet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, weight: Number(form.weight) }),
      });
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetch(`/api/pets/${pet.id}`, { method: "DELETE" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl">🐶</span>
          <div>
            {editing ? (
              <input className={cn(inputCls, "font-bold")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            ) : (
              <p className="text-lg font-bold">{pet.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {[pet.breed, pet.gender === "female" ? "девочка" : pet.gender === "male" ? "мальчик" : "", age]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        {!editing && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setEditing(true)} aria-label="Редактировать" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => setConfirmDel(true)} aria-label="Удалить" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 flex flex-col gap-2.5">
          <label className="text-xs font-medium text-muted-foreground">Порода
            <input className={cn(inputCls, "mt-1")} value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="text-xs font-medium text-muted-foreground">День рождения
              <input className={cn(inputCls, "mt-1")} placeholder="10.02.2024" value={form.birthday} onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))} />
            </label>
            <label className="text-xs font-medium text-muted-foreground">Вес, кг
              <input type="number" min={1} max={90} className={cn(inputCls, "mt-1")} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))} />
            </label>
          </div>
          <label className="text-xs font-medium text-muted-foreground">Ветклиника
            <input className={cn(inputCls, "mt-1")} value={form.clinic} onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))} />
          </label>
          <div className="mt-1 flex gap-2">
            <button type="button" disabled={busy} onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              <Check className="size-4" /> Сохранить
            </button>
            <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface">
              <X className="size-4" /> Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {pet.weight > 0 && <span>Вес: <b className="text-foreground">{pet.weight} кг</b></span>}
            {pet.clinic && <span className="inline-flex items-center gap-1"><Stethoscope className="size-3.5" /> {pet.clinic}</span>}
          </div>

          {pet.has.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pet.has.map((h) => (
                <span key={h} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  <ShieldCheck className="size-3" /> {h}
                </span>
              ))}
            </div>
          )}

          {pet.hasIllness && pet.illnessText && (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
              Здоровье: {pet.illnessText}
            </p>
          )}

          {behaviorLabels.some((b) => pet.behavior[b.key]) && (
            <div className="border-t border-border pt-3">
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Поведение</p>
              <div className="flex flex-wrap gap-1.5">
                {behaviorLabels
                  .filter((b) => pet.behavior[b.key])
                  .map((b) => (
                    <span key={b.key} className="rounded-full border border-border px-2.5 py-1 text-xs">
                      {b.label}: <b>{pet.behavior[b.key]}</b>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {confirmDel && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <span>Удалить профиль «{pet.name}»?</span>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50">
              Удалить
            </button>
            <button type="button" onClick={() => setConfirmDel(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddPetForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({
    name: "", breed: "", gender: "" as "" | "female" | "male", birthday: "", weight: 10, clinic: "",
    has: [] as string[], hasIllness: false, illnessText: "",
    behavior: {} as Record<string, string>,
  });
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const inputCls = "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";
  const toggleHas = (o: string) => setForm((f) => ({ ...f, has: f.has.includes(o) ? f.has.filter((x) => x !== o) : [...f.has, o] }));
  const setBeh = (k: string, v: string) => setForm((f) => ({ ...f, behavior: { ...f.behavior, [k]: v } }));

  async function save() {
    if (!form.name.trim()) return setErr("Укажите кличку питомца");
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, gender: form.gender || null, weight: Number(form.weight) }),
      });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setErr("Не удалось сохранить. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-2xl">🐶</span>
        <h3 className="text-lg font-bold">Новый питомец</h3>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <label className="text-xs font-medium text-muted-foreground">Кличка *
          <input className={cn(inputCls, "mt-1")} placeholder="Арчи" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label className="text-xs font-medium text-muted-foreground">Порода
          <input className={cn(inputCls, "mt-1")} placeholder="Хаски" value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))} />
        </label>
        <div className="flex gap-2">
          {(["female", "male"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((f) => ({ ...f, gender: f.gender === g ? "" : g }))}
              className={cn(
                "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                form.gender === g ? "border-brand-500" : "border-border hover:border-brand-300"
              )}
            >
              {g === "female" ? "Девочка" : "Мальчик"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-muted-foreground">День рождения
            <input className={cn(inputCls, "mt-1")} placeholder="10.02.2024" value={form.birthday} onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))} />
          </label>
          <label className="text-xs font-medium text-muted-foreground">Вес, кг
            <input type="number" min={1} max={90} className={cn(inputCls, "mt-1")} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))} />
          </label>
        </div>
        <label className="text-xs font-medium text-muted-foreground">Ветклиника
          <input className={cn(inputCls, "mt-1")} value={form.clinic} onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))} />
        </label>

        {/* Что есть у питомца */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Что из этого есть у питомца?</p>
          <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {petHasOptions.map((o) => {
              const on = form.has.includes(o);
              return (
                <button key={o} type="button" onClick={() => toggleHas(o)}
                  className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors", on ? "border-brand-500" : "border-border hover:border-brand-300")}>
                  <span className={cn("grid size-4 shrink-0 place-items-center rounded border-2 text-[10px]", on ? "border-brand-500 bg-brand-500 text-white" : "border-input")}>{on && "✓"}</span>
                  {o}
                </button>
              );
            })}
          </div>
        </div>

        {/* Болезни */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Есть ли болезни у питомца?</p>
          <div className="mt-1.5 flex gap-2">
            {([["no", "Нет"], ["yes", "Да"]] as const).map(([v, label]) => (
              <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, hasIllness: v === "yes" }))}
                className={cn("flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors", form.hasIllness === (v === "yes") ? "border-brand-500" : "border-border hover:border-brand-300")}>
                {label}
              </button>
            ))}
          </div>
          {form.hasIllness && (
            <textarea className={cn(inputCls, "mt-2 h-auto py-2")} rows={2} placeholder="Опишите" value={form.illnessText} onChange={(e) => setForm((f) => ({ ...f, illnessText: e.target.value }))} />
          )}
        </div>

        {/* Поведение */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">Поведение</p>
          <div className="mt-1.5 flex flex-col gap-2.5">
            {BEHAVIOR_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p className="text-sm">{q.label}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <button key={o} type="button" onClick={() => setBeh(q.key, o)}
                      className={cn("rounded-lg border px-3 py-1.5 text-sm transition-colors", form.behavior[q.key] === o ? "border-brand-500" : "border-border hover:border-brand-300")}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="mt-1 flex gap-2">
          <button type="button" disabled={busy} onClick={save} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
            <Check className="size-4" /> {busy ? "Сохраняем…" : "Сохранить питомца"}
          </button>
          <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface">
            <X className="size-4" /> Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
