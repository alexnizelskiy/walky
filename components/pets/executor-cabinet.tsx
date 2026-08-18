"use client";

import * as React from "react";
import { MapPin, Phone, Check, PawPrint, Clock } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface ExecBooking {
  id: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: string;
  title: string;
  service: string | null;
  street: string;
  city: string;
  pet: { name?: string; breed?: string } | null;
  behavior: Record<string, string> | null;
  walk: { schedule?: string; feed?: string; washPaws?: string; access?: string; notes?: string } | null;
  nanny: { schedule?: string; feed?: string; access?: string; notes?: string } | null;
  boarding: { dateFrom?: string; feed?: string; walk?: string; access?: string; notes?: string } | null;
  client: { name: string | null; phone: string | null };
}

const STATUS: Record<string, { label: string; cls: string }> = {
  searching: { label: "Ищем исполнителя", cls: "bg-warning/15 text-warning-foreground" },
  assigned: { label: "Назначен вам", cls: "bg-cyan-100 text-cyan-700" },
  in_progress: { label: "В работе", cls: "bg-brand-100 text-brand-700" },
  done: { label: "Выполнен", cls: "bg-brand-100 text-brand-700" },
  cancelled: { label: "Отменён", cls: "bg-surface-strong text-muted-foreground" },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function detailRows(b: ExecBooking): { label: string; value: string }[] {
  const src = b.walk ?? b.nanny ?? b.boarding ?? {};
  const rows: { label: string; value: string }[] = [];
  const s = src as Record<string, string | undefined>;
  if (b.boarding?.dateFrom) rows.push({ label: "Заезд", value: b.boarding.dateFrom });
  if (s.schedule) rows.push({ label: "Когда", value: s.schedule });
  if (s.feed) rows.push({ label: "Кормление", value: s.feed });
  if (b.walk?.washPaws) rows.push({ label: "Мыть лапы", value: b.walk.washPaws });
  if (b.boarding?.walk) rows.push({ label: "Прогулки", value: b.boarding.walk });
  if (s.access) rows.push({ label: "Доступ", value: s.access });
  if (s.notes) rows.push({ label: "Заметки", value: s.notes });
  return rows;
}

export function ExecutorCabinet() {
  const [bookings, setBookings] = React.useState<ExecBooking[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/executor/bookings").then((r) => r.json()).catch(() => ({ ok: false }));
    setBookings(r.ok ? r.bookings : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      await fetch(`/api/executor/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (bookings === null) return <div className="h-40 rounded-2xl border border-border bg-card" />;

  const active = bookings.filter((b) => b.status !== "done" && b.status !== "cancelled");
  const done = bookings.filter((b) => b.status === "done");

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700">
          <PawPrint className="size-6" />
        </span>
        <p className="mt-3 font-semibold">Пока нет назначенных заявок</p>
        <p className="mt-1 text-sm text-muted-foreground">Как только вам назначат заказ, он появится здесь.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title="Активные заявки" items={active} busy={busy} onStatus={setStatus} emptyText="Активных заявок нет." />
      {done.length > 0 && <Section title="Выполненные" items={done} busy={busy} onStatus={setStatus} emptyText="" />}
    </div>
  );
}

function Section({
  title, items, busy, onStatus, emptyText,
}: {
  title: string;
  items: ExecBooking[];
  busy: string | null;
  onStatus: (id: string, status: string) => void;
  emptyText: string;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((b) => {
            const st = STATUS[b.status] ?? { label: b.status, cls: "bg-surface-strong text-muted-foreground" };
            const rows = detailRows(b);
            return (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        <Clock className="size-4 text-brand-500" /> {b.title}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.pet?.name && <span className="font-medium text-foreground">{b.pet.name}</span>}
                      {b.pet?.breed ? ` · ${b.pet.breed}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(b.createdAt)}</p>
                  </div>
                  <p className="text-lg font-bold">{formatPrice(b.total)}</p>
                </div>

                {/* Client contact */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium">{b.client.name || "Клиент"}</span>
                  {b.client.phone && (
                    <a href={`tel:${b.client.phone}`} className="inline-flex items-center gap-1 text-primary">
                      <Phone className="size-3.5" /> {b.client.phone}
                    </a>
                  )}
                  {(b.street || b.city) && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5" /> {[b.city, b.street].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>

                {/* Details */}
                {rows.length > 0 && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1 border-t border-border pt-3 text-sm sm:grid-cols-2">
                    {rows.map((r) => (
                      <div key={r.label} className="flex gap-2">
                        <dt className="shrink-0 text-muted-foreground">{r.label}:</dt>
                        <dd className="font-medium">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
                  {b.status === "assigned" && (
                    <button type="button" disabled={busy === b.id} onClick={() => onStatus(b.id, "in_progress")}
                      className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                      {busy === b.id ? "…" : "Взять в работу"}
                    </button>
                  )}
                  {b.status === "in_progress" && (
                    <button type="button" disabled={busy === b.id} onClick={() => onStatus(b.id, "done")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                      <Check className="size-4" /> {busy === b.id ? "…" : "Завершить"}
                    </button>
                  )}
                  {b.status === "done" && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Check className="size-4 text-brand-500" /> Заявка выполнена
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
