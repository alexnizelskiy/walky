import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listPets, upsertPetFromWizard, getPet, type PetInput } from "@/lib/pets-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const pets = await listPets(user.id);
  return NextResponse.json({ ok: true, pets });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as PetInput | null;
  if (!body || !body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });
  }

  const id = await upsertPetFromWizard(user.id, body);
  if (!id) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 422 });

  const pet = await getPet(id, user.id);
  return NextResponse.json({ ok: true, id, pet });
}
