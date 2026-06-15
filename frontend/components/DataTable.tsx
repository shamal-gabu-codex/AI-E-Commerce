import type { ReactNode } from "react";
import { GridSkeleton } from "./Loading";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends { id?: number | string }>({ columns, rows, loading = false }: { columns: Column<T>[]; rows: T[]; loading?: boolean }) {
  if (loading) return <GridSkeleton columns={columns.length} />;
  if (!rows?.length) return <div className="rounded-lg border border-dashed border-line bg-slate-50/70 p-10 text-center text-sm text-muted">No data available.</div>;
  return (
    <div className="app-scrollbar overflow-x-auto rounded-lg border border-slate-100">
      <table className="w-full min-w-[720px] text-left text-[0.84rem]">
        <thead>
          <tr className="border-b border-line bg-slate-50 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-slate-500">
            {columns.map((c) => <th key={String(c.key)} className="whitespace-nowrap px-4 py-3.5">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="border-b border-slate-100 bg-white transition last:border-0 hover:bg-blue-50/40">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-4 py-3.5 text-slate-700">
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
