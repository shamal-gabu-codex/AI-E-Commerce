"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm lg:hidden" onClick={onMenu} title="Open menu"><Menu className="h-4 w-4" /></button>
          <div>
          <h1 className="text-lg font-semibold text-ink">AI E-Commerce Sales & Inventory Intelligence</h1>
          <p className="text-sm text-slate-500">Operational insights, forecasts, alerts, and Gemini-powered recommendations.</p>
          </div>
        </div>
        <button
          title="Logout"
          className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-mist"
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
