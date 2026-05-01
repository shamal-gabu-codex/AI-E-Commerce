"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Bell, Bot, Boxes, ChartNoAxesCombined, Home, KeyRound, Loader2, LogOut, Package, ShoppingCart, Star, Truck, UserRound, X } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/brands", label: "Brands", icon: BadgeCheck },
  { href: "/products", label: "Products", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/chat", label: "AI Chat", icon: Bot },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/error-logs", label: "Error Logs", icon: AlertTriangle },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/change-password", label: "Password", icon: KeyRound }
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState("");

  useEffect(() => {
    setPendingHref("");
  }, [pathname]);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-line bg-white px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:block"}`}>
      <div className="mb-7 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lift">
          <ChartNoAxesCombined className="h-5 w-5" />
        </span>
        <div>
          <div className="text-sm font-extrabold leading-tight text-ink">AI E-Commerce</div>
          <div className="text-[11px] leading-tight text-slate-500">Intelligence</div>
        </div>
      </Link>
      <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onClose} title="Close menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="app-scrollbar flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = (pendingHref || pathname) === item.href;
          const pending = pendingHref === item.href && pathname !== item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => {
                setPendingHref(item.href);
                onClose?.();
              }}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${active ? "bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow-lift" : "text-slate-600 hover:bg-violet/10 hover:text-primary"}`}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        className="mt-4 flex items-center gap-3 border-t border-line px-3 pt-5 text-sm font-bold text-slate-600 hover:text-primary"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
    </>
  );
}
