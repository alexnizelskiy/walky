import { queryOne } from "@/lib/db";
import { sendSms } from "@/lib/sms";

/** Telegram message to the business owner. Dev/no-config → console. */
async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.info("[walky][tg:dev]\n" + text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("[walky][tg] failed:", err);
  }
}

interface BookingData {
  title?: string;
  city?: string; street?: string; apartment?: string;
  payment?: string; name?: string;
  pet?: { name?: string };
  walk?: { durationMin?: number; schedule?: string; frequency?: string };
  firstWalk?: boolean;
}

/** Notify the owner about a new walk order. */
export async function notifyOwnerNewBooking(data: BookingData, phone: string, payable: number): Promise<void> {
  const lines = [
    "🐶 <b>Новая заявка walky</b>",
    `Клиент: ${data.name || "—"} ${phone}`,
    data.pet?.name && `Питомец: ${data.pet.name}`,
    data.walk?.durationMin && `Выгул: ${data.walk.durationMin} мин${data.firstWalk ? " (первый, со скидкой)" : ""}`,
    data.walk?.schedule && `Расписание: ${data.walk.schedule}`,
    `Адрес: ${[data.city, data.street, data.apartment && "кв. " + data.apartment].filter(Boolean).join(", ")}`,
    `Оплата: ${data.payment === "card" ? "картой" : "наличными"}`,
    `К оплате: ${payable} ₽`,
  ].filter(Boolean);
  await sendTelegram(lines.join("\n"));
}

/** Generic owner Telegram notification (dev → console). */
export async function notifyOwner(text: string): Promise<void> {
  await sendTelegram(text);
}

/** SMS the client when their order status changes. */
export async function notifyBookingStatus(bookingId: string, status: string): Promise<void> {
  const row = await queryOne<{ data: unknown; phone: string }>(
    "SELECT b.data, cu.phone FROM bookings b JOIN users cu ON cu.id = b.user_id WHERE b.id = $1",
    [bookingId]
  );
  if (!row) return;
  const data = (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as BookingData;
  const petName = data.pet?.name ? `${data.pet.name}: ` : "";

  let text: string | null = null;
  if (status === "assigned") text = `walky: ${petName}вам назначен выгульщик. Ждём прогулку!`;
  else if (status === "in_progress") text = `walky: ${petName}выгульщик забрал питомца на прогулку.`;
  else if (status === "done") text = `walky: прогулка завершена. Спасибо! Будем рады вашей оценке в личном кабинете.`;
  if (text) await sendSms(row.phone, text);
}
