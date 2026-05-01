import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export function GridSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="app-scrollbar overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-3 py-3">
                <span className="block h-3 w-20 animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-slate-100">
              {Array.from({ length: columns }).map((__, col) => (
                <td key={col} className="px-3 py-4">
                  <span className={`block h-4 animate-pulse rounded bg-slate-200 ${col === 0 ? "w-28" : col % 2 ? "w-16" : "w-24"}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="rounded-lg border border-line bg-white p-5 shadow-card">
          <div className="mb-4 h-11 w-11 animate-pulse rounded-lg bg-slate-200" />
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-7 w-20 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="rounded-md border border-line bg-white p-3">
          <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function LoadingButton({
  loading,
  children,
  className = "rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-lift transition hover:bg-violet disabled:opacity-60",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 ${className}`} disabled={loading || props.disabled}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      <span>{loading ? "Processing..." : children}</span>
    </button>
  );
}
