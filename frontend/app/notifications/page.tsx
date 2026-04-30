"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { api } from "@/services/api";

export default function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState("");
  const load = () => { setLoading(true); return api.get("/notifications/history").then((r) => setRows(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  async function send(type: "email" | "sms", e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to process this action?")) return;
    setSending(type);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api.post(type === "email" ? "/notifications/send-email" : "/notifications/send-sms", f);
      e.currentTarget.reset();
      await load();
    } finally {
      setSending("");
    }
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Send Email Alert"><form onSubmit={(e) => send("email", e)} className="space-y-3"><input name="to_email" placeholder="recipient email" className="form-control" required /><input name="subject" placeholder="subject" className="form-control" required /><textarea name="message" placeholder="message" className="form-control min-h-20" required /><LoadingButton loading={sending === "email"} type="submit">Send</LoadingButton></form></Card>
        <Card title="Send SMS Alert"><form onSubmit={(e) => send("sms", e)} className="space-y-3"><input name="to_number" placeholder="phone number" className="form-control" required /><textarea name="message" placeholder="high priority message" className="form-control min-h-20" required /><LoadingButton loading={sending === "sms"} type="submit" className="btn btn-danger">Send</LoadingButton></form></Card>
      </div>
      <Card title="Alert History"><DataTable loading={loading} rows={rows} columns={[{ key: "type", label: "Type" }, { key: "channel", label: "Channel" }, { key: "message", label: "Message" }, { key: "status", label: "Status" }, { key: "created_at", label: "Created" }]} /></Card>
    </div>
  );
}
