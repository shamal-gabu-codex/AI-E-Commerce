"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartNoAxesCombined, ExternalLink, LogOut, Mail, Menu, Phone, UserRound } from "lucide-react";

export function Header({ onMenu }: { onMenu?: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  function signOut() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-20 border-b border-line bg-white/95 px-4 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex h-full items-center gap-4">
          <Link href="/dashboard" className="hidden h-full w-[236px] items-center gap-3 border-r border-line pr-6 lg:flex">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-lift">
              <ChartNoAxesCombined className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[0.95rem] font-extrabold leading-tight text-ink">AI E-Commerce</span>
              <span className="block text-[11px] font-semibold leading-tight text-slate-500">Sales Intelligence</span>
            </span>
          </Link>
          <button className="rounded-md border border-line bg-white p-2 text-slate-600 shadow-card lg:hidden" onClick={onMenu} title="Open menu"><Menu className="h-4 w-4" /></button>
          <div className="hidden flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-slate-600 md:flex">
            <a href="https://xcodewebsolutions.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-slate-700 no-underline hover:text-primary">
              Xcode Web Solutions LLP
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a href="mailto:sales@xcodewebsolutions.com" className="inline-flex items-center gap-1.5 text-slate-600 no-underline hover:text-primary">
              <Mail className="h-3.5 w-3.5" />
              sales@xcodewebsolutions.com
            </a>
            <a href="tel:+919023035541" className="inline-flex items-center gap-1.5 text-slate-600 no-underline hover:text-primary">
              <Phone className="h-3.5 w-3.5" />
              +91 90230 35541
            </a>
          </div>
          <div className="md:hidden">
            <h1 className="text-sm font-extrabold text-ink">AI E-Commerce</h1>
            <p className="text-xs text-slate-500">Sales & Inventory Intelligence</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-white shadow-lift" title="Profile" onClick={() => setProfileOpen((value) => !value)}>
            <UserRound className="h-4 w-4" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-line bg-white p-2 shadow-lg">
              <div className="border-b border-line px-3 py-2">
                <div className="text-sm font-bold text-ink">AI E-Commerce</div>
                <div className="text-xs text-muted">Current session</div>
              </div>
              <button className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-[#eef6ff] hover:text-primary" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
