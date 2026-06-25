"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LoadingButton, PanelSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api-client";

export default function ExecutiveSummaryPage() {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    api.get(`/ai/executive-summary?period=${period}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [period]);
  function exportPdf() {
    window.print();
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Executive Summary" subtitle="Daily, weekly and monthly AI business summary" />
      <Card title="Summary Controls" actions={<LoadingButton loading={false} type="button" onClick={exportPdf}><Download className="h-4 w-4" /> Export PDF</LoadingButton>}>
        <select className="form-select w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </Card>
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {["Key Wins", "Risks", "Opportunities", "Recommended Actions"].map((section) => (
            <Card key={section} title={section}>
              <PanelSkeleton lines={4} />
            </Card>
          ))}
        </div>
      ) : data && <div className="grid gap-5 lg:grid-cols-2">
        {["key_wins", "risks", "opportunities", "recommended_actions"].map((section) => (
          <Card key={section} title={section.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}>
            <ul className="space-y-2 text-sm">{data[section].map((item: string) => <li key={item}>{item}</li>)}</ul>
          </Card>
        ))}
      </div>}
    </div>
  );
}
