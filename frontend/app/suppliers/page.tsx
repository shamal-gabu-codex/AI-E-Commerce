"use client";

import { Building2, Clock, Mail, Pencil, Phone, Plus, Search, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton, PanelSkeleton } from "@/components/Loading";
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Suppliers</h1>
          <p className="text-sm text-muted">Manage your supplier relationships</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-lift" onClick={() => setForm(emptyForm)}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>
      <Card title={form.id ? "Edit Supplier" : "Add New Supplier"}>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            {["name","contact_person","email","phone","lead_time_days","address"].map((n) => <div key={n}><input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required={n === "name" || n === "lead_time_days"} /></div>)}
            <div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
            {message && <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 md:col-span-2">{message}</div>}
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 md:col-span-2">{error}</div>}
            <div className="flex gap-2 md:col-span-2"><LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>{form.id > 0 && <button type="button" className="rounded-md bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setForm(emptyForm)}>Cancel</button>}</div>
          </form>
      </Card>
      <Card>
        <div className="mb-4 flex items-center rounded-md border border-line px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search suppliers..." readOnly />
        </div>
        {loading ? (
          <PanelSkeleton lines={6} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-lg border border-line bg-white p-4">
                <div className="mb-4 flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-fuchsia-100 text-primary"><Building2 className="h-5 w-5" /></span>
                  <div className="flex gap-2">
                    <button className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" onClick={() => setForm({ ...row, lead_time_days: String(row.lead_time_days) })}><Pencil className="h-4 w-4" /></button>
                    <button className="rounded-md p-1.5 text-red-500 hover:bg-red-50" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button>
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
