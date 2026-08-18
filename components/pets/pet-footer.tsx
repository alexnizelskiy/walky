import Link from "next/link";
import { Send, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

const serviceLinks = [
  { label: "О сервисе", href: "/o-servise" },
  { label: "Юридическая информация", href: "/requisites" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Наши контакты", href: "/contacts" },
];

const joinLinks = [
  { label: "Стать выгульщиком", href: "/#join" },
  { label: "Стать догситтером", href: "/#join" },
];

export function PetFooter() {
  const { contacts, legal, geo } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-ink-950 text-white md:mt-24">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-16">
          {/* Support */}
          <div>
            <p className="text-sm font-semibold text-white/60">Обратиться в поддержку</p>
            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href={contacts.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary-hover"
              >
                <Send className="size-4" /> Telegram
              </a>
              <a
                href={contacts.phoneHref}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Phone className="size-4" /> {contacts.phone}
              </a>
              <a
                href={contacts.emailHref}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Mail className="size-4" /> E-mail
              </a>
            </div>
          </div>

          {/* О сервисе */}
          <div>
            <p className="text-sm font-semibold text-white">О сервисе</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {serviceLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Подключиться */}
          <div>
            <p className="text-sm font-semibold text-white">Подключиться</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {joinLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/45">
          <p>
            © {year} walky. {legal.sellerShort}, ИНН {legal.inn}. {geo.city}.
          </p>
          <p className="mt-1">Забота о питомцах как о своих.</p>
        </div>
      </div>
    </footer>
  );
}
