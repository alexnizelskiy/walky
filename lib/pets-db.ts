/**
 * Pet profiles (dog-walking product). A saved pet carries the data collected in
 * the walk-order wizard so returning clients don't re-enter it and can manage it
 * from the pet cabinet on pets.floby.ru.
 *
 * Server-only: never import from Client Components.
 */
import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";

export interface PetBehavior {
  pullsLeash: string;
  picksUp: string;
  canTakeAway: string;
  aggression: string;
  offLeash: string;
  contactDogs: string;
}

export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  gender: "female" | "male" | null;
  birthday: string;
  weight: number;
  has: string[];
  clinic: string;
  hasIllness: boolean;
  illnessText: string;
  behavior: PetBehavior;
  createdAt: string;
  updatedAt: string;
}

/** Shape accepted from the wizard / API (all optional so partial edits work). */
export interface PetInput {
  name?: string;
  breed?: string;
  gender?: "female" | "male" | null;
  birthday?: string;
  weight?: number;
  has?: string[];
  clinic?: string;
  hasIllness?: boolean;
  illnessText?: string;
  behavior?: Partial<PetBehavior>;
}

const emptyBehavior: PetBehavior = {
  pullsLeash: "", picksUp: "", canTakeAway: "", aggression: "", offLeash: "", contactDogs: "",
};

interface PetRow {
  id: string;
  name: string;
  breed: string | null;
  gender: string | null;
  birthday: string | null;
  weight: number | null;
  has: unknown;
  clinic: string | null;
  has_illness: boolean;
  illness_text: string | null;
  behavior: unknown;
  created_at: string;
  updated_at: string;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

function rowToPet(r: PetRow): PetProfile {
  return {
    id: r.id,
    name: r.name,
    breed: r.breed ?? "",
    gender: r.gender === "female" || r.gender === "male" ? r.gender : null,
    birthday: r.birthday ?? "",
    weight: r.weight ?? 0,
    has: parseJson<string[]>(r.has, []),
    clinic: r.clinic ?? "",
    hasIllness: !!r.has_illness,
    illnessText: r.illness_text ?? "",
    behavior: { ...emptyBehavior, ...parseJson<Partial<PetBehavior>>(r.behavior, {}) },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const COLS =
  "id, name, breed, gender, birthday, weight, has, clinic, has_illness, illness_text, behavior, created_at, updated_at";

export async function listPets(userId: string): Promise<PetProfile[]> {
  const rows = await query<PetRow>(
    `SELECT ${COLS} FROM pets WHERE user_id = $1 ORDER BY created_at ASC`,
    [userId]
  );
  return rows.map(rowToPet);
}

export async function getPet(id: string, userId: string): Promise<PetProfile | null> {
  const row = await queryOne<PetRow>(
    `SELECT ${COLS} FROM pets WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return row ? rowToPet(row) : null;
}

/**
 * Insert a pet, or update the existing one that matches by name (case-insensitive)
 * for this user — so re-ordering a walk for "Арчи" enriches the same profile
 * instead of duplicating it. Returns the pet id.
 */
export async function upsertPetFromWizard(userId: string, input: PetInput): Promise<string | null> {
  const name = (input.name ?? "").trim();
  if (!name) return null;

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM pets WHERE user_id = $1 AND lower(name) = lower($2) LIMIT 1`,
    [userId, name]
  );
  if (existing) {
    await updatePet(existing.id, userId, input);
    return existing.id;
  }

  const id = newId();
  await query(
    `INSERT INTO pets (id, user_id, name, breed, gender, birthday, weight, has, clinic, has_illness, illness_text, behavior)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      id,
      userId,
      name,
      input.breed ?? "",
      input.gender ?? null,
      input.birthday ?? "",
      Math.round(Number(input.weight ?? 0)) || 0,
      JSON.stringify(input.has ?? []),
      input.clinic ?? "",
      !!input.hasIllness,
      input.illnessText ?? "",
      JSON.stringify({ ...emptyBehavior, ...(input.behavior ?? {}) }),
    ]
  );
  return id;
}

/** Partial update of an owned pet. Only provided fields are written. */
export async function updatePet(id: string, userId: string, patch: PetInput): Promise<PetProfile | null> {
  const current = await getPet(id, userId);
  if (!current) return null;

  const merged = {
    name: patch.name?.trim() || current.name,
    breed: patch.breed ?? current.breed,
    gender: patch.gender === undefined ? current.gender : patch.gender,
    birthday: patch.birthday ?? current.birthday,
    weight: patch.weight === undefined ? current.weight : Math.round(Number(patch.weight)) || 0,
    has: patch.has ?? current.has,
    clinic: patch.clinic ?? current.clinic,
    hasIllness: patch.hasIllness === undefined ? current.hasIllness : !!patch.hasIllness,
    illnessText: patch.illnessText ?? current.illnessText,
    behavior: { ...current.behavior, ...(patch.behavior ?? {}) },
  };

  await query(
    `UPDATE pets SET name = $3, breed = $4, gender = $5, birthday = $6, weight = $7,
            has = $8, clinic = $9, has_illness = $10, illness_text = $11, behavior = $12,
            updated_at = now()
      WHERE id = $1 AND user_id = $2`,
    [
      id,
      userId,
      merged.name,
      merged.breed,
      merged.gender,
      merged.birthday,
      merged.weight,
      JSON.stringify(merged.has),
      merged.clinic,
      merged.hasIllness,
      merged.illnessText,
      JSON.stringify(merged.behavior),
    ]
  );
  return getPet(id, userId);
}

export async function deletePet(id: string, userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM pets WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return rows.length > 0;
}
