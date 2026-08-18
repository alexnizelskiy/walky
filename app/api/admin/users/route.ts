import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

interface Row {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();

  const rows = q
    ? await query<Row>(
        `SELECT id, name, phone, email, role, created_at FROM users
          WHERE lower(coalesce(name,'')) LIKE $1 OR coalesce(phone,'') LIKE $1 OR lower(coalesce(email,'')) LIKE $1
          ORDER BY created_at DESC LIMIT 200`,
        [`%${q}%`]
      )
    : await query<Row>(
        `SELECT id, name, phone, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 200`
      );

  return NextResponse.json({ ok: true, users: rows });
}
