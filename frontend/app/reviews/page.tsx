"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MessageSquarePlus, Star, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/tables/DataTable";
import { LoadingButton, PanelSkeleton } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { UploadCsv } from "@/components/upload/CsvUpload";
import { reviewService } from "@/features/reviews/review.service";
import { confirmAction } from "@/lib/swal";

export default function ReviewsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    return Promise.all([reviewService.list(), reviewService.analysis()])
      .then(([reviewRes, analysisRes]) => {
        setRows(reviewRes.data);
        setAnalysis(analysisRes.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const duplicate = rows.find((row) =>
      Number(row.product_id) === Number(f.product_id) &&
      Number(row.rating) === Number(f.rating) &&
      String(row.review_text || "").trim().toLowerCase() === String(f.review_text || "").trim().toLowerCase()
    );
    if (duplicate) {
      setError("This review entry already exists.");
      return;
    }
    setSaving(true);
    try {
      await reviewService.create({ product_id: Number(f.product_id), rating: Number(f.rating), review_text: f.review_text });
      e.currentTarget.reset();
      await load();
      setModalOpen(false);
      setMessage("Review saved successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Review could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Customer Reviews" subtitle="AI-powered sentiment analysis" />
      {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
        <Card title="Upload Reviews CSV"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-muted"><Upload className="h-4 w-4" />Bulk import review feedback</div><UploadCsv onUpload={async (form) => { if (!(await confirmAction("Are you sure you want to process this file?"))) return false; await reviewService.upload(form); load(); }} /></Card>
      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <Card title="Overall Sentiment">{loading ? <PanelSkeleton lines={4} /> : <div className="space-y-3 text-sm">{(analysis.sentiment || []).map((x: any) => <div key={x.name} className="flex justify-between"><span>{x.name}</span><b>{x.count}</b></div>)}{(analysis.issues || []).map((x: any) => <div key={x.name} className="flex justify-between text-coral"><span>{x.name}</span><b>{x.count}</b></div>)}</div>}</Card>
        <Card title="AI Sentiment Insights" className="bg-emerald-50/70">
          {loading ? <PanelSkeleton lines={2} /> : <div className="space-y-3">
            <div className="flex gap-3 rounded-md bg-white p-3"><ThumbsUp className="h-5 w-5 text-emerald-600" /><div><div className="font-bold text-ink">Strong Positive Feedback</div><p className="text-xs text-muted">High-rated products show healthy buyer satisfaction.</p></div></div>
            <div className="flex gap-3 rounded-md bg-white p-3"><ThumbsDown className="h-5 w-5 text-red-500" /><div><div className="font-bold text-ink">Quality Issue Alert</div><p className="text-xs text-muted">Watch negative sentiment and recurring issue categories.</p></div></div>
          </div>}
        </Card>
      </div>
      <Card
        title="Recent Reviews"
        actions={<LoadingButton loading={false} type="button" onClick={() => { setError(""); setMessage(""); setModalOpen(true); }}><MessageSquarePlus className="h-4 w-4" /> Add</LoadingButton>}
      >
        <DataTable loading={loading} rows={rows} columns={[{ key: "product_id", label: "Product ID" }, { key: "rating", label: "Rating", render: (row) => <span className="inline-flex items-center gap-1 font-bold text-amber"><Star className="h-4 w-4 fill-amber" />{row.rating}</span> }, { key: "sentiment", label: "Sentiment" }, { key: "issue_category", label: "Issue" }, { key: "review_text", label: "Review" }]} />
      </Card>
      <Modal
        open={modalOpen}
        title="Add Review"
        loading={saving}
        onClose={() => { if (!saving) setModalOpen(false); }}
        footer={
          <>
            <button type="button" className="app-secondary border-0" disabled={saving} onClick={() => setModalOpen(false)}>Cancel</button>
            <LoadingButton loading={saving} type="submit" form="review-form">Save</LoadingButton>
          </>
        }
      >
        <form id="review-form" onSubmit={submit} className="space-y-4">
          <div className="theme-form-grid">
            <div className="theme-field"><label>Product ID</label><input name="product_id" placeholder="product id" className="form-control" required /></div>
            <div className="theme-field"><label>Rating</label><input name="rating" placeholder="rating 1-5" className="form-control" required /></div>
            <div className="theme-field md:col-span-2 xl:col-span-1"><label>Review text</label><textarea name="review_text" placeholder="Customer feedback..." className="form-control min-h-24" required /></div>
          </div>
          {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
