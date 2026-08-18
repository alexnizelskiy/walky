import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff, newId } from "@/lib/auth";
import { sitterFields } from "@/lib/sitter";

interface Row {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  data: unknown;
  status: string;
  created_at: string;
}

// Public: submit a job application.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { data?: Record<string, string> } | null;
  const data = body?.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }

  // required fields per config
  for (const f of sitterFields) {
    if (f.required && !String(data[f.key] ?? "").trim()) {
      return NextResponse.json({ ok: false, error: "missing_" + f.key }, { status: 422 });
    }
  }

  const user = await getCurrentUser();
  const id = newId();
  await query(
    `INSERT INTO sitter_applications (id, user_id, full_name, phone, email, data, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'new')`,
    [
      id,
      user?.id ?? null,
      String(data.fullName ?? "").trim() || null,
      String(data.phone ?? "").trim() || null,
      String(data.email ?? "").trim() || null,
      JSON.stringify(data),
    ]
  );
  return NextResponse.json({ ok: true, id });
}

// Staff: list all applications.
export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const rows = await query<Row>(
    `SELECT id, full_name, phone, email, data, status, created_at
       FROM sitter_applications ORDER BY created_at DESC LIMIT 500`
  );
  const applications = rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    status: r.status,
    createdAt: r.created_at,
    answers: (typeof r.data === "string" ? JSON.parse(r.data) : r.data) as Record<string, string>,
  }));
  return NextResponse.json({ ok: true, applications });
}
