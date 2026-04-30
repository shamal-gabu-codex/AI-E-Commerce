"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const res = mode === "login"
        ? await authService.login(String(form.get("email")), String(form.get("password")))
        : await authService.register(String(form.get("name")), String(form.get("email")), String(form.get("password")));
      localStorage.setItem("token", res.data.access_token);
      router.push("/dashboard");
    } catch {
      setError("Authentication failed. Try admin@example.com / password123 after seeding.");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_420px]">
      <section className="flex min-h-[520px] flex-col justify-center rounded-lg bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center p-10 text-white">
        <h1 className="max-w-xl text-5xl font-bold leading-tight">AI E-Commerce Sales & Inventory Intelligence</h1>
        <p className="mt-4 max-w-lg text-lg text-white/90">Actionable sales drops, restock timing, supplier alerts, review issues, and Gemini-powered business answers.</p>
      </section>
      <form onSubmit={submit} className="self-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex rounded-md bg-mist p-1">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>Login</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === "register" ? "bg-white shadow-sm" : "text-slate-500"}`}>Register</button>
        </div>
        {mode === "register" && <input name="name" placeholder="Name" className="mb-3 w-full rounded-md border border-slate-200 px-4 py-3" required />}
        <input name="email" type="email" placeholder="Email" className="mb-3 w-full rounded-md border border-slate-200 px-4 py-3" required />
        <input name="password" type="password" placeholder="Password" className="mb-4 w-full rounded-md border border-slate-200 px-4 py-3" required />
        {error && <p className="mb-3 text-sm text-coral">{error}</p>}
        <button className="w-full rounded-md bg-teal px-4 py-3 font-semibold text-white">{mode === "login" ? "Login" : "Create account"}</button>
      </form>
    </div>
  );
}
