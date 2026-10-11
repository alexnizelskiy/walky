import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; password?: string };
  if (!body.token) return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 422 });

  const res = await resetPassword(body.token, body.password ?? "");
  if ("error" in res) {
    const status = res.error === "weak_password" ? 422 : 400;
    return NextResponse.json({ ok: false, error: res.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
