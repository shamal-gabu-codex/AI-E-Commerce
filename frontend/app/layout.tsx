import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/PageWrapper";
import "bootstrap/dist/css/bootstrap.min.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI E-Commerce Sales & Inventory Intelligence",
  description: "Gemini-powered e-commerce intelligence POC"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
