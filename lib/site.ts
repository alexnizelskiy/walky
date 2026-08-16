/**
 * Central site configuration — brand, contacts, geo, socials.
 * PLACEHOLDER contact data: replace with real values before launch.
 */

export const siteConfig = {
  name: "walky",
  legalName: "walky — выгул и передержка собак",
  tagline: "Выгул, няня и передержка собак в Ростове-на-Дону",
  description:
    "walky — выгул собак, няня и передержка в Ростове-на-Дону. Проверенные выгульщики, фотоотчёт с каждой прогулки, страховка и забота о питомце как о своём.",
  url: "https://walky.su",
  locale: "ru_RU",
  themeColor: "#fa9b27",

  // — Контакты —
  contacts: {
    phone: "+7 988 893-72-88",
    phoneHref: "tel:+79888937288",
    email: "madnatec1@yandex.ru",
    emailHref: "mailto:madnatec1@yandex.ru",
    telegram: "https://t.me/walky",
    telegramLabel: "@walky",
    whatsapp: "https://wa.me/79888937288",
    whatsappLabel: "WhatsApp",
    workingHours: "Ежедневно с 8:00 до 22:00",
  },

  // — География (основной город) —
  geo: {
    city: "Ростов-на-Дону",
    region: "Ростовская область",
    country: "RU",
    postalCode: "344000",
    street: "пр. Будённовский, 1",
    latitude: 47.2224,
    longitude: 39.7189,
  },

  // — Соцсети / карты —
  social: {
    vk: "https://vk.com/walky",
    instagram: "",
    yandexMaps: "https://yandex.ru/maps/39/rostov-na-donu/",
  },

  // — Юридическое (самозанятый / НПД) —
  legal: {
    sellerName: "Низельский Александр Александрович",
    sellerShort: "Самозанятый Низельский А.А., бренд walky",
    inn: "616615626580",
    taxRegime: "Налог на профессиональный доход (самозанятый)",
    selfEmployed: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
