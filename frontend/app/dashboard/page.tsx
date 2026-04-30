"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { SalesTrendChart, TopProductsChart } from "@/components/Chart";
import { DataTable } from "@/components/DataTable";
import { api } from "@/services/api";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data)).catch(() => setData(null)); }, []);
  if (!data) return <Card><div className="p-10 text-center text-slate-500">Loading dashboard...</div></Card>;
  const s = data.summary;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><div className="text-sm text-slate-500">Revenue</div><div className="text-2xl font-bold">${s.total_revenue.toLocaleString()}</div></Card>
        <Card><div className="text-sm text-slate-500">Units Sold</div><div className="text-2xl font-bold">{s.total_quantity}</div></Card>
        <Card><div className="text-sm text-slate-500">Low Stock</div><div className="text-2xl font-bold text-coral">{s.low_stock_count}</div></Card>
        <Card><div className="text-sm text-slate-500">7-Day Revenue Drop</div><div className="text-2xl font-bold">{s.revenue_drop_pct}%</div></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card title="Actual Sales Trend"><SalesTrendChart data={data.sales_trend} /></Card>
        <Card title="Top Products"><TopProductsChart data={data.top_products} /></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="AI Action Cards">
          <div className="space-y-3">{data.action_cards.map((a: any) => <div key={a.id} className="rounded-md border border-slate-200 p-3"><span className="text-xs font-bold uppercase text-amber">{a.priority}</span><p className="text-sm">{a.message}</p></div>)}</div>
        </Card>
        <Card title="Low Stock Products">
          <DataTable rows={data.low_stock_products} columns={[{ key: "name", label: "Product" }, { key: "stock", label: "Stock" }, { key: "reorder_level", label: "Reorder" }]} />
        </Card>
      </div>
    </div>
  );
}
