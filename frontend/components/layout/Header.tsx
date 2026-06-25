"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, ExternalLink, LogOut, Mail, Menu, Phone, Search, UserRound } from "lucide-react";

export function Header({ onMenu }: { onMenu?: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  function signOut() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <header className="app-header fixed right-0 top-0 z-30 h-[70px] bg-white px-4 lg:left-[264px] lg:px-7">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex h-full items-center gap-4">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-slate-600 shadow-sm lg:hidden" onClick={onMenu} title="Open menu"><Menu className="h-4 w-4" /></button>
          <div className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="header-search h-10 w-64 rounded-lg border-0 bg-slate-50 pl-10 pr-4 text-sm" placeholder="Search workspace..." readOnly />
          </div>
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
            <p className="text-[10px] text-slate-500">Sales & Inventory Intelligence</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <Link href="/notifications" className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary" title="Notifications">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
          </Link>
          <div className="mx-1 hidden h-8 w-px bg-line sm:block" />
          <button className="flex items-center gap-2 rounded-lg p-1.5 pr-2 text-left hover:bg-slate-50" title="Profile" onClick={() => setProfileOpen((value) => !value)}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet text-white shadow-sm"><UserRound className="h-4 w-4" /></span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-ink">Administrator</span>
              <span className="block text-[10px] text-slate-500">Business account</span>
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-60 rounded-xl border border-line bg-white p-2 shadow-xl">
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
