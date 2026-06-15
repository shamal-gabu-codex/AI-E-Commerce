"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BarChart3, Boxes, CheckCircle2, Loader2, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, User } from "lucide-react";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
  }

  function getErrorMessage(err: unknown) {
    if (!axios.isAxiosError(err)) return "Something went wrong. Please try again.";
    if (!err.response) return "Unable to reach the API server. Please check that the backend is running on port 8000.";

    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "Field";
          return item?.msg ? `${String(field)}: ${item.msg}` : "";
        })
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }

    return mode === "register"
      ? "Could not create the account. Please check the details and try again."
      : "Authentication failed. Try admin@example.com / password123 after seeding.";
  }

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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[46%] max-w-[720px] items-center overflow-hidden bg-[#35435c] p-12 lg:flex">
        <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 18% 20%, rgba(33,150,243,.35), transparent 30%), radial-gradient(circle at 85% 75%, rgba(103,58,183,.32), transparent 34%), linear-gradient(145deg, transparent, rgba(20,31,50,.3))" }} />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-white/10" />
        <div className="relative z-[1] mx-auto w-full max-w-lg text-white">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><TrendingUp className="h-6 w-6" /></span>
            <div><div className="text-lg font-extrabold">AI E-Commerce</div><div className="text-xs uppercase tracking-[0.16em] text-slate-300">Sales Intelligence</div></div>
          </div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Smarter decisions for every sale and every shelf.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Bring revenue, inventory, suppliers, customer feedback, and AI recommendations into one focused workspace.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">
            {[{ icon: BarChart3, label: "Live analytics" }, { icon: Boxes, label: "Stock control" }, { icon: Sparkles, label: "AI insights" }].map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur"><Icon className="mb-3 h-5 w-5 text-sky-300" /><div className="text-xs font-bold">{item.label}</div></div>;
            })}
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-300" />Secure business intelligence workspace</div>
        </div>
      </aside>
      <div className="relative grid min-h-screen flex-1 place-items-center overflow-hidden bg-[#f4f7fa] px-4 py-10 sm:px-8">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
      <form key={mode} onSubmit={submit} className="relative z-[1] w-full max-w-[460px] rounded-2xl border border-white bg-white p-7 shadow-[0_20px_60px_rgba(31,45,61,.12)] sm:p-9">
        <div className="mb-7">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-lift">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="mb-1 text-xl font-bold text-ink">AI E-Commerce</h1>
              <p className="m-0 text-sm text-muted">Sales Intelligence</p>
            </div>
          </div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary"><CheckCircle2 className="h-4 w-4" />Welcome</div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">{mode === "login" ? "Sign in to your workspace" : "Create your account"}</h2>
          <p className="mt-2 text-sm text-muted">{mode === "login" ? "Enter your credentials to continue to the dashboard." : "Set up your account to start exploring business insights."}</p>
        </div>
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button type="button" onClick={() => switchMode("login")} className={`flex-1 rounded-md py-2 text-sm font-bold transition ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Login</button>
          <button type="button" onClick={() => switchMode("register")} className={`flex-1 rounded-md py-2 text-sm font-bold transition ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>Register</button>
        </div>
        {mode === "register" && (
          <>
            <label className="mb-2 block text-xs font-bold text-slate-600">Full Name</label>
            <div className="relative mb-4">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input name="name" type="text" placeholder="Shreya Patel" autoComplete="name" className="w-full rounded-md border border-line py-3 pl-10 pr-4" required minLength={2} />
            </div>
          </>
        )}
        <label className="mb-2 block text-xs font-bold text-slate-600">Email Address</label>
        <div className="relative mb-4">
          <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input name="email" type="email" placeholder={mode === "register" ? "shreya@example.com" : "admin@example.com"} autoComplete="email" className="w-full rounded-md border border-line py-3 pl-10 pr-4" required />
        </div>
        <label className="mb-2 block text-xs font-bold text-slate-600">Password</label>
        <div className="relative mb-4">
          <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input name="password" type="password" placeholder="password123" autoComplete={mode === "register" ? "new-password" : "current-password"} className="w-full rounded-md border border-line py-3 pl-10 pr-4" required minLength={6} />
        </div>
        {error && <p className="mb-3 text-sm text-coral">{error}</p>}
        <button disabled={loading} className="app-action w-full py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="mt-5 text-center text-xs text-slate-400">Demo access supports any seeded email and password.</p>
      </form>
      </div>
    </div>
  );
}
