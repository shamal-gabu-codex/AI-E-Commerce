"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MessageSquarePlus, Star, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader title="Customer Reviews" subtitle="AI-powered sentiment analysis" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Add New Review"><form onSubmit={submit} className="space-y-3"><div className="theme-field"><label>Product ID</label><input name="product_id" placeholder="product id" className="form-control" required /></div><div className="theme-field"><label>Rating</label><input name="rating" placeholder="rating 1-5" className="form-control" required /></div><div className="theme-field"><label>Review text</label><textarea name="review_text" placeholder="Customer feedback..." className="form-control min-h-24" required /></div><LoadingButton loading={saving} type="submit"><span className="inline-flex items-center gap-2"><MessageSquarePlus className="h-4 w-4" />Analyze & Save</span></LoadingButton></form></Card>
        <Card title="Upload Reviews CSV"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-muted"><Upload className="h-4 w-4" />Bulk import review feedback</div><UploadCsv onUpload={async (form) => { if (!window.confirm("Are you sure you want to process this file?")) return; await reviewService.upload(form); load(); }} /></Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <Card title="Overall Sentiment"><div className="space-y-3 text-sm">{(analysis.sentiment || []).map((x: any) => <div key={x.name} className="flex justify-between"><span>{x.name}</span><b>{x.count}</b></div>)}{(analysis.issues || []).map((x: any) => <div key={x.name} className="flex justify-between text-coral"><span>{x.name}</span><b>{x.count}</b></div>)}</div></Card>
        <Card title="AI Sentiment Insights" className="bg-emerald-50/70">
          <div className="space-y-3">
            <div className="flex gap-3 rounded-md bg-white p-3"><ThumbsUp className="h-5 w-5 text-emerald-600" /><div><div className="font-bold text-ink">Strong Positive Feedback</div><p className="text-xs text-muted">High-rated products show healthy buyer satisfaction.</p></div></div>
            <div className="flex gap-3 rounded-md bg-white p-3"><ThumbsDown className="h-5 w-5 text-red-500" /><div><div className="font-bold text-ink">Quality Issue Alert</div><p className="text-xs text-muted">Watch negative sentiment and recurring issue categories.</p></div></div>
          </div>
        </Card>
      </div>
      <Card title="Recent Reviews"><DataTable loading={loading} rows={rows} columns={[{ key: "product_id", label: "Product ID" }, { key: "rating", label: "Rating", render: (row) => <span className="inline-flex items-center gap-1 font-bold text-amber"><Star className="h-4 w-4 fill-amber" />{row.rating}</span> }, { key: "sentiment", label: "Sentiment" }, { key: "issue_category", label: "Issue" }, { key: "review_text", label: "Review" }]} /></Card>
    </div>
  );
}
