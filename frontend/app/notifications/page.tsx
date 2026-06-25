"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Mail, MessageSquareText, TriangleAlert } from "lucide-react";
import { Card } from "@/components/common/Card";
import { DataTable } from "@/components/tables/DataTable";
import { CardGridSkeleton, LoadingButton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api-client";
import { confirmAction } from "@/lib/swal";

export default function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const [history, status] = await Promise.all([
        api.get("/notifications/history"),
        api.get("/notifications/status")
      ]);
      setRows(history.data);
      setProvider(status.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  async function send(type: "email" | "sms", e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!(await confirmAction("Are you sure you want to process this action?"))) return;
    setSending(type);
    setMessage("");
    setError("");
    const f = Object.fromEntries(new FormData(form));
    try {
      const response = await api.post(type === "email" ? "/notifications/send-email" : "/notifications/send-sms", f);
      form.reset();
      await load();
      setMessage(response.data.status === "mock_sent"
        ? `${type === "email" ? "Email" : "SMS"} simulated. Add ${type === "email" ? "Brevo" : "Twilio"} credentials to enable live delivery.`
        : `${type === "email" ? "Email sent successfully through Brevo." : "SMS submitted successfully through Twilio."}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || `${type === "email" ? "Email" : "SMS"} delivery failed.`);
    } finally {
      setSending("");
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Alerts" subtitle="Send email through Brevo and SMS through Twilio" />
      {loading ? <CardGridSkeleton cards={2} /> : <div className="grid gap-4 md:grid-cols-2">
        {[
          { key: "email", label: "Transactional Email", provider: "Brevo", icon: Mail },
          { key: "sms", label: "Transactional SMS", provider: "Twilio", icon: MessageSquareText }
        ].map((item) => {
          const Icon = item.icon;
          const ready = provider?.[item.key]?.ready;
          return (
            <div key={item.key} className="app-card flex items-center gap-4 rounded-xl border border-line bg-white p-4">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${ready ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}><Icon className="h-5 w-5" /></span>
              <div className="flex-1">
                <div className="text-sm font-extrabold text-ink">{item.label} <span className="font-semibold text-muted">via {item.provider}</span></div>
                <div className="mt-1 text-xs text-muted">{ready ? `${item.provider} live delivery is enabled.` : `Mock mode: ${item.provider} credentials or sender setup required.`}</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{ready ? "Live" : "Mock"}</span>
            </div>
          );
        })}
      </div>}
      {message && <div className="theme-alert success"><CheckCircle2 className="h-5 w-5" /><span>{message}</span></div>}
      {error && <div className="theme-alert danger"><TriangleAlert className="h-5 w-5" /><span>{error}</span></div>}
      <Card title="Send Email Alert"><form onSubmit={(e) => send("email", e)} className="space-y-4"><div className="theme-form-grid"><div className="theme-field"><label>Recipient email</label><input name="to_email" type="email" placeholder="recipient@example.com" className="form-control" required /></div><div className="theme-field"><label>Subject</label><input name="subject" placeholder="Inventory alert" className="form-control" required /></div><div className="theme-field md:col-span-2 xl:col-span-1"><label>Message</label><textarea name="message" placeholder="Write the transactional email message..." className="form-control min-h-20" required /></div></div><div className="border-t border-line pt-4"><LoadingButton loading={sending === "email"} type="submit">Send through Brevo</LoadingButton></div></form></Card>
      <Card title="Send SMS Alert"><form onSubmit={(e) => send("sms", e)} className="space-y-4"><div className="theme-alert warning"><TriangleAlert className="h-5 w-5" /><span>Twilio trial accounts can send only to verified recipient numbers. Use E.164 format, for example +919876543210.</span></div><div className="theme-form-grid"><div className="theme-field"><label>Phone number</label><input name="to_number" type="tel" pattern="^\+[1-9]\d{7,14}$" placeholder="+919876543210" className="form-control" required /></div><div className="theme-field md:col-span-2"><label>High priority message</label><textarea name="message" placeholder="Write the transactional SMS message..." className="form-control min-h-20" required /></div></div><div className="border-t border-line pt-4"><LoadingButton loading={sending === "sms"} type="submit" className="app-danger">Send through Twilio</LoadingButton></div></form></Card>
      <Card title="Alert History"><DataTable loading={loading} rows={rows} columns={[{ key: "type", label: "Type" }, { key: "channel", label: "Channel" }, { key: "message", label: "Message" }, { key: "status", label: "Status" }, { key: "created_at", label: "Created" }]} /></Card>
    </div>
  );
}
