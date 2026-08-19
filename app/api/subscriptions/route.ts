import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listSubscriptions, createSubscription, type Schedule } from "@/lib/subscriptions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const subscriptions = await listSubscriptions(user.id);
  return NextResponse.json({ ok: true, subscriptions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    service?: string;
    data?: Record<string, unknown>;
    schedule?: Schedule;
    amount?: number;
  } | null;

  const days = body?.schedule?.days ?? [];
  if (!body || !body.data || !Array.isArray(days) || days.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }

  const id = await createSubscription({
    userId: user.id,
    service: body.service || "vygul",
    data: body.data,
    schedule: { days: days.filter((d) => d >= 1 && d <= 7), time: body.schedule?.time || "" },
    amount: Math.max(0, Math.round(Number(body.amount ?? 0))),
  });
  return NextResponse.json({ ok: true, id });
}
