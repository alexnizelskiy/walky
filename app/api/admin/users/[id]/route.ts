import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";

const ROLES = ["client", "executor", "manager", "admin"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  // only full admins may change roles
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  if (!body.role || !ROLES.includes(body.role)) {
    return NextResponse.json({ ok: false, error: "bad_role" }, { status: 422 });
  }

  // don't let an admin demote themselves (avoid locking out)
  if (id === user!.id && body.role !== "admin") {
    return NextResponse.json({ ok: false, error: "cant_demote_self" }, { status: 409 });
  }

  await query("UPDATE users SET role = $1 WHERE id = $2", [body.role, id]);
  return NextResponse.json({ ok: true });
}
