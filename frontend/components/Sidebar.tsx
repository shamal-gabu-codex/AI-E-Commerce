"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Bell, Bot, Boxes, ChartNoAxesCombined, ChevronRight, Home, KeyRound, Loader2, LogOut, Package, ShoppingCart, Sparkles, Star, Truck, UserRound, X } from "lucide-react";

const items = [
  { group: "Dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  { group: "Catalog", href: "/brands", label: "Brands", icon: BadgeCheck },
  { group: "Catalog", href: "/products", label: "Products", icon: Package },
  { group: "Operations", href: "/suppliers", label: "Suppliers", icon: Truck },
  { group: "Operations", href: "/inventory", label: "Inventory", icon: Boxes },
  { group: "Operations", href: "/sales", label: "Sales", icon: ShoppingCart },
  { group: "Intelligence", href: "/reviews", label: "Reviews", icon: Star },
  { group: "Intelligence", href: "/chat", label: "AI Chat", icon: Bot },
  { group: "System", href: "/notifications", label: "Alerts", icon: Bell },
  { group: "System", href: "/error-logs", label: "Error Logs", icon: AlertTriangle },
  { group: "Account", href: "/profile", label: "Profile", icon: UserRound },
  { group: "Account", href: "/change-password", label: "Password", icon: KeyRound }
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState("");

  useEffect(() => {
    setPendingHref("");
  }, [pathname]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`app-sidebar fixed bottom-0 left-0 top-0 z-50 flex w-[264px] flex-col overflow-hidden transition-transform lg:z-40 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="app-sidebar-brand flex h-[70px] items-center justify-between px-5">
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
          <ChartNoAxesCombined className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[0.95rem] font-extrabold leading-tight text-white">AI E-Commerce</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">Sales Intelligence</div>
        </div>
      </Link>
      <button className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} title="Close menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = (pendingHref || pathname) === item.href;
          const pending = pendingHref === item.href && pathname !== item.href;
          const showGroup = index === 0 || items[index - 1].group !== item.group;
          return (
            <div key={item.href}>
            {showGroup && (
              <div className={`px-4 pb-2 pt-5 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-slate-400 ${index === 0 ? "pt-1" : ""}`}>
                {item.group}
              </div>
            )}
            <Link
              href={item.href}
              prefetch
              onClick={() => {
                setPendingHref(item.href);
                onClose?.();
              }}
              className={`app-nav-link mb-1 flex items-center gap-3 rounded-lg px-4 py-[10px] text-[0.84rem] font-semibold transition ${active ? "active text-white" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}
            >
              <span className="grid h-6 w-6 place-items-center">{pending ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Icon className="h-[18px] w-[18px]" />}</span>
              <span className="truncate">{item.label}</span>
              <ChevronRight className={`ml-auto h-3.5 w-3.5 transition ${active ? "opacity-100" : "opacity-0"}`} />
            </Link>
            </div>
          );
        })}
      </nav>
      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="h-4 w-4 text-sky-300" />
          AI insights are ready
        </div>
      <button
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.82rem] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
      </div>
    </aside>
    </>
  );
}
