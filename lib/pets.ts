/**
 * Dog-walking order model — durations + prices (first walk discounted),
 * behaviour/pet options. Региональные цены (Ростов-на-Дону) — ~30% ниже
 * московских. Меняются здесь; мастер заказа и страницы услуг берут отсюда.
 */
export interface WalkDuration {
  min: number;
  price: number; // обычная цена
  first: number; // цена первого выгула (скидка)
}

export const walkDurations: WalkDuration[] = [
  { min: 20, price: 620, first: 199 },
  { min: 45, price: 760, first: 249 },
  { min: 60, price: 890, first: 299 },
  { min: 90, price: 1040, first: 449 },
  { min: 120, price: 1180, first: 519 },
  { min: 180, price: 1530, first: 649 },
];

export function walkPrice(min: number, firstWalk: boolean): number {
  const d = walkDurations.find((x) => x.min === min) ?? walkDurations[2];
  return firstWalk ? d.first : d.price;
}

export const petHasOptions = [
  "Ветпаспорт",
  "Прививки",
  "Защита от клещей",
  "Кастрация или стерилизация",
  "Нет ничего из этого",
] as const;

export const accessOptions = [
  "Дома встретят",
  "Ключи будут в тайном месте",
  "Передам ключи специалисту",
  "Ключи уже у специалиста",
] as const;

// ─── Услуги ───
export type PetService = "vygul" | "nyanya" | "peredergka";

export const serviceMeta: Record<PetService, { label: string; emoji: string; verb: string }> = {
  vygul: { label: "Выгул", emoji: "🦮", verb: "выгул" },
  nyanya: { label: "Няня", emoji: "🧡", verb: "услуги няни" },
  peredergka: { label: "Передержка", emoji: "🏠", verb: "передержку" },
};

// Няня — цена по количеству часов
export const nannyHours = [
  { h: 1, price: 690 },
  { h: 2, price: 1050 },
  { h: 3, price: 1390 },
  { h: 4, price: 1750 },
  { h: 8, price: 2450 },
];
export function nannyPrice(hours: number): number {
  return nannyHours.find((x) => x.h === hours)?.price ?? nannyHours[0].price;
}

// Передержка — цена за сутки (дешевле при длительном сроке), у ситтера или у вас дома
export function boardingPerDay(days: number, atHome: boolean): number {
  if (atHome) return days >= 7 ? 1490 : 1690;
  return days >= 7 ? 990 : days >= 3 ? 1150 : 1290;
}
export function boardingPrice(days: number, atHome: boolean): number {
  const d = Math.max(1, days);
  return boardingPerDay(d, atHome) * d;
}

export interface PetWalkDraft {
  service: PetService;
  returning: "yes" | "no" | null;
  pet: {
    name: string;
    breed: string;
    gender: "female" | "male" | null;
    birthday: string;
    weight: number;
    has: string[];
    clinic: string;
    hasIllness: "no" | "yes" | null;
    illnessText: string;
  };
  behavior: {
    pullsLeash: string;
    picksUp: string;
    canTakeAway: string;
    aggression: string;
    offLeash: string;
    contactDogs: string;
  };
  walk: {
    durationMin: number;
    frequency: string;
    schedule: string;
    scheduleDays: number[]; // ISO 1..7 for a regular subscription
    scheduleTime: string;   // "HH:MM"
    feed: string;
    washPaws: string;
    access: string;
    notes: string;
  };
  nanny: {
    hours: number;
    schedule: string;
    feed: string;
    access: string;
    notes: string;
  };
  boarding: {
    days: number;
    atHome: "sitter" | "home" | null;
    dateFrom: string;
    feed: string;
    walk: string;
    access: string;
    notes: string;
  };
}

export const emptyPetWalkDraft: PetWalkDraft = {
  service: "vygul",
  returning: null,
  pet: { name: "", breed: "", gender: null, birthday: "", weight: 10, has: [], clinic: "", hasIllness: null, illnessText: "" },
  behavior: { pullsLeash: "", picksUp: "", canTakeAway: "", aggression: "", offLeash: "", contactDogs: "" },
  walk: { durationMin: 60, frequency: "", schedule: "", scheduleDays: [], scheduleTime: "", feed: "", washPaws: "", access: "", notes: "" },
  nanny: { hours: 2, schedule: "", feed: "", access: "", notes: "" },
  boarding: { days: 1, atHome: null, dateFrom: "", feed: "", walk: "", access: "", notes: "" },
};

/** Итоговая цена по услуге и черновику (первый выгул со скидкой). */
export function draftTotal(d: PetWalkDraft): number {
  if (d.service === "nyanya") return nannyPrice(d.nanny.hours);
  if (d.service === "peredergka") return boardingPrice(d.boarding.days, d.boarding.atHome === "home");
  return walkPrice(d.walk.durationMin, d.returning === "no");
}

const KEY = "walky-pet-order-draft";

export function savePetDraft(d: PetWalkDraft): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
}
export function getPetDraft(): PetWalkDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PetWalkDraft) : null;
  } catch { return null; }
}
export function clearPetDraft(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
