"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { GridSkeleton, PanelSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { api } from "@/lib/api-client";

export default function BusinessHealthPage() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get("/ai/business-health"), api.get("/ai/business-health/history")]).then(([score, hist]) => {
      setData(score.data);
      setHistory(hist.data);
    }).finally(() => setLoading(false));
  }, []);
  if (loading || !data) return (
    <div className="space-y-5">
      <PageHeader title="Business Health" subtitle="AI health score across core business signals" />
      <Card title="Overall Score"><GridSkeleton columns={4} rows={4} /></Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Reasons"><PanelSkeleton lines={3} /></Card>
        <Card title="Recommended Actions"><PanelSkeleton lines={3} /></Card>
      </div>
      <Card title="Score History"><GridSkeleton columns={3} rows={5} /></Card>
    </div>
  );
  const Icon = data.risk_level === "Low" ? CheckCircle2 : AlertTriangle;
  return (
    <div className="space-y-5">
      <PageHeader title="Business Health" subtitle="AI health score across sales, inventory, suppliers, sentiment and demand" />
      <Card title="Overall Score">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="grid place-items-center rounded-xl bg-blue-50 p-6 text-center">
            <Icon className="mb-3 h-8 w-8 text-primary" />
            <div className="text-5xl font-extrabold text-ink">{data.overall_score}</div>
            <div className="mt-2 text-sm font-bold text-muted">Risk: {data.risk_level}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(data.breakdown).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-line p-3">
                <div className="mb-2 flex justify-between text-sm font-bold capitalize"><span>{key.replaceAll("_", " ")}</span><span>{String(value)}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Reasons"><ul className="space-y-2 text-sm">{data.reasons.map((x: string) => <li key={x} className="flex gap-2"><Activity className="mt-0.5 h-4 w-4 text-primary" />{x}</li>)}</ul></Card>
        <Card title="Recommended Actions"><ul className="space-y-2 text-sm">{data.recommended_actions.map((x: string) => <li key={x} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />{x}</li>)}</ul></Card>
      </div>
      <Card title="Score History"><DataTable loading={loading} rows={history} columns={[{ key: "created_at", label: "Date" }, { key: "overall_score", label: "Score" }, { key: "risk_level", label: "Risk" }]} /></Card>
    </div>
  );
}
