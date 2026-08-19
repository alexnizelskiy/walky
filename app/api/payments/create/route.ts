import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createPayment } from "@/lib/yookassa";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { bookingId?: string; subscriptionId?: string | null };
  if (!body.bookingId) {
    return NextResponse.json({ ok: false, error: "no_booking" }, { status: 422 });
  }

  const booking = await queryOne<{ id: string; total: number }>(
    "SELECT id, total FROM bookings WHERE id = $1 AND user_id = $2",
    [body.bookingId, user.id]
  );
  if (!booking) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const origin = new URL(request.url).origin;
  const returnUrl = `${origin}/cabinet?paid=${booking.id}`;

  // For a subscription's first payment, save the card so the cron can auto-charge.
  const metadata: Record<string, string> = { booking_id: booking.id };
  if (body.subscriptionId) metadata.subscription_id = body.subscriptionId;

  try {
    const payment = await createPayment({
      amount: booking.total,
      description: `Выгул walky, заказ ${booking.id.slice(0, 8)}`,
      metadata,
      savePaymentMethod: !!body.subscriptionId,
      returnUrl,
    });

    if (payment) {
      // Real ЮKassa: store payment id, redirect user to hosted page
      await query("UPDATE bookings SET payment_id = $1 WHERE id = $2", [payment.id, booking.id]);
      return NextResponse.json({ ok: true, url: payment.confirmationUrl });
    }

    // Test mode (no ЮKassa creds): simulate a successful payment
    await query("UPDATE bookings SET paid = true WHERE id = $1", [booking.id]);
    return NextResponse.json({ ok: true, url: returnUrl, test: true });
  } catch {
    return NextResponse.json({ ok: false, error: "payment_failed" }, { status: 502 });
  }
}
