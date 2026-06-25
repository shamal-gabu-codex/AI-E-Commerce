"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { GridSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { api } from "@/lib/api-client";

export default function RestockingPage() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api.get("/ai/restocking").then((r) => setRows(r.data)); }, []);
  return (
    <div className="space-y-5">
      <PageHeader title="Smart Restocking" subtitle="AI reorder recommendations using demand, lead time and stock coverage" />
      <Card title="Recommended Orders">
        {!rows ? <GridSkeleton columns={8} /> : (
          <DataTable rows={rows} columns={[
            { key: "product", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "current_inventory", label: "Stock" },
            { key: "average_daily_sales", label: "Avg Daily Sales" },
            { key: "forecasted_demand", label: "30-Day Forecast" },
            { key: "supplier", label: "Supplier" },
            { key: "suggested_reorder_quantity", label: "Suggested Qty" },
            { key: "urgency_level", label: "Urgency", render: (row) => <span className={`rounded-full px-2 py-1 text-xs font-bold ${row.urgency_level === "High" ? "bg-red-50 text-red-600" : row.urgency_level === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{row.urgency_level}</span> },
          ]} />
        )}
      </Card>
    </div>
  );
}
