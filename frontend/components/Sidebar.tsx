"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BadgeCheck, Bell, Bot, Boxes, ChartNoAxesCombined, Home, KeyRound, Package, ShoppingCart, Star, Truck, UserRound, X } from "lucide-react";

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
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:block"}`}>
      <div className="mb-8 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
        <ChartNoAxesCombined className="h-8 w-8 text-teal" />
        <div>
          <div className="text-sm font-bold text-ink">AI E-Commerce</div>
          <div className="text-xs text-slate-500">Sales & Inventory</div>
        </div>
      </Link>
      <button className="btn btn-sm btn-outline-secondary lg:hidden" onClick={onClose} title="Close menu"><X className="h-4 w-4" /></button>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-teal text-white" : "text-slate-600 hover:bg-mist"}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
}
