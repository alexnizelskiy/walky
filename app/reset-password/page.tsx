"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password.length < 6) return setErr("Пароль от 6 символов");
    if (password !== password2) return setErr("Пароли не совпадают");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(true);
        setTimeout(() => router.push("/cabinet"), 1800);
        return;
      }
      setErr(data.error === "weak_password" ? "Пароль от 6 символов" : "Ссылка недействительна или устарела. Запросите сброс заново.");
    } catch {
      setErr("Не удалось. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center md:p-10">
        <span className="grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          {done ? <Check className="size-8" /> : <KeyRound className="size-8" />}
        </span>
        {done ? (
          <>
            <h1 className="text-2xl font-bold">Пароль обновлён</h1>
            <p className="text-muted-foreground">Входим в кабинет…</p>
          </>
        ) : !token ? (
          <>
            <h1 className="text-2xl font-bold">Ссылка недействительна</h1>
            <p className="text-muted-foreground">Нет токена сброса. Запросите сброс пароля заново на странице входа.</p>
            <Link href="/cabinet" className="text-sm font-semibold text-primary hover:underline">На страницу входа →</Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Новый пароль</h1>
            <form onSubmit={submit} className="flex w-full flex-col gap-3 text-left">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pw1">Новый пароль</Label>
                <Input id="pw1" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pw2">Повторите пароль</Label>
                <Input id="pw2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Сохраняем…" : "Сохранить пароль"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
