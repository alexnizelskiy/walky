"use client";

import * as React from "react";
import { Syringe, Scale, BookOpen, Bell, Plus, Trash2, Check, X, Calendar, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "vaccine" | "treatment" | "weight" | "diary";

interface Rec {
  id: string;
  kind: Kind;
  title: string;
  value: string;
  eventDate: string | null;
  remindAt: string | null;
  notes: string;
  photoUrl: string | null;
}

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function fmt(d: string | null): string {
  if (!d) return "";
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
function isSoon(remindAt: string | null): boolean {
  if (!remindAt) return false;
  const d = new Date(remindAt + "T00:00:00").getTime();
  return d - Date.now() < 21 * 864e5; // within 3 weeks (incl. overdue)
}

export function PetDiary({ petId }: { petId: string }) {
  const [tab, setTab] = React.useState<"health" | "weight" | "diary">("health");
  const [records, setRecords] = React.useState<Rec[] | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch(`/api/pets/${petId}/records`).then((x) => x.json()).catch(() => ({ ok: false }));
    setRecords(r.ok ? r.records : []);
  }, [petId]);

  React.useEffect(() => { load(); }, [load]);

  async function add(input: Record<string, unknown>) {
    await fetch(`/api/pets/${petId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/pet-records/${id}`, { method: "DELETE" });
    load();
  }

  const health = (records ?? []).filter((r) => r.kind === "vaccine" || r.kind === "treatment");
  const weights = (records ?? []).filter((r) => r.kind === "weight");
  const diary = (records ?? []).filter((r) => r.kind === "diary");

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        {(
          [
            ["health", "Здоровье", Syringe],
            ["weight", "Вес", Scale],
            ["diary", "Дневник", BookOpen],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 pb-3 text-base font-semibold transition-colors",
              tab === id ? "border-brand-500 text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {records === null ? (
          <div className="h-40 rounded-3xl border border-border bg-card" />
        ) : tab === "health" ? (
          <HealthTab items={health} onAdd={add} onDelete={remove} />
        ) : tab === "weight" ? (
          <WeightTab items={weights} onAdd={add} onDelete={remove} />
        ) : (
          <DiaryTab items={diary} onAdd={add} onDelete={remove} />
        )}
      </div>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
      <Plus className="size-4" /> {label}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</p>;
}

// ── Health (vaccines + treatments) ──
function HealthTab({ items, onAdd, onDelete }: { items: Rec[]; onAdd: (i: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [kind, setKind] = React.useState<"vaccine" | "treatment">("vaccine");
  const [title, setTitle] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [remindAt, setRemindAt] = React.useState("");
  const [notes, setNotes] = React.useState("");

  function save() {
    if (!title.trim()) return;
    onAdd({ kind, title, eventDate, remindAt, notes });
    setTitle(""); setEventDate(""); setRemindAt(""); setNotes(""); setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Прививки и обработки</h3>
        {!open && <AddButton onClick={() => setOpen(true)} label="Добавить" />}
      </div>

      {open && (
        <Card>
          <div className="flex gap-2">
            {([["vaccine", "Прививка"], ["treatment", "Обработка от паразитов"]] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setKind(v)} className={cn("flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors", kind === v ? "border-brand-500" : "border-border hover:border-brand-300")}>{l}</button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            <input className={inputCls} placeholder={kind === "vaccine" ? "Бешенство, комплексная…" : "От клещей, глистогонное…"} value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-2.5">
              <label className="text-xs font-medium text-muted-foreground">Дата
                <input type="date" className={cn(inputCls, "mt-1")} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </label>
              <label className="text-xs font-medium text-muted-foreground">Следующая (напомним)
                <input type="date" className={cn(inputCls, "mt-1")} value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
              </label>
            </div>
            <input className={inputCls} placeholder="Заметка (необязательно)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><Check className="size-4" /> Сохранить</button>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface"><X className="size-4" /> Отмена</button>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0 && !open ? (
        <Empty text="Пока нет записей. Добавьте прививки и обработки — напомним, когда подойдёт срок." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <Syringe className="size-4 text-brand-500" /> {r.title}
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">{r.kind === "vaccine" ? "Прививка" : "Обработка"}</span>
                  </p>
                  {r.eventDate && <p className="mt-1 text-sm text-muted-foreground">Сделано: {fmt(r.eventDate)}</p>}
                  {r.remindAt && (
                    <p className={cn("mt-0.5 inline-flex items-center gap-1 text-sm", isSoon(r.remindAt) ? "font-semibold text-brand-600" : "text-muted-foreground")}>
                      <Bell className="size-3.5" /> Следующая: {fmt(r.remindAt)}
                    </p>
                  )}
                  {r.notes && <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>}
                </div>
                <button type="button" onClick={() => onDelete(r.id)} aria-label="Удалить" className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Weight ──
function WeightTab({ items, onAdd, onDelete }: { items: Rec[]; onAdd: (i: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [eventDate, setEventDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const latest = items[0];

  function save() {
    if (!value.trim()) return;
    onAdd({ kind: "weight", value, eventDate });
    setValue(""); setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Вес</h3>
        {!open && <AddButton onClick={() => setOpen(true)} label="Записать вес" />}
      </div>

      {latest && !open && (
        <Card>
          <p className="text-sm text-muted-foreground">Последнее измерение</p>
          <p className="mt-1 text-3xl font-extrabold text-brand-600">{latest.value} кг</p>
          {latest.eventDate && <p className="text-sm text-muted-foreground">{fmt(latest.eventDate)}</p>}
        </Card>
      )}

      {open && (
        <Card>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="text-xs font-medium text-muted-foreground">Вес, кг
              <input type="number" step="0.1" min="0" className={cn(inputCls, "mt-1")} placeholder="12.4" value={value} onChange={(e) => setValue(e.target.value)} />
            </label>
            <label className="text-xs font-medium text-muted-foreground">Дата
              <input type="date" className={cn(inputCls, "mt-1")} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><Check className="size-4" /> Сохранить</button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface"><X className="size-4" /> Отмена</button>
          </div>
        </Card>
      )}

      {items.length === 0 && !open ? (
        <Empty text="Записывайте вес питомца — так проще следить за здоровьем." />
      ) : items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {items.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4">
              <span className="font-semibold">{r.value} кг</span>
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                {fmt(r.eventDate)}
                <button type="button" onClick={() => onDelete(r.id)} aria-label="Удалить" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Diary ──
function DiaryTab({ items, onAdd, onDelete }: { items: Rec[]; onAdd: (i: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [eventDate, setEventDate] = React.useState(() => new Date().toISOString().slice(0, 10));

  function save() {
    if (!notes.trim()) return;
    onAdd({ kind: "diary", notes, eventDate });
    setNotes(""); setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Дневник</h3>
        {!open && <AddButton onClick={() => setOpen(true)} label="Новая запись" />}
      </div>

      {open && (
        <Card>
          <label className="text-xs font-medium text-muted-foreground">Дата
            <input type="date" className={cn(inputCls, "mt-1 max-w-[200px]")} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </label>
          <textarea className={cn(inputCls, "mt-3 h-auto py-3")} rows={3} placeholder="Что сегодня было? Первый выгул, новая команда, забавный момент…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Camera className="size-3.5" /> Фото к записям — скоро</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><Check className="size-4" /> Сохранить</button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface"><X className="size-4" /> Отмена</button>
          </div>
        </Card>
      )}

      {items.length === 0 && !open ? (
        <Empty text="Здесь будет история вашего питомца — записывайте моменты и события." />
      ) : (
        <div className="relative flex flex-col gap-3 pl-6">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden />
          {items.map((r) => (
            <div key={r.id} className="relative">
              <span className="absolute -left-[22px] top-1.5 size-3.5 rounded-full border-2 border-brand-400 bg-background" aria-hidden />
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Calendar className="size-3.5" /> {fmt(r.eventDate)}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm">{r.notes}</p>
                  </div>
                  <button type="button" onClick={() => onDelete(r.id)} aria-label="Удалить" className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
