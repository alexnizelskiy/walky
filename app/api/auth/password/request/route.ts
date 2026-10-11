import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const origin = new URL(request.url).origin;

  const res = await requestPasswordReset(body.email ?? "");
  if (res) {
    const link = `${origin}/reset-password?token=${res.token}`;
    const html = `
      <p>Здравствуйте${res.user.name ? ", " + res.user.name : ""}!</p>
      <p>Вы запросили сброс пароля в walky. Нажмите на ссылку, чтобы задать новый пароль (действует 1 час):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>`;
    await sendEmail(res.user.email!, "Сброс пароля — walky", html).catch(() => {});
  }

  // Never reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
