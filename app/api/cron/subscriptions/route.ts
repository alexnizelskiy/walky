import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";
import { listActiveSubscriptions, isDueOn, markSubscriptionRun, scheduleLabel } from "@/lib/subscriptions";
import { chargeSaved, isConfigured } from "@/lib/yookassa";
import { notifyOwner } from "@/lib/notify";
import { sendSms } from "@/lib/sms";

/**
 * Daily job: for every active subscription with a walk due today, create the
 * booking, charge the saved card (if configured) — otherwise leave it unpaid
 * with a pay reminder — and notify client / executor / owner.
 *
 * Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token). Idempotent
 * per day via subscriptions.last_run_date, so a re-run won't double-charge.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // dev: allow, prod: require
  const header = request.headers.get("authorization") || "";
  const key = new URL(request.url).searchParams.get("key") || "";
  return header === `Bearer ${secret}` || key === secret;
}

async function run(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  // allow ?date=YYYY-MM-DD to test a specific day
  const override = new URL(request.url).searchParams.get("date");
  const today = override ? new Date(override + "T09:00:00") : new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const subs = await listActiveSubscriptions();
  let created = 0;
  let charged = 0;

  for (const sub of subs) {
    if (!isDueOn(sub.schedule, today, sub.lastRunDate)) continue;

    const bookingId = newId();
    const data = {
      ...sub.data,
      subscriptionId: sub.id,
      date: todayStr,
      time: sub.schedule.time,
      fromSubscription: true,
    };

    let paid = false;
    let paymentId: string | null = null;

    // recurring charge (only when a card is saved AND ЮKassa is live)
    if (sub.paymentMethodId && isConfigured()) {
      const res = await chargeSaved({
        paymentMethodId: sub.paymentMethodId,
        amount: sub.amount,
        description: `Абонемент walky · ${scheduleLabel(sub.schedule)}`,
        metadata: { subscription_id: sub.id, booking_id: bookingId },
      });
      if (res && (res.status === "succeeded" || res.status === "pending")) {
        paid = res.status === "succeeded";
        paymentId = res.id;
        charged += 1;
      }
    }

    await query(
      `INSERT INTO bookings (id, user_id, data, status, total, paid, payment_id, assignee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [bookingId, sub.userId, JSON.stringify(data), sub.assigneeId ? "assigned" : "searching", sub.amount, paid, paymentId, sub.assigneeId]
    );
    await markSubscriptionRun(sub.id, todayStr);
    created += 1;

    // ── reminders ──
    const petName = (sub.data.pet as { name?: string } | undefined)?.name || "питомца";
    const timeStr = sub.schedule.time ? ` в ${sub.schedule.time}` : "";
    const payNote = paid ? "" : sub.paymentMethodId ? "" : " Не забудьте оплатить.";

    const client = await queryOne<{ phone: string | null; name: string | null }>(
      "SELECT phone, name FROM users WHERE id = $1",
      [sub.userId]
    );
    if (client?.phone) {
      await sendSms(client.phone, `walky: сегодня${timeStr} выгул для ${petName}.${payNote}`).catch(() => {});
    }
    if (sub.assigneeId) {
      const exec = await queryOne<{ phone: string | null }>("SELECT phone FROM users WHERE id = $1", [sub.assigneeId]);
      if (exec?.phone) await sendSms(exec.phone, `walky: сегодня${timeStr} выгул ${petName} (абонемент).`).catch(() => {});
    }
    await notifyOwner(
      `🔔 Абонемент: сегодня${timeStr} выгул ${petName}. Клиент: ${client?.name || "—"} ${client?.phone || ""}. ${paid ? "Оплачено автосписанием." : "Оплата не списана."}`
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true, date: todayStr, dueCreated: created, charged });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
