"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { DollarSign, Plus, TrendingUp, Upload } from "lucide-react";
import { Card } from "@/components/Card";
import { SalesTrendChart } from "@/components/Chart";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { UploadCsv } from "@/components/UploadCsv";
import { salesService } from "@/services/salesService";

export default function SalesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = () => { setLoading(true); return salesService.list().then((r) => setRows(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save this record?")) return;
    setSaving(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await salesService.create({ product_id: Number(f.product_id), sale_date: f.sale_date, quantity: Number(f.quantity), revenue: Number(f.revenue) });
      e.currentTarget.reset();
      await load();
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Sales Data" subtitle="Track and manage sales records" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><DollarSign className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Total Revenue</p><p className="text-2xl font-extrabold text-ink">${rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0).toLocaleString()}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-100 text-blue-600"><TrendingUp className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Units Sold</p><p className="text-2xl font-extrabold text-ink">{rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg bg-violet-100 text-primary"><Plus className="h-5 w-5" /></span><div><p className="text-xs font-bold text-muted">Transactions</p><p className="text-2xl font-extrabold text-ink">{rows.length}</p></div></div></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Add Sale"><form onSubmit={submit} className="grid gap-3 md:grid-cols-2">{["product_id","sale_date","quantity","revenue"].map((n) => <div className="theme-field" key={n}><label>{n.replace("_"," ")}</label><input name={n} type={n === "sale_date" ? "date" : "text"} placeholder={n.replace("_"," ")} className="form-control" required /></div>)}<div className="md:col-span-2"><LoadingButton loading={saving} type="submit">Save Sale</LoadingButton></div></form></Card>
        <Card title="Upload Sales CSV"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-muted"><Upload className="h-4 w-4" />Bulk import historical sales</div><UploadCsv onUpload={async (form) => { if (!window.confirm("Are you sure you want to process this file?")) return; await salesService.upload(form); load(); }} /></Card>
      </div>
      <Card title="Daily Sales Trend"><SalesTrendChart data={rows.map((row) => ({ date: row.sale_date, revenue: row.revenue }))} /></Card>
      <Card title="Recent Sales"><DataTable loading={loading} rows={rows} columns={[{ key: "sale_date", label: "Date" }, { key: "product_id", label: "Product ID" }, { key: "quantity", label: "Quantity" }, { key: "revenue", label: "Revenue", render: (row) => <span className="font-bold text-emerald-600">${Number(row.revenue || 0).toLocaleString()}</span> }]} /></Card>
    </div>
  );
}
