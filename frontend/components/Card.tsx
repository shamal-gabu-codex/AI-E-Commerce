import { ReactNode } from "react";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-panel p-5 shadow-card ${className}`}>
      {title && <h2 className="mb-4 text-base font-bold text-ink">{title}</h2>}
      {children}
    </section>
  );
}
