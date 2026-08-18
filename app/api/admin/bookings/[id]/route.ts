import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { notifyBookingStatus } from "@/lib/notify";

const STATUSES = ["searching", "assigned", "in_progress", "done", "cancelled"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string; assigneeId?: string | null };

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
    }
    await query("UPDATE bookings SET status = $1 WHERE id = $2", [body.status, id]);
    // SMS the client on status change (dev logs; needs SMSC in prod)
    notifyBookingStatus(id, body.status).catch(() => {});
  }

  if (body.assigneeId !== undefined) {
    await query("UPDATE bookings SET assignee_id = $1 WHERE id = $2", [body.assigneeId || null, id]);
    if (body.assigneeId) {
      await query("UPDATE bookings SET status = 'assigned' WHERE id = $1 AND status = 'searching'", [id]);
    }
  }

  return NextResponse.json({ ok: true });
}
