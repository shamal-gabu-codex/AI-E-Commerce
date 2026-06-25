"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { authService } from "@/features/auth/auth.service";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setRedirecting(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setRedirecting(true);
      router.replace("/login");
      return;
    }
    setRedirecting(false);
    authService.me()
      .catch(() => {
        localStorage.removeItem("token");
        setRedirecting(true);
        router.replace("/login");
      });
  }, [pathname, router]);

  if (pathname === "/login") return <main>{children}</main>;
  if (redirecting) {
    return <main className="grid min-h-screen place-items-center bg-mist"><Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Checking session" /></main>;
  }
  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header onMenu={() => setMenuOpen(true)} />
      <div className="app-main min-h-screen pt-[70px] lg:pl-[264px]">
        <main className="theme-workspace w-full px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
