import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

interface Row {
  id: string;
  data: unknown;
  status: string;
  total: number;
  paid: boolean;
  created_at: string;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const rows = await query<Row>(
    `SELECT b.id, b.data, b.status, b.total, b.paid, b.created_at,
            cu.name AS client_name, cu.phone AS client_phone, cu.email AS client_email,
            b.assignee_id, au.name AS assignee_name
       FROM bookings b
       JOIN users cu ON cu.id = b.user_id
       LEFT JOIN users au ON au.id = b.assignee_id
      ORDER BY b.created_at DESC
      LIMIT 500`
  );

  const bookings = rows.map((r) => {
    const data = (typeof r.data === "string" ? JSON.parse(r.data) : r.data) as Record<string, unknown>;
    return {
      id: r.id,
      status: r.status,
      total: r.total,
      paid: r.paid,
      createdAt: r.created_at,
      title: (data.title as string) ?? "Заказ",
      service: (data.service as string) ?? null,
      street: (data.street as string) ?? "",
      city: (data.city as string) ?? "",
      petName: (data.pet as { name?: string } | undefined)?.name ?? "",
      client: { name: r.client_name, phone: r.client_phone, email: r.client_email },
      assignee: r.assignee_id ? { id: r.assignee_id, name: r.assignee_name } : null,
    };
  });
  return NextResponse.json({ ok: true, bookings });
}
