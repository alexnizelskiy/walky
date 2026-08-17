"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmsAuthModal } from "@/features/booking/sms-auth-modal";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const EMAIL_ERRORS: Record<string, string> = {
  invalid_email: "Введите корректный e-mail",
  weak_password: "Пароль от 6 символов",
  email_taken: "Такой e-mail уже зарегистрирован",
  invalid_credentials: "Неверный e-mail или пароль",
};

/** Login gate for the cabinet: phone (SMS), e-mail + password, or OAuth. */
export function ProfileLogin() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [tab, setTab] = React.useState<"phone" | "email">("phone");

  function done() {
    refresh();
    router.refresh();
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 md:p-10">
        <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          <User className="size-8" />
        </span>
        <h1 className="text-2xl font-bold">Вход в личный кабинет</h1>

        <div className="grid w-full grid-cols-2 gap-1 rounded-full bg-surface p-1">
          {(
            [
              ["phone", "По телефону"],
              ["email", "По почте"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full py-2 text-sm font-semibold transition-colors",
                tab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "phone" ? <PhoneForm onDone={done} /> : <EmailForm onDone={done} />}

        <OAuthButtons onSuccess={done} />
      </div>
    </div>
  );
}

function PhoneForm({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return setError(true);
    setSmsOpen(true);
  }

  return (
    <>
      <p className="text-center text-sm text-muted-foreground">
        Введите номер телефона — пришлём код для входа. Регистрация произойдёт автоматически.
      </p>
      <form onSubmit={submit} className="flex w-full flex-col gap-3 text-left">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-phone">Телефон</Label>
          <Input
            id="login-phone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(false); }}
            aria-invalid={error}
          />
          {error && <p className="text-sm text-destructive">Введите корректный номер</p>}
        </div>
        <Button type="submit" size="lg" className="w-full">Получить код</Button>
      </form>

      <SmsAuthModal
        open={smsOpen}
        phone={phone}
        onClose={() => setSmsOpen(false)}
        onVerified={() => { setSmsOpen(false); onDone(); }}
      />
    </>
  );
}

function EmailForm({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        onDone();
        return;
      }
      setError(EMAIL_ERRORS[data.error] ?? "Не удалось войти. Попробуйте ещё раз.");
    } catch {
      setError("Не удалось войти. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3 text-left">
      {mode === "register" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-name">Имя</Label>
          <Input id="reg-name" placeholder="Наталья" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-email">E-mail</Label>
        <Input id="auth-email" type="email" inputMode="email" placeholder="you@mail.ru" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-password">Пароль</Label>
        <Input id="auth-password" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Секунду…" : mode === "register" ? "Зарегистрироваться" : "Войти"}
      </Button>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        className="text-sm text-primary hover:underline"
      >
        {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
      </button>
    </form>
  );
}
