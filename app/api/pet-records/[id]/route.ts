import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteRecord } from "@/lib/pet-records";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteRecord(id, user.id);
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
