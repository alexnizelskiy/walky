import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface Row {
  id: string;
  data: unknown;
  status: string;
  total: number;
  paid: boolean;
  created_at: string;
  client_name: string | null;
  client_phone: string | null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "executor") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const rows = await query<Row>(
    `SELECT b.id, b.data, b.status, b.total, b.paid, b.created_at,
            cu.name AS client_name, cu.phone AS client_phone
       FROM bookings b
       JOIN users cu ON cu.id = b.user_id
      WHERE b.assignee_id = $1
      ORDER BY b.created_at DESC
      LIMIT 200`,
    [user.id]
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
      pet: data.pet ?? null,
      behavior: data.behavior ?? null,
      walk: data.walk ?? null,
      nanny: data.nanny ?? null,
      boarding: data.boarding ?? null,
      client: { name: r.client_name, phone: r.client_phone },
    };
  });
  return NextResponse.json({ ok: true, bookings });
}
