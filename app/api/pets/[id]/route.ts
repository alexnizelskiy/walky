import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updatePet, deletePet, type PetInput } from "@/lib/pets-db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as PetInput | null;
  if (!body) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });

  const pet = await updatePet(id, user.id, body);
  if (!pet) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, pet });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ok = await deletePet(id, user.id);
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
