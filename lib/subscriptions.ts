/**
 * Recurring walk subscriptions (абонементы). A subscription stores the order
 * details + a weekly schedule (days of week + time). A daily cron creates the
 * walk booking for each due day, charges the saved card (ЮKassa recurring) when
 * configured — otherwise leaves it unpaid with a pay reminder — and notifies
 * the client, executor and owner.
 *
 * Server-only.
 */
import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";

/** ISO day of week: 1 = Monday … 7 = Sunday. */
export interface Schedule {
  days: number[];
  time: string; // "HH:MM"
}

export interface SubscriptionInput {
  userId: string;
  service: string;
  data: Record<string, unknown>;
  schedule: Schedule;
  amount: number;
  paymentMethodId?: string | null;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  service: string;
  data: unknown;
  schedule: unknown;
  amount: number;
  payment_method_id: string | null;
  status: string;
  assignee_id: string | null;
  last_run_date: string | null;
  created_at: string;
}

const DOW_LABELS = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/** ISO day of week (1..7) for a Date. */
export function isoDow(d: Date): number {
  const g = d.getDay(); // 0=Sun..6=Sat
  return g === 0 ? 7 : g;
}

export function scheduleLabel(s: Schedule): string {
  const days = (s.days ?? []).slice().sort((a, b) => a - b).map((d) => DOW_LABELS[d]).join(", ");
  return `${days || "—"}${s.time ? ` в ${s.time}` : ""}`;
}

function parseJson<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") { try { return JSON.parse(v) as T; } catch { return fallback; } }
  return v as T;
}

export interface Subscription {
  id: string;
  service: string;
  data: Record<string, unknown>;
  schedule: Schedule;
  amount: number;
  hasCard: boolean;
  status: string;
  assigneeId: string | null;
  lastRunDate: string | null;
  createdAt: string;
}

function toSubscription(r: SubscriptionRow): Subscription {
  return {
    id: r.id,
    service: r.service,
    data: parseJson<Record<string, unknown>>(r.data, {}),
    schedule: parseJson<Schedule>(r.schedule, { days: [], time: "" }),
    amount: r.amount,
    hasCard: !!r.payment_method_id,
    status: r.status,
    assigneeId: r.assignee_id,
    lastRunDate: r.last_run_date,
    createdAt: r.created_at,
  };
}

export async function createSubscription(input: SubscriptionInput): Promise<string> {
  const id = newId();
  await query(
    `INSERT INTO subscriptions (id, user_id, service, data, schedule, amount, payment_method_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
    [id, input.userId, input.service, JSON.stringify(input.data), JSON.stringify(input.schedule), input.amount, input.paymentMethodId ?? null]
  );
  return id;
}

// Read last_run_date as text to avoid pg returning a local-midnight Date
// (which breaks the YYYY-MM-DD idempotency compare across timezones).
const COLS =
  "id, user_id, service, data, schedule, amount, payment_method_id, status, assignee_id, to_char(last_run_date, 'YYYY-MM-DD') AS last_run_date, created_at";

export async function listSubscriptions(userId: string): Promise<Subscription[]> {
  const rows = await query<SubscriptionRow>(
    `SELECT ${COLS} FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(toSubscription);
}

export async function cancelSubscription(id: string, userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "UPDATE subscriptions SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return rows.length > 0;
}

export async function setSubscriptionStatus(id: string, userId: string, status: "active" | "paused" | "cancelled"): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "UPDATE subscriptions SET status = $3 WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId, status]
  );
  return rows.length > 0;
}

/** All active subscriptions (for the cron). */
export async function listActiveSubscriptions(): Promise<(Subscription & { userId: string; paymentMethodId: string | null })[]> {
  const rows = await query<SubscriptionRow>(`SELECT ${COLS} FROM subscriptions WHERE status = 'active'`);
  return rows.map((r) => ({ ...toSubscription(r), userId: r.user_id, paymentMethodId: r.payment_method_id }));
}

export async function markSubscriptionRun(id: string, date: string): Promise<void> {
  await query("UPDATE subscriptions SET last_run_date = $2 WHERE id = $1", [id, date]);
}

/** Is a walk due today for this schedule (and not already run today)? */
export function isDueOn(s: Schedule, day: Date, lastRunDate: string | null): boolean {
  const today = day.toISOString().slice(0, 10);
  if (lastRunDate === today) return false;
  return (s.days ?? []).includes(isoDow(day));
}
