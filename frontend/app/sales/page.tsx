"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
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
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Add Sale"><form onSubmit={submit} className="grid gap-3 md:grid-cols-4">{["product_id","sale_date","quantity","revenue"].map((n) => <input key={n} name={n} type={n === "sale_date" ? "date" : "text"} placeholder={n.replace("_"," ")} className="form-control" required />)}<LoadingButton loading={saving} type="submit">Save</LoadingButton></form></Card>
        <Card title="Upload Sales CSV"><UploadCsv onUpload={async (form) => { if (!window.confirm("Are you sure you want to process this file?")) return; await salesService.upload(form); load(); }} /></Card>
      </div>
      <Card title="Sales"><DataTable loading={loading} rows={rows} columns={[{ key: "product_id", label: "Product ID" }, { key: "sale_date", label: "Date" }, { key: "quantity", label: "Quantity" }, { key: "revenue", label: "Revenue" }]} /></Card>
    </div>
  );
}
