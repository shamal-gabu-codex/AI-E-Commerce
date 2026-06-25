"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, CircleArrowRight, Package, ShoppingCart, Users } from "lucide-react";
import { Card } from "@/components/common/Card";
import { SalesTrendChart, TopProductsChart } from "@/components/dashboard/SalesChart";
import { DataTable } from "@/components/tables/DataTable";
import { CardGridSkeleton, GridSkeleton, PanelSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api-client";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    setData(null);
    Promise.all([api.get("/dashboard"), api.get("/ai/business-health")])
      .then(([dashboard, healthScore]) => {
        setData(dashboard.data);
        setHealth(healthScore.data);
      })
      .catch(() => setError("Unable to load dashboard data. Check the backend connection and try again."));
  };
  useEffect(() => { load(); }, []);
  if (!data && !error) {
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
  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Dashboard" subtitle="AI-powered insights and analytics" />
        <div className="theme-alert danger">
          <AlertTriangle className="h-5 w-5" />
          <div className="flex-1"><div className="font-bold">Dashboard unavailable</div><p className="mt-1 text-sm">{error}</p></div>
          <button className="app-secondary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }
  const s = data.summary;
  const stats = [
    { label: "Total Revenue", value: `$${s.total_revenue.toLocaleString()}`, icon: ShoppingCart, color: "bg-emerald-100 text-emerald-600", note: "Recorded sales" },
    { label: "Products", value: s.product_count, icon: Package, color: "bg-blue-100 text-blue-600", note: "Catalog total" },
    { label: "Units Sold", value: s.total_quantity, icon: Users, color: "bg-violet-100 text-violet-600", note: "Recorded units" },
    { label: "Low Stock Items", value: s.low_stock_count, icon: AlertTriangle, color: "bg-red-100 text-red-600", note: "Needs attention" }
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" subtitle="AI-powered insights and analytics" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color = index === 0 ? "secondary" : index === 1 ? "primary" : "";
          return (
            <div key={stat.label} className={`theme-metric-card ${color}`}>
              <span className="round small" />
              <span className="round big" />
              <div className="relative z-[1] flex items-start justify-between">
                <div className={`theme-avatar ${color ? "bg-white/15 text-white" : stat.color}`}><Icon className="h-5 w-5" /></div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${color ? "text-white/80" : "text-emerald-500"}`}><CircleArrowRight className="h-3.5 w-3.5" />{stat.note}</span>
              </div>
              <div className={`relative z-[1] mt-4 text-xs font-bold ${color ? "text-white/70" : "text-muted"}`}>{stat.label}</div>
              <div className={`relative z-[1] mt-1 text-2xl font-bold ${color ? "text-white" : "text-ink"}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>
      {health && (
        <Card title="AI Business Health Score" className="border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white">
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-ink">{health.overall_score}</div>
              <div className="mt-1 text-xs font-bold uppercase text-muted">{health.risk_level} Risk</div>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              {Object.entries(health.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-white p-3 text-xs shadow-sm">
                  <div className="mb-1 font-bold capitalize text-muted">{key.replaceAll("_", " ")}</div>
                  <div className="text-lg font-extrabold text-ink">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      <Card className="border-blue-100 bg-gradient-to-br from-[#f5faff] to-white" title="AI Recommendations">
        <div className="grid gap-3 lg:grid-cols-2">
          {data.action_cards.map((a: any) => (
            <div key={a.id} className="flex gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 text-primary"><Bot className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-bold text-ink">{a.priority} Recommendation</div>
                <p className="mt-1 text-xs leading-5 text-muted">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="theme-dashboard-grid">
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
