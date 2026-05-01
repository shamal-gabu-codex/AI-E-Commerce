"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/Card";
import { SalesTrendChart, TopProductsChart } from "@/components/Chart";
import { DataTable } from "@/components/DataTable";
import { CardGridSkeleton, GridSkeleton, PanelSkeleton } from "@/components/Loading";
import { api } from "@/services/api";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get("/dashboard").then((r) => setData(r.data)).catch(() => setData(null)); }, []);
  if (!data) {
    return (
      <div className="space-y-5">
        <div>
          <div className="mb-2 h-7 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>
        <CardGridSkeleton />
        <Card className="bg-violet-50/70"><PanelSkeleton lines={3} /></Card>
        <Card><GridSkeleton columns={3} rows={5} /></Card>
      </div>
    );
  }
  const s = data.summary;
  const stats = [
    { label: "Total Sales", value: `$${s.total_revenue.toLocaleString()}`, icon: ShoppingCart, color: "bg-emerald-100 text-emerald-600", note: "+12.5%" },
    { label: "Products", value: data.top_products?.length || 0, icon: Package, color: "bg-blue-100 text-blue-600", note: "+8.2%" },
    { label: "Units Sold", value: s.total_quantity, icon: Users, color: "bg-violet-100 text-violet-600", note: "+15.3%" },
    { label: "Low Stock Items", value: s.low_stock_count, icon: AlertTriangle, color: "bg-red-100 text-red-600", note: `${s.revenue_drop_pct}% drop` }
  ];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">AI-powered insights and analytics</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-lg ${stat.color}`}><Icon className="h-5 w-5" /></div>
                <span className="text-xs font-bold text-emerald-500">{stat.note}</span>
              </div>
              <div className="mt-4 text-xs font-bold text-muted">{stat.label}</div>
              <div className="mt-1 text-2xl font-extrabold text-ink">{stat.value}</div>
            </Card>
          );
        })}
      </div>
      <Card className="bg-violet-50/70" title="AI Recommendations">
        <div className="space-y-3">
          {data.action_cards.map((a: any) => (
            <div key={a.id} className="flex gap-3 rounded-md border border-violet-100 bg-white p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-violet-100 text-primary"><Bot className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-bold text-ink">{a.priority} Recommendation</div>
                <p className="mt-1 text-xs text-muted">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card title="Sales Trend & Forecast"><SalesTrendChart data={data.sales_trend} /></Card>
        <Card title="Top Products"><TopProductsChart data={data.top_products} /></Card>
      </div>
      <div>
        <Card title="Low Stock Products">
          <DataTable rows={data.low_stock_products} columns={[{ key: "name", label: "Product" }, { key: "stock", label: "Stock" }, { key: "reorder_level", label: "Reorder" }]} />
        </Card>
      </div>
    </div>
  );
}
