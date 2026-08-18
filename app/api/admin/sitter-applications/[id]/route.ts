import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

const STATUSES = ["new", "approved", "rejected"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
  }

  await query("UPDATE sitter_applications SET status = $1 WHERE id = $2", [body.status, id]);
  return NextResponse.json({ ok: true });
}
