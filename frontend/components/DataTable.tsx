import type { ReactNode } from "react";
import { GridSkeleton } from "./Loading";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends { id?: number | string }>({ columns, rows, loading = false }: { columns: Column<T>[]; rows: T[]; loading?: boolean }) {
  if (loading) return <GridSkeleton columns={columns.length} />;
  if (!rows?.length) return <div className="rounded-md border border-dashed border-line p-6 text-sm text-muted">No data available.</div>;
  return (
    <div className="app-scrollbar overflow-x-auto rounded-md">
      <table className="w-full min-w-[720px] text-left text-[0.84rem]">
        <thead>
          <tr className="border-b border-line bg-[#f8fafc] text-[0.72rem] font-extrabold uppercase tracking-normal text-slate-500">
            {columns.map((c) => <th key={String(c.key)} className="px-3 py-3.5">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="border-b border-slate-100 transition hover:bg-slate-50">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-3.5 text-slate-700">
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
