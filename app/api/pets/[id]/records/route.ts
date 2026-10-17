import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listRecords, addRecord, type RecordInput, type RecordKind } from "@/lib/pet-records";

const KINDS: RecordKind[] = ["vaccine", "treatment", "weight", "diary"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const records = await listRecords(id, user.id);
  return NextResponse.json({ ok: true, records });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = (await request.json().catch(() => null)) as RecordInput | null;
  if (!body || !KINDS.includes(body.kind)) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }

  const record = await addRecord(user.id, id, body);
  if (!record) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, record });
}
