"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
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
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <Card title={form.id ? "Edit Supplier" : "Add Supplier"}>
          <form onSubmit={submit} className="row g-3">
            {["name","contact_person","email","phone","lead_time_days","address"].map((n) => <div className="col-12" key={n}><input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required={n === "name" || n === "lead_time_days"} /></div>)}
            <div className="col-12">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select"><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
            {message && <div className="col-12"><div className="alert alert-success py-2">{message}</div></div>}
            {error && <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>}
            <div className="col-12 d-flex gap-2"><LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>{form.id > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(emptyForm)}>Cancel</button>}</div>
          </form>
        </Card>
      </div>
      <div className="col-12 col-xl-8">
        <Card title="Suppliers">
          <DataTable loading={loading} rows={rows} columns={[{ key: "name", label: "Name" }, { key: "contact_person", label: "Contact" }, { key: "email", label: "Email" }, { key: "lead_time_days", label: "Lead Time" }, { key: "status", label: "Status" }, { key: "actions", label: "Actions", render: (row) => <div className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" onClick={() => setForm({ ...row, lead_time_days: String(row.lead_time_days) })}><Pencil className="h-4 w-4" /></button><button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button></div> }]} />
        </Card>
      </div>
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
