"use client";

import { Menu } from "lucide-react";

export function Header({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-line p-2 text-slate-600" onClick={onMenu} title="Open menu"><Menu className="h-4 w-4" /></button>
          <div>
          <h1 className="text-sm font-extrabold text-ink">AI E-Commerce</h1>
          <p className="text-xs text-slate-500">Sales & Inventory Intelligence</p>
          </div>
        </div>
      </div>
    </header>
  );
}
