"use client";

import * as React from "react";
import { MapPin, Phone, Search, Check, ChevronDown } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { sitterFields } from "@/lib/sitter";

interface Booking {
  id: string;
  status: string;
  total: number;
  paid: boolean;
  createdAt: string;
  title: string;
  service: string | null;
  street: string;
  city: string;
  petName: string;
  client: { name: string | null; phone: string | null; email: string | null };
  assignee: { id: string; name: string | null } | null;
}

interface Person {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  searching: { label: "Ищем исполнителя", cls: "bg-warning/15 text-warning-foreground" },
  assigned: { label: "Назначен", cls: "bg-cyan-100 text-cyan-700" },
  in_progress: { label: "В работе", cls: "bg-brand-100 text-brand-700" },
  done: { label: "Выполнен", cls: "bg-brand-100 text-brand-700" },
  cancelled: { label: "Отменён", cls: "bg-surface-strong text-muted-foreground" },
};
const STATUS_ORDER = ["searching", "assigned", "in_progress", "done", "cancelled"];

const ROLES: Record<string, string> = {
  client: "Клиент",
  executor: "Исполнитель",
  manager: "Менеджер",
  admin: "Админ",
};

const selectCls =
  "h-9 rounded-lg border border-input bg-background px-2 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminPanel({ isAdmin }: { isAdmin: boolean }) {
  const [tab, setTab] = React.useState<"bookings" | "subscriptions" | "users" | "applications">("bookings");

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        {(
          [
            ["bookings", "Заявки"],
            ["subscriptions", "Абонементы"],
            ["applications", "Анкеты"],
            ["users", "Пользователи"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-base font-semibold transition-colors",
              tab === id ? "border-brand-500 text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "bookings" ? <BookingsTab /> : tab === "subscriptions" ? <SubscriptionsTab /> : tab === "applications" ? <ApplicationsTab canApprove={isAdmin} /> : <UsersTab canEditRoles={isAdmin} />}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = React.useState<Booking[] | null>(null);
  const [executors, setExecutors] = React.useState<Person[]>([]);

  const load = React.useCallback(async () => {
    const [b, u] = await Promise.all([
      fetch("/api/admin/bookings").then((r) => r.json()).catch(() => ({ ok: false })),
      fetch("/api/admin/users").then((r) => r.json()).catch(() => ({ ok: false })),
    ]);
    setBookings(b.ok ? b.bookings : []);
    setExecutors(u.ok ? (u.users as Person[]).filter((p) => p.role !== "client") : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function patch(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    load();
  }

  if (bookings === null) return <div className="h-40 rounded-2xl border border-border bg-card" />;
  if (bookings.length === 0) return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Заявок пока нет.</p>;

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => {
        const st = STATUS[b.status] ?? { label: b.status, cls: "bg-surface-strong text-muted-foreground" };
        return (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{b.title}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                  {b.paid && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      <Check className="size-3" /> Оплачено
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {b.petName && <span className="font-medium text-foreground">{b.petName}</span>}
                  {b.petName && " · "}
                  {b.client.name || "—"}
                  {b.client.phone && (
                    <a href={`tel:${b.client.phone}`} className="ml-2 inline-flex items-center gap-1 text-primary">
                      <Phone className="size-3.5" /> {b.client.phone}
                    </a>
                  )}
                </p>
                {(b.street || b.city) && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {[b.city, b.street].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(b.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatPrice(b.total)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Статус</span>
                <select className={selectCls} value={b.status} onChange={(e) => patch(b.id, { status: e.target.value })}>
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{STATUS[s].label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Исполнитель</span>
                <select className={selectCls} value={b.assignee?.id ?? ""} onChange={(e) => patch(b.id, { assigneeId: e.target.value || null })}>
                  <option value="">— не назначен —</option>
                  {executors.map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.phone || p.email || p.id.slice(0, 6)}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UsersTab({ canEditRoles }: { canEditRoles: boolean }) {
  const [users, setUsers] = React.useState<Person[] | null>(null);
  const [q, setQ] = React.useState("");

  const load = React.useCallback(async (query: string) => {
    const r = await fetch(`/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ""}`)
      .then((r) => r.json())
      .catch(() => ({ ok: false }));
    setUsers(r.ok ? r.users : []);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q, load]);

  async function setRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load(q);
  }

  return (
    <div>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по имени, телефону, e-mail"
          className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm focus-visible:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        />
      </div>

      {users === null ? (
        <div className="mt-5 h-40 rounded-2xl border border-border bg-card" />
      ) : users.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Ничего не найдено.</p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{u.name || "Без имени"}</p>
                <p className="text-sm text-muted-foreground">{[u.phone, u.email].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              {canEditRoles ? (
                <select className={selectCls} value={u.role} onChange={(e) => setRole(u.id, e.target.value)}>
                  {Object.entries(ROLES).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              ) : (
                <span className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-muted-foreground">{ROLES[u.role] ?? u.role}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Application {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  answers: Record<string, string>;
}

const APP_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Новая", cls: "bg-warning/15 text-warning-foreground" },
  approved: { label: "Одобрена", cls: "bg-brand-100 text-brand-700" },
  rejected: { label: "Отклонена", cls: "bg-surface-strong text-muted-foreground" },
};
const APP_STATUS_ORDER = ["new", "approved", "rejected"];

function ApplicationsTab({ canApprove }: { canApprove: boolean }) {
  const [apps, setApps] = React.useState<Application[] | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<Record<string, string>>({});

  const load = React.useCallback(async () => {
    const r = await fetch("/api/sitter-applications").then((r) => r.json()).catch(() => ({ ok: false }));
    setApps(r.ok ? r.applications : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/sitter-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function approve(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/admin/sitter-applications/${id}/approve`, { method: "POST" })
        .then((r) => r.json())
        .catch(() => ({ ok: false }));
      setNote((n) => ({
        ...n,
        [id]: r.ok
          ? (r.created ? "Создан аккаунт исполнителя. Пусть войдёт по телефону/Яндекс." : "Существующему пользователю выдана роль исполнителя.")
          : "Не удалось. Проверьте телефон/e-mail в анкете.",
      }));
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (apps === null) return <div className="h-40 rounded-2xl border border-border bg-card" />;
  if (apps.length === 0) return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Анкет пока нет.</p>;

  return (
    <div className="flex flex-col gap-3">
      {apps.map((app) => {
        const st = APP_STATUS[app.status] ?? { label: app.status, cls: "bg-surface-strong text-muted-foreground" };
        const expanded = open === app.id;
        return (
          <div key={app.id} className="rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : app.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{app.fullName || "Без имени"}</span>
                  {app.answers.role && (
                    <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">{app.answers.role}</span>
                  )}
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[app.phone, app.email].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            </button>

            {expanded && (
              <div className="border-t border-border p-5">
                <dl className="flex flex-col gap-3">
                  {sitterFields.map((f) => {
                    const v = app.answers[f.key];
                    if (!v) return null;
                    return (
                      <div key={f.key}>
                        <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
                        <dd className="mt-0.5 whitespace-pre-wrap text-sm">{v}</dd>
                      </div>
                    );
                  })}
                </dl>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Статус</span>
                    <select className={selectCls} value={app.status} onChange={(e) => setStatus(app.id, e.target.value)}>
                      {APP_STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{APP_STATUS[s].label}</option>
                      ))}
                    </select>
                  </label>
                  {canApprove && (
                    <button
                      type="button"
                      disabled={busy === app.id}
                      onClick={() => approve(app.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                    >
                      <Check className="size-4" /> {busy === app.id ? "…" : "Одобрить → создать исполнителя"}
                    </button>
                  )}
                  {app.phone && (
                    <a href={`tel:${app.phone}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <Phone className="size-4" /> Позвонить
                    </a>
                  )}
                </div>
                {note[app.id] && <p className="mt-2 text-sm text-brand-700">{note[app.id]}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface AdminSubscription {
  id: string;
  service: string;
  scheduleLabel: string;
  amount: number;
  status: string;
  hasCard: boolean;
  petName: string;
  client: { name: string | null; phone: string | null };
  assigneeName: string | null;
  lastRun: string | null;
}

const SUB_STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "bg-brand-100 text-brand-700" },
  paused: { label: "На паузе", cls: "bg-warning/15 text-warning-foreground" },
  cancelled: { label: "Отменён", cls: "bg-surface-strong text-muted-foreground" },
};

function SubscriptionsTab() {
  const [subs, setSubs] = React.useState<AdminSubscription[] | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/subscriptions").then((r) => r.json()).then((d) => setSubs(d.ok ? d.subscriptions : [])).catch(() => setSubs([]));
  }, []);

  if (subs === null) return <div className="h-40 rounded-2xl border border-border bg-card" />;
  if (subs.length === 0) return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Абонементов пока нет.</p>;

  return (
    <div className="flex flex-col gap-3">
      {subs.map((s) => {
        const st = SUB_STATUS[s.status] ?? { label: s.status, cls: "bg-surface-strong text-muted-foreground" };
        return (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">Регулярный выгул{s.petName ? ` · ${s.petName}` : ""}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", s.hasCard ? "bg-cyan-100 text-cyan-700" : "bg-surface-strong text-muted-foreground")}>
                    {s.hasCard ? "Автосписание" : "Без карты"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.scheduleLabel} · {formatPrice(s.amount)}/выгул
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {s.client.name || "—"}
                  {s.client.phone && (
                    <a href={`tel:${s.client.phone}`} className="ml-2 inline-flex items-center gap-1 text-primary">
                      <Phone className="size-3.5" /> {s.client.phone}
                    </a>
                  )}
                  {s.assigneeName && <span> · исполнитель: {s.assigneeName}</span>}
                </p>
              </div>
              {s.lastRun && <p className="text-xs text-muted-foreground">Последний выгул: {s.lastRun}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
