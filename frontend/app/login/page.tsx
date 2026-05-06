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
    <div className="flex min-h-screen bg-white">
      <div className="grid min-h-screen flex-1 place-items-center bg-[#f8f9fa] px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-[480px] rounded-lg border border-line bg-white p-7 shadow-card">
        <div className="mb-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-white shadow-lift">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="mb-1 text-xl font-bold text-ink">AI E-Commerce</h1>
              <p className="m-0 text-sm text-muted">Sales Intelligence</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ink">{mode === "login" ? "Login" : "Create account"}</h2>
          <p className="mt-1 text-sm text-muted">Enter your credentials to continue.</p>
        </div>
        <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
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
        <button disabled={loading} className="app-action w-full py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="mt-5 text-center text-xs text-slate-500">Demo credentials: any seeded email & password</p>
      </form>
      </div>
      <aside className="relative hidden w-[500px] items-center overflow-hidden bg-[#eef6ff] p-10 lg:flex">
        <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(33,150,243,.16), transparent 28%), radial-gradient(circle at 80% 70%, rgba(103,58,183,.18), transparent 30%)" }} />
        <div className="relative z-[1]">
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-4 h-3 w-28 rounded bg-primary/20" />
            <div className="mb-3 h-8 w-48 rounded bg-primary/15" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-24 rounded-lg bg-[#e3f2fd]" />
              <div className="h-24 rounded-lg bg-[#ede7f6]" />
              <div className="h-24 rounded-lg bg-[#e8f6f5]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-ink">Modern commerce analytics</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">Track revenue, inventory, suppliers, reviews, alerts, and AI recommendations from one clean admin workspace.</p>
        </div>
      </aside>
    </div>
  );
}
