/**
 * Email sending. Uses Resend (https://resend.com) when RESEND_API_KEY is set,
 * otherwise logs to the console in dev (so flows are testable before email is
 * connected — same pattern as SMS). Server-only.
 */
const FROM = process.env.EMAIL_FROM || "walky <noreply@walky.su>";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[walky][email:dev] to=${to} · ${subject}\n${html.replace(/<[^>]+>/g, " ").trim()}`);
    return true; // dev: pretend sent
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[walky][email] send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[walky][email] error:", err);
    return false;
  }
}
