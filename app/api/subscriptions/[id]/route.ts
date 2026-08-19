import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setSubscriptionStatus } from "@/lib/subscriptions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !["active", "paused", "cancelled"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "bad_status" }, { status: 422 });
  }
  const ok = await setSubscriptionStatus(id, user.id, body.status as "active" | "paused" | "cancelled");
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
