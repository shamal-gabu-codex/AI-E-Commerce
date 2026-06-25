"use client";

import { Building2, Clock, Mail, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/common/Card";
import { ConfirmModal } from "@/components/common/ConfirmDialog";
import { LoadingButton, PanelSkeleton } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { supplierService } from "@/features/suppliers/supplier.service";

const emptyForm = { id: 0, name: "", contact_person: "", email: "", phone: "", lead_time_days: "", address: "", status: "active" };

export default function SuppliersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{ type: "delete"; id?: number } | null>(null);

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
    save();
  }

  async function save() {
    const duplicate = rows.find((row) => {
      const sameName = String(row.name || "").trim().toLowerCase() === form.name.trim().toLowerCase();
      const sameEmail = form.email.trim() && String(row.email || "").trim().toLowerCase() === form.email.trim().toLowerCase();
      return row.id !== form.id && (sameName || sameEmail);
    });
    if (duplicate) {
      setError("Supplier name or email already exists.");
      return;
    }
    setSaving(true);
    const payload = { ...form, lead_time_days: Number(form.lead_time_days) };
    try {
      if (form.id) await supplierService.update(form.id, payload);
      else await supplierService.create(payload);
      const wasEdit = !!form.id;
      setForm(emptyForm);
      await load();
      setModalOpen(false);
      setMessage(wasEdit ? "Supplier updated successfully." : "Supplier saved successfully.");
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

  function openAddModal() {
    setForm(emptyForm);
    setMessage("");
    setError("");
    setModalOpen(true);
  }

  function editSupplier(row: any) {
    setForm({ ...row, lead_time_days: String(row.lead_time_days) });
    setMessage("");
    setError("");
    setModalOpen(true);
  }
  const filteredRows = rows.filter((row) => {
    const term = search.trim().toLowerCase();
    return !term || [row.name, row.contact_person, row.email, row.phone].some((value) => String(value || "").toLowerCase().includes(term));
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Suppliers" subtitle="Manage your supplier relationships" />
      {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
      <Card
        title="Suppliers"
        actions={
        <div className="flex flex-wrap items-center gap-2">
          <LoadingButton loading={false} type="button" onClick={openAddModal}><Plus className="h-4 w-4" /> Add</LoadingButton>
          <div className="app-search min-w-[280px] sm:min-w-[360px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search suppliers..." />
          </div>
        </div>
        }
      >
        {loading ? (
          <PanelSkeleton lines={6} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((row) => (
              <div key={row.id} className="theme-list-card">
                <div className="mb-4 flex items-start justify-between">
                  <span className="theme-avatar bg-fuchsia-100 text-primary"><Building2 className="h-5 w-5" /></span>
                  <div className="flex gap-2">
                    <button className="theme-icon-btn text-blue-600" onClick={() => editSupplier(row)}><Pencil className="h-4 w-4" /></button>
                    <button className="theme-icon-btn text-red-500" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <h3 className="font-extrabold text-ink">{row.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted"><Phone className="h-3.5 w-3.5" />{row.phone || "No phone"}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted"><Mail className="h-3.5 w-3.5" />{row.email || "No email"}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{row.lead_time_days || 0} days</span>
                  <span className={`rounded-full px-2 py-1 font-bold capitalize ${row.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Modal
        open={modalOpen}
        title={form.id ? "Edit Supplier" : "Add Supplier"}
        loading={saving}
        onClose={() => { if (!saving) setModalOpen(false); }}
        footer={
          <>
            <button type="button" className="app-secondary border-0" disabled={saving} onClick={() => setModalOpen(false)}>Cancel</button>
            <LoadingButton loading={saving} type="submit" form="supplier-form">{form.id ? "Update" : "Save"}</LoadingButton>
          </>
        }
      >
        <form id="supplier-form" onSubmit={submit} className="space-y-4">
          <div className="theme-form-grid">
            {["name","contact_person","email","phone","lead_time_days","address"].map((n) => <div className="theme-field" key={n}><label>{n.replace("_"," ")}</label><input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required={n === "name" || n === "lead_time_days"} /></div>)}
            <div className="theme-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
          </div>
          {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
        </form>
      </Modal>
      <ConfirmModal open={!!confirm} message="Are you sure you want to delete this record?" confirmText="Delete" loading={saving} onConfirm={() => confirm?.id ? remove(confirm.id) : undefined} onCancel={() => setConfirm(null)} />
    </div>
  );
}
