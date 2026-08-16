"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl shadow-black/30 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-2xl">
            💴
          </div>
          <h1 className="text-lg font-semibold text-foreground">給与シフト管理</h1>
          <p className="mt-1 text-sm text-muted">
            メールアドレスにログインリンクを送ります
          </p>
        </div>

        {status === "sent" ? (
          <div className="rounded-xl border border-line bg-surface-raised p-4 text-sm text-foreground">
            <p className="font-medium text-accent">送信しました</p>
            <p className="mt-1 text-muted">
              {email} 宛にログイン用のリンクを送信しました。メールを確認してリンクを開いてください。
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-accent underline underline-offset-2"
            >
              別のアドレスで送り直す
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-foreground placeholder:text-muted/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-danger">{errorMsg || "送信に失敗しました。もう一度お試しください。"}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "送信中…" : "ログインリンクを送る"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
