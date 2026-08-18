import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getCurrentUser, isAdmin, normalizePhone, newId } from "@/lib/auth";

/**
 * Approve an application and turn the applicant into an executor:
 * promote the matching user (by phone/email) or create a new executor account.
 * The person then logs in via SMS / OAuth and gets the executor cabinet.
 * Admin only (this changes roles).
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!isAdmin(admin)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const app = await queryOne<{ id: string; full_name: string | null; phone: string | null; email: string | null }>(
    "SELECT id, full_name, phone, email FROM sitter_applications WHERE id = $1",
    [id]
  );
  if (!app) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const phone = normalizePhone(app.phone ?? "");
  const email = (app.email ?? "").trim().toLowerCase() || null;
  const name = app.full_name?.trim() || null;

  // find an existing account by phone, then by email
  let existing: { id: string } | null = null;
  if (phone) existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE phone = $1", [phone]);
  if (!existing && email) existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE lower(trim(email)) = $1", [email]);

  let userId: string;
  let created = false;
  if (existing) {
    userId = existing.id;
    await query("UPDATE users SET role = 'executor', name = COALESCE(NULLIF(name, ''), $2) WHERE id = $1", [userId, name]);
  } else {
    userId = newId();
    await query(
      "INSERT INTO users (id, phone, name, email, role) VALUES ($1, $2, $3, $4, 'executor')",
      [userId, phone, name, email]
    );
    created = true;
  }

  await query("UPDATE sitter_applications SET status = 'approved', user_id = $2 WHERE id = $1", [id, userId]);

  return NextResponse.json({ ok: true, userId, created });
}
