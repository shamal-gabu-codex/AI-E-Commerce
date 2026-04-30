"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { errorLogService } from "@/services/errorLogService";

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
      <Card title="Error Log Filters">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label">Status Code</label>
            <input value={filters.status_code} onChange={(e) => setFilters({ ...filters, status_code: e.target.value })} className="form-control" placeholder="500, 401, 422" />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Path</label>
            <input value={filters.path} onChange={(e) => setFilters({ ...filters, path: e.target.value })} className="form-control" placeholder="/products" />
          </div>
          <div className="col-12 col-md-2">
            <LoadingButton loading={loading} onClick={load} className="btn btn-primary w-100"><Search className="h-4 w-4 me-2" />Search</LoadingButton>
          </div>
        </div>
      </Card>
      <Card title="Application Error Logs">
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
