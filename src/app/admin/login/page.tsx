"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/admin");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSignupDone(true);
    }
  }

  if (signupDone) {
    return (
      <div className="p-6 pt-16 text-center">
        <div className="text-5xl mb-4">📩</div>
        <h1 className="text-2xl font-bold mb-3">{t.admin.checkEmail}</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          {t.admin.checkEmailBody} (<b>{email}</b>)
        </p>
        <button
          className="mt-8 text-teal-700 font-semibold text-lg min-h-11 px-2"
          onClick={() => {
            setSignupDone(false);
            setMode("login");
          }}
        >
          {t.admin.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pt-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Logo size={64} />
        </div>
        <h1 className="text-3xl font-bold text-teal-800">{t.admin.title}</h1>
        <p className="text-slate-500 text-lg mt-1">{t.admin.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="admin-email" className="text-base font-semibold text-slate-600">
            {t.admin.email}
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full min-h-14 rounded-2xl border-2 border-slate-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="text-base font-semibold text-slate-600">
            {t.admin.password}
          </label>
          <input
            id="admin-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full min-h-14 rounded-2xl border-2 border-slate-200 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && <p className="text-red-600 text-base">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t.admin.pleaseWait : mode === "login" ? t.admin.login : t.admin.signup}
        </button>
      </form>

      <p className="text-center text-base text-slate-500 mt-6">
        {mode === "login" ? t.admin.newAdmin : t.admin.alreadyHave}{" "}
        <button
          className="text-teal-700 font-bold min-h-11 px-1"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? t.admin.signup : t.admin.login}
        </button>
      </p>
    </div>
  );
}
