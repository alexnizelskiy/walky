import { NextResponse } from "next/server";
import { loginByEmail, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };

  const { user, error } = await loginByEmail(body.email ?? "", body.password ?? "");
  if (error || !user) {
    return NextResponse.json({ ok: false, error: error ?? "invalid_credentials" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
