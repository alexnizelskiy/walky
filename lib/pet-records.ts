/**
 * Pet diary / health journal records: vaccines, antiparasitic treatments,
 * weight log and diary notes. Server-only.
 */
import { query, queryOne } from "@/lib/db";
import { newId } from "@/lib/auth";

export type RecordKind = "vaccine" | "treatment" | "weight" | "diary";

export interface PetRecord {
  id: string;
  petId: string;
  kind: RecordKind;
  title: string;
  value: string;
  eventDate: string | null;
  remindAt: string | null;
  notes: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface RecordInput {
  kind: RecordKind;
  title?: string;
  value?: string;
  eventDate?: string | null;
  remindAt?: string | null;
  notes?: string;
  photoUrl?: string | null;
}

interface Row {
  id: string;
  pet_id: string;
  kind: string;
  title: string | null;
  value: string | null;
  event_date: string | null;
  remind_at: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
}

// Dates read as text to avoid pg returning a local-midnight Date.
const COLS =
  "id, pet_id, kind, title, value, to_char(event_date,'YYYY-MM-DD') AS event_date, to_char(remind_at,'YYYY-MM-DD') AS remind_at, notes, photo_url, created_at";

function toRecord(r: Row): PetRecord {
  return {
    id: r.id,
    petId: r.pet_id,
    kind: (r.kind as RecordKind) ?? "diary",
    title: r.title ?? "",
    value: r.value ?? "",
    eventDate: r.event_date,
    remindAt: r.remind_at,
    notes: r.notes ?? "",
    photoUrl: r.photo_url,
    createdAt: r.created_at,
  };
}

/** Verify the pet belongs to the user. */
async function ownsPet(petId: string, userId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>("SELECT id FROM pets WHERE id = $1 AND user_id = $2", [petId, userId]);
  return !!row;
}

export async function listRecords(petId: string, userId: string): Promise<PetRecord[]> {
  if (!(await ownsPet(petId, userId))) return [];
  const rows = await query<Row>(
    `SELECT ${COLS} FROM pet_records WHERE pet_id = $1 ORDER BY coalesce(event_date, created_at::date) DESC, created_at DESC`,
    [petId]
  );
  return rows.map(toRecord);
}

export async function addRecord(userId: string, petId: string, input: RecordInput): Promise<PetRecord | null> {
  if (!(await ownsPet(petId, userId))) return null;
  const id = newId();
  await query(
    `INSERT INTO pet_records (id, pet_id, user_id, kind, title, value, event_date, remind_at, notes, photo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      id, petId, userId, input.kind,
      input.title ?? null, input.value ?? null,
      input.eventDate || null, input.remindAt || null,
      input.notes ?? null, input.photoUrl ?? null,
    ]
  );
  const row = await queryOne<Row>(`SELECT ${COLS} FROM pet_records WHERE id = $1`, [id]);
  return row ? toRecord(row) : null;
}

export async function deleteRecord(id: string, userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM pet_records WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return rows.length > 0;
}

/** Records due for a reminder today (for the cron). */
export async function dueReminders(today: string): Promise<
  { id: string; userId: string; petName: string; kind: string; title: string; remindAt: string }[]
> {
  return query(
    `SELECT r.id, r.user_id AS "userId", p.name AS "petName", r.kind, coalesce(r.title,'') AS title,
            to_char(r.remind_at,'YYYY-MM-DD') AS "remindAt"
       FROM pet_records r JOIN pets p ON p.id = r.pet_id
      WHERE r.remind_at IS NOT NULL AND r.reminded = false AND r.remind_at <= $1::date`,
    [today]
  );
}

export async function markReminded(id: string): Promise<void> {
  await query("UPDATE pet_records SET reminded = true WHERE id = $1", [id]);
}
