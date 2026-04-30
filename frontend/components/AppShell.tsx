"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname === "/login") return <main className="p-5">{children}</main>;
  return (
    <>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="p-3 p-md-4 p-lg-5">{children}</main>
      </div>
    </>
  );
}
