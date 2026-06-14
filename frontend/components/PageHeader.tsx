import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home, Sparkles } from "lucide-react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="theme-page-header flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="page-title-icon hidden h-10 w-10 place-items-center rounded-xl sm:grid"><Sparkles className="h-[18px] w-[18px]" /></span>
        <div>
        <h1 className="app-page-title">{title}</h1>
        {subtitle ? <p className="app-page-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <nav className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex" aria-label="Breadcrumb">
          <Link href="/dashboard" className="text-primary hover:text-primary"><Home className="h-3.5 w-3.5" /></Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/dashboard" className="text-slate-500 no-underline hover:text-primary">AI E-Commerce</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{title}</span>
        </nav>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
