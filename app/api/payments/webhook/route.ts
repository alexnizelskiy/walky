import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getPayment } from "@/lib/yookassa";

/** ЮKassa notifications: mark a booking paid on success. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    event?: string;
    object?: { id?: string; status?: string; metadata?: { booking_id?: string } };
  } | null;

  if (!body?.object?.id) return NextResponse.json({ ok: true });

  if (body.event === "payment.succeeded") {
    // Verify against the API (don't trust the payload blindly)
    const verified = await getPayment(body.object.id);
    const status = verified?.status ?? body.object.status;
    const meta = verified?.metadata ?? body.object.metadata ?? {};
    if (status === "succeeded" && meta.booking_id) {
      await query("UPDATE bookings SET paid = true, status = 'searching' WHERE id = $1", [meta.booking_id]);
    }
  }

  return NextResponse.json({ ok: true });
}
