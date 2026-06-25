"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { Card } from "@/components/common/Card";
import { PanelSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api-client";

export default function AdvisorPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api.get("/ai/advisor").then((r) => setRows(r.data)); }, []);
  return (
    <div className="space-y-5">
      <PageHeader title="AI Business Advisor" subtitle="Proactive daily recommendations from sales, inventory, reviews and suppliers" />
      <Card title="Advisor Recommendations">
        {!rows ? <PanelSkeleton lines={5} /> : <div className="grid gap-3 md:grid-cols-2">{rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-line bg-white p-4">
            <div className="mb-2 flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /><b>{row.priority} Priority</b></div>
            <div className="font-bold text-ink">{row.title}</div>
            <p className="mt-1 text-sm text-muted">{row.message}</p>
          </div>
        ))}</div>}
      </Card>
    </div>
  );
}
