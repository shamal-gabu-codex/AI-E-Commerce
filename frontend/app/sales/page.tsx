"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { DollarSign, Plus, TrendingUp, Upload } from "lucide-react";
import { Card } from "@/components/common/Card";
import { SalesTrendChart } from "@/components/dashboard/SalesChart";
import { DataTable } from "@/components/tables/DataTable";
import { CardGridSkeleton, ChartSkeleton, LoadingButton } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadCsv } from "@/components/upload/CsvUpload";
import { salesService } from "@/features/sales/sales.service";
import { confirmAction } from "@/lib/swal";

export default function SalesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () => { setLoading(true); return salesService.list().then((r) => setRows(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const duplicate = rows.find((row) =>
      Number(row.product_id) === Number(f.product_id) &&
      String(row.sale_date).slice(0, 10) === String(f.sale_date) &&
      Number(row.quantity) === Number(f.quantity) &&
      Number(row.revenue) === Number(f.revenue)
    );
    if (duplicate) {
      setError("This sales entry already exists.");
      return;
    }
    setSaving(true);
    try {
      await salesService.create({ product_id: Number(f.product_id), sale_date: f.sale_date, quantity: Number(f.quantity), revenue: Number(f.revenue) });
      e.currentTarget.reset();
      await load();
      setModalOpen(false);
      setMessage("Sale saved successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Sale could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Sales Data" subtitle="Track and manage sales records" />
      {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
      {loading ? <CardGridSkeleton cards={3} /> : <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><DollarSign className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Total Revenue</p><p className="text-2xl font-extrabold text-ink">${rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0).toLocaleString()}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-100 text-blue-600"><TrendingUp className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Units Sold</p><p className="text-2xl font-extrabold text-ink">{rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-violet-100 text-primary"><Plus className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Transactions</p><p className="text-2xl font-extrabold text-ink">{rows.length}</p></div></div></Card>
      </div>}
        <Card title="Upload Sales CSV"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-muted"><Upload className="h-4 w-4" />Bulk import historical sales</div><UploadCsv onUpload={async (form) => { if (!(await confirmAction("Are you sure you want to process this file?"))) return false; await salesService.upload(form); await load(); }} /></Card>
      <Card title="Daily Sales Trend">{loading ? <ChartSkeleton bars={8} /> : <SalesTrendChart data={rows.map((row) => ({ date: row.sale_date, revenue: row.revenue }))} />}</Card>
      <Card
        title="Recent Sales"
        actions={<LoadingButton loading={false} type="button" onClick={() => { setError(""); setMessage(""); setModalOpen(true); }}><Plus className="h-4 w-4" /> Add Sale</LoadingButton>}
      >
        <DataTable loading={loading} rows={rows} columns={[{ key: "sale_date", label: "Date" }, { key: "product_id", label: "Product ID" }, { key: "quantity", label: "Quantity" }, { key: "revenue", label: "Revenue", render: (row) => <span className="font-bold text-emerald-600">${Number(row.revenue || 0).toLocaleString()}</span> }]} />
      </Card>
      <Modal
        open={modalOpen}
        title="Add Sale"
        loading={saving}
        onClose={() => { if (!saving) setModalOpen(false); }}
        footer={
          <>
            <button type="button" className="app-secondary border-0" disabled={saving} onClick={() => setModalOpen(false)}>Cancel</button>
            <LoadingButton loading={saving} type="submit" form="sale-form">Save</LoadingButton>
          </>
        }
      >
        <form id="sale-form" onSubmit={submit} className="space-y-4">
          <div className="theme-form-grid">
            {["product_id","sale_date","quantity","revenue"].map((n) => <div className="theme-field" key={n}><label>{n.replace("_"," ")}</label><input name={n} type={n === "sale_date" ? "date" : "text"} placeholder={n.replace("_"," ")} className="form-control" required /></div>)}
          </div>
          {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
