/**
 * Sitter/walker job application — data-driven form config.
 * Shared by the application wizard (/stat-vygulshchikom/anketa) and the admin
 * view, so labels stay in sync. Pure data (client-safe). Original walky copy.
 */
export type SitterFieldType = "text" | "textarea" | "email" | "tel" | "date" | "choice";

export interface SitterField {
  key: string;
  label: string;
  type: SitterFieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options?: string[]; // for type "choice"
}

export interface SitterStep {
  title: string;
  mascot: string;
  fields: SitterField[];
}

export const sitterSteps: SitterStep[] = [
  {
    title: "О себе",
    mascot: "Привет! Давай знакомиться. Сначала — кем хочешь работать и пара слов о тебе.",
    fields: [
      { key: "role", label: "Кем хотите работать?", type: "choice", required: true, options: ["Выгульщик", "Ситтер (няня / передержка)", "И то, и другое"], hint: "Выгул — прогулки; ситтер — няня и передержка" },
      { key: "fullName", label: "Как вас зовут? Укажите ФИО полностью", type: "text", required: true, placeholder: "Иванов Иван Иванович", hint: "Фамилия, имя и отчество" },
      { key: "birthday", label: "Дата рождения", type: "date", placeholder: "дд.мм.гггг" },
    ],
  },
  {
    title: "Соответствие",
    mascot: "Несколько быстрых вопросов — чтобы понять, подходим ли мы друг другу.",
    fields: [
      { key: "city", label: "Вы живёте в Ростове-на-Дону или области?", type: "choice", required: true, options: ["Да", "Нет"] },
      { key: "adult", label: "Вам уже исполнилось 18 лет?", type: "choice", required: true, options: ["Да", "Нет"] },
      { key: "citizenship", label: "Ваше гражданство", type: "choice", required: true, options: ["Гражданин РФ", "Другое"] },
      { key: "criminal", label: "Были ли у вас судимости?", type: "choice", required: true, options: ["Нет, не было", "Да, были"] },
      { key: "selfEmployed", label: "Готовы работать официально, как самозанятый?", type: "choice", required: true, options: ["Да", "Нет"] },
    ],
  },
  {
    title: "Контакты",
    mascot: "Как с вами связаться? Эти данные увидят только координаторы walky.",
    fields: [
      { key: "email", label: "Активный e-mail для связи", type: "email", required: true, placeholder: "you@mail.ru" },
      { key: "phone", label: "Телефон (лучше с Telegram)", type: "tel", required: true, placeholder: "+7 (___) ___-__-__" },
      { key: "telegram", label: "Ник в Telegram", type: "text", placeholder: "@nickname", hint: "По нему мы сможем вас найти" },
      { key: "inn", label: "ИНН", type: "text", hint: "Понадобится для оформления самозанятости. Узнать можно на nalog.ru" },
    ],
  },
  {
    title: "Опыт",
    mascot: "Расскажите о себе побольше — это самое важное для нас.",
    fields: [
      { key: "about", label: "Расскажите о себе и опыте с животными", type: "textarea", required: true, hint: "Опыт с собаками, кошками или другими питомцами, увлечения" },
      { key: "myPets", label: "Есть ли у вас свои питомцы? Расскажите о них", type: "textarea", hint: "Характер, привычки, как относятся к другим животным" },
      { key: "scenario", label: "На прогулке пёс подобрал что-то с земли и рычит, если пытаться забрать. Ваши действия?", type: "textarea", required: true, hint: "Опишите, как поступите" },
      { key: "why", label: "Почему хотите присоединиться к walky?", type: "textarea" },
    ],
  },
];

/** Flat list of all fields — used by the admin view to render answers. */
export const sitterFields: SitterField[] = sitterSteps.flatMap((s) => s.fields);

export const emptySitterAnswers: Record<string, string> = Object.fromEntries(
  sitterFields.map((f) => [f.key, ""])
);

const KEY = "walky-sitter-application-draft";

export function saveSitterDraft(d: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
}
export function getSitterDraft(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch { return null; }
}
export function clearSitterDraft(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
