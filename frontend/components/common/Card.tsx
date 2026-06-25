import { ReactNode } from "react";

export function Card({ title, actions, children, className = "" }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`app-card overflow-hidden rounded-xl border border-line bg-panel shadow-card ${className}`}>
      {(title || actions) && (
        <div className="app-card-header flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          {title ? <h2 className="m-0 text-[0.92rem] font-bold text-ink">{title}</h2> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="p-4 sm:p-5">
      {children}
      </div>
    </section>
  );
}
