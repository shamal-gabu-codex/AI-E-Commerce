"use client";

import { Building2, Clock, Mail, Pencil, Phone, Search, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton, PanelSkeleton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { supplierService } from "@/services/supplierService";

const emptyForm = { id: 0, name: "", contact_person: "", email: "", phone: "", lead_time_days: "", address: "", status: "active" };

export default function SuppliersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: number } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await supplierService.list();
    setRows(res.data);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => { setError("Unable to load suppliers."); setLoading(false); }); }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setConfirm({ type: "save" });
  }

  async function save() {
    setSaving(true);
    const payload = { ...form, lead_time_days: Number(form.lead_time_days) };
    try {
      if (form.id) await supplierService.update(form.id, payload);
      else await supplierService.create(payload);
      setForm(emptyForm);
      setConfirm(null);
      setMessage(form.id ? "Supplier updated successfully." : "Supplier saved successfully.");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Supplier action failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setSaving(true);
    try {
      await supplierService.remove(id);
      setConfirm(null);
      setMessage("Supplier deleted successfully.");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Supplier delete failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Suppliers" subtitle="Manage your supplier relationships" />
      <Card title={form.id ? "Edit Supplier" : "Add New Supplier"}>
          <form onSubmit={submit} className="space-y-4">
            <div className="theme-form-grid">
            {["name","contact_person","email","phone","lead_time_days","address"].map((n) => <div className="theme-field" key={n}><label>{n.replace("_"," ")}</label><input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required={n === "name" || n === "lead_time_days"} /></div>)}
            <div className="theme-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
            </div>
            {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
            {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
            <div className="flex gap-2 border-t border-line pt-4"><LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>{form.id > 0 && <button type="button" className="app-secondary" onClick={() => setForm(emptyForm)}>Cancel</button>}</div>
          </form>
      </Card>
      <Card
        title="Suppliers"
        actions={
        <div className="app-search min-w-[280px] sm:min-w-[360px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search suppliers..." readOnly />
        </div>
        }
      >
        {loading ? (
          <PanelSkeleton lines={6} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <div key={row.id} className="theme-list-card">
                <div className="mb-4 flex items-start justify-between">
                  <span className="theme-avatar bg-fuchsia-100 text-primary"><Building2 className="h-5 w-5" /></span>
                  <div className="flex gap-2">
                    <button className="theme-icon-btn text-blue-600" onClick={() => setForm({ ...row, lead_time_days: String(row.lead_time_days) })}><Pencil className="h-4 w-4" /></button>
                    <button className="theme-icon-btn text-red-500" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <h3 className="font-extrabold text-ink">{row.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted"><Phone className="h-3.5 w-3.5" />{row.phone || "No phone"}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted"><Mail className="h-3.5 w-3.5" />{row.email || "No email"}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{row.lead_time_days || 0} days</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber text-amber" />4.5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
