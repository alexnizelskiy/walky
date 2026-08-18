import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyBookingStatus } from "@/lib/notify";

// Executors may only move their own assigned orders along these states.
const ALLOWED = ["assigned", "in_progress", "done"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "executor") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
  }

  // only the assigned executor can change their own order
  const own = await queryOne<{ id: string }>(
    "SELECT id FROM bookings WHERE id = $1 AND assignee_id = $2",
    [id, user.id]
  );
  if (!own) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await query("UPDATE bookings SET status = $1 WHERE id = $2", [body.status, id]);
  notifyBookingStatus(id, body.status).catch(() => {});

  return NextResponse.json({ ok: true });
}
