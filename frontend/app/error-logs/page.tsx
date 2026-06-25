"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/tables/DataTable";
import { LoadingButton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { errorLogService } from "@/features/error-logs/error-log.service";

export default function ErrorLogsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status_code: "", path: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await errorLogService.list(filters);
      setRows(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Error Logs" subtitle="Search and inspect application API errors" />
      <Card
        title="Application Error Logs"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input value={filters.status_code} onChange={(e) => setFilters({ ...filters, status_code: e.target.value })} className="form-control w-auto min-w-36" placeholder="Status code" />
            <input value={filters.path} onChange={(e) => setFilters({ ...filters, path: e.target.value })} className="form-control w-auto min-w-52" placeholder="Path" />
            <LoadingButton loading={loading} onClick={load}><Search className="h-4 w-4 me-2" />Search</LoadingButton>
          </div>
        }
      >
        <DataTable
          loading={loading}
          rows={rows}
          columns={[
            { key: "created_at", label: "Time", render: (row) => new Date(row.created_at).toLocaleString() },
            { key: "level", label: "Level" },
            { key: "status_code", label: "Status" },
            { key: "method", label: "Method" },
            { key: "path", label: "Path" },
            { key: "message", label: "Message", render: (row) => <span title={row.stack_trace || row.message}>{String(row.message).slice(0, 140)}</span> },
            { key: "request_id", label: "Request ID" }
          ]}
        />
      </Card>
    </div>
  );
}
