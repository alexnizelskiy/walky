import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { scheduleLabel, type Schedule } from "@/lib/subscriptions";

interface Row {
  id: string;
  service: string;
  data: unknown;
  schedule: unknown;
  amount: number;
  status: string;
  payment_method_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  assignee_name: string | null;
  last_run: string | null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const rows = await query<Row>(
    `SELECT s.id, s.service, s.data, s.schedule, s.amount, s.status, s.payment_method_id,
            cu.name AS client_name, cu.phone AS client_phone, au.name AS assignee_name,
            to_char(s.last_run_date, 'YYYY-MM-DD') AS last_run
       FROM subscriptions s
       JOIN users cu ON cu.id = s.user_id
       LEFT JOIN users au ON au.id = s.assignee_id
      ORDER BY s.created_at DESC LIMIT 500`
  );

  const subscriptions = rows.map((r) => {
    const data = (typeof r.data === "string" ? JSON.parse(r.data) : r.data) as Record<string, unknown>;
    const schedule = (typeof r.schedule === "string" ? JSON.parse(r.schedule) : r.schedule) as Schedule;
    return {
      id: r.id,
      service: r.service,
      scheduleLabel: scheduleLabel(schedule),
      amount: r.amount,
      status: r.status,
      hasCard: !!r.payment_method_id,
      petName: (data.pet as { name?: string } | undefined)?.name ?? "",
      client: { name: r.client_name, phone: r.client_phone },
      assigneeName: r.assignee_name,
      lastRun: r.last_run,
    };
  });
  return NextResponse.json({ ok: true, subscriptions });
}
