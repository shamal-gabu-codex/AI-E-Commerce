"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { UploadCsv } from "@/components/UploadCsv";
import { reviewService } from "@/services/reviewService";

export default function ReviewsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = () => {
    setLoading(true);
    reviewService.list().then((r) => setRows(r.data));
    reviewService.analysis().then((r) => setAnalysis(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save this record?")) return;
    setSaving(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await reviewService.create({ product_id: Number(f.product_id), rating: Number(f.rating), review_text: f.review_text });
      e.currentTarget.reset();
      load();
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="Add Review"><form onSubmit={submit} className="space-y-3"><input name="product_id" placeholder="product id" className="form-control" required /><input name="rating" placeholder="rating 1-5" className="form-control" required /><textarea name="review_text" placeholder="review text" className="form-control min-h-24" required /><LoadingButton loading={saving} type="submit">Save</LoadingButton></form></Card>
        <Card title="Upload Reviews CSV"><UploadCsv onUpload={async (form) => { if (!window.confirm("Are you sure you want to process this file?")) return; await reviewService.upload(form); load(); }} /></Card>
        <Card title="Review Analysis"><div className="space-y-2 text-sm">{(analysis.sentiment || []).map((x: any) => <div key={x.name} className="flex justify-between"><span>{x.name}</span><b>{x.count}</b></div>)}{(analysis.issues || []).map((x: any) => <div key={x.name} className="flex justify-between text-coral"><span>{x.name}</span><b>{x.count}</b></div>)}</div></Card>
      </div>
      <Card title="Reviews"><DataTable loading={loading} rows={rows} columns={[{ key: "product_id", label: "Product ID" }, { key: "rating", label: "Rating" }, { key: "sentiment", label: "Sentiment" }, { key: "issue_category", label: "Issue" }, { key: "review_text", label: "Review" }]} /></Card>
    </div>
  );
}
