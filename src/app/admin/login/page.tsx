"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
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
        <div className="text-4xl mb-3">📩</div>
        <h1 className="text-xl font-semibold mb-2">Check your email</h1>
        <p className="text-slate-500 text-sm">
          We sent a confirmation link to <b>{email}</b>. Confirm it, then come
          back and log in.
        </p>
        <button
          className="mt-6 text-teal-700 font-medium"
          onClick={() => {
            setSignupDone(false);
            setMode("login");
          }}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pt-16">
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🕌</div>
        <h1 className="text-2xl font-bold text-teal-800">Masjid Admin</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your masjid&apos;s prayer timings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        {mode === "login" ? "New masjid admin?" : "Already have an account?"}{" "}
        <button
          className="text-teal-700 font-medium"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
