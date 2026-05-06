"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, Bell, Bot, Boxes, ChartNoAxesCombined, Home, KeyRound, Loader2, LogOut, Package, ShoppingCart, Star, Truck, UserRound, X } from "lucide-react";

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
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed bottom-0 left-0 top-0 z-40 flex w-[260px] flex-col overflow-hidden border-r border-line bg-white px-0 transition-transform lg:top-20 lg:z-20 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-line px-5 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-white shadow-lift">
          <ChartNoAxesCombined className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[0.95rem] font-extrabold leading-tight text-ink">AI E-Commerce</div>
          <div className="text-[11px] font-semibold leading-tight text-slate-500">Sales Intelligence</div>
        </div>
      </Link>
      <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onClose} title="Close menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="app-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const active = (pendingHref || pathname) === item.href;
          const pending = pendingHref === item.href && pathname !== item.href;
          const showGroup = index === 0 || items[index - 1].group !== item.group;
          return (
            <div key={item.href}>
            {showGroup && (
              <div className={`px-3 pb-2 pt-4 text-[0.78rem] font-bold uppercase tracking-normal text-[#212121] ${index === 0 ? "pt-0" : ""}`}>
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
              className={`mb-1 flex items-center gap-3 rounded-md px-4 py-[11px] text-[0.86rem] font-semibold transition ${active ? "bg-primary text-white shadow-lift" : "text-[#616161] hover:bg-[#eef6ff] hover:text-primary"}`}
            >
              <span className="grid h-6 w-6 place-items-center">{pending ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Icon className="h-[18px] w-[18px]" />}</span>
              <span className="truncate">{item.label}</span>
            </Link>
            </div>
          );
        })}
      </nav>
      <button
        className="mx-4 mb-4 flex items-center gap-3 border-t border-line px-4 pt-5 text-[0.86rem] font-semibold text-[#616161] hover:text-primary"
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
