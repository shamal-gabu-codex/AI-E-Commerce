"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Lock, Mail, TrendingUp } from "lucide-react";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const res = mode === "login"
        ? await authService.login(String(form.get("email")), String(form.get("password")))
        : await authService.register(String(form.get("name")), String(form.get("email")), String(form.get("password")));
      localStorage.setItem("token", res.data.access_token);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError("Unable to reach the API server. Check NEXT_PUBLIC_API_BASE_URL and backend port.");
        return;
      }
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : "";
      setError(typeof detail === "string" ? detail : "Authentication failed. Try admin@example.com / password123 after seeding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-line bg-white p-7 shadow-lift">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lift">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink">AI E-Commerce Intelligence</h1>
          <p className="mt-1 text-sm text-muted">Sales & Inventory Analytics Platform</p>
        </div>
        <div className="mb-5 flex rounded-md bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-md py-2 text-sm font-bold transition ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Login</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-md py-2 text-sm font-bold transition ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Register</button>
        </div>
        {mode === "register" && <input name="name" placeholder="Name" className="mb-3 w-full rounded-md border border-line px-4 py-3" required />}
        <label className="mb-2 block text-xs font-bold text-slate-600">Email Address</label>
        <div className="relative mb-4">
          <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input name="email" type="email" placeholder="admin@example.com" className="w-full rounded-md border border-line py-3 pl-10 pr-4" required />
        </div>
        <label className="mb-2 block text-xs font-bold text-slate-600">Password</label>
        <div className="relative mb-4">
          <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input name="password" type="password" placeholder="password123" className="w-full rounded-md border border-line py-3 pl-10 pr-4" required />
        </div>
        {error && <p className="mb-3 text-sm text-coral">{error}</p>}
        <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary to-fuchsia-500 px-4 py-3 font-bold text-white shadow-lift transition hover:from-violet hover:to-primary disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="mt-5 text-center text-xs text-slate-500">Demo credentials: any seeded email & password</p>
      </form>
    </div>
  );
}
