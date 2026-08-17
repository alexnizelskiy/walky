import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerByEmail, createSession } from "@/lib/auth";
import { ensureRefCode, applyReferral } from "@/lib/bonus";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };

  const { user, error } = await registerByEmail(body.email ?? "", body.password ?? "", body.name ?? null);
  if (error || !user) {
    const status = error === "email_taken" ? 409 : 422;
    return NextResponse.json({ ok: false, error: error ?? "invalid_input" }, { status });
  }

  await ensureRefCode(user.id);

  // brand-new user — apply referral captured on landing (?ref=CODE)
  const store = await cookies();
  const ref = store.get("walky_ref")?.value;
  if (ref) {
    await applyReferral(user.id, ref);
    store.delete("walky_ref");
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
