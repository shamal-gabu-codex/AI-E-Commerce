"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname === "/login") return <main>{children}</main>;
  return (
    <>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header onMenu={() => setMenuOpen(true)} />
      <div className="min-h-screen bg-white pb-28 pt-20 lg:pl-[260px]">
        <main className="theme-workspace mx-auto w-full px-4 py-5 sm:px-6 lg:mx-5 lg:mt-5 lg:px-5 lg:py-5">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
