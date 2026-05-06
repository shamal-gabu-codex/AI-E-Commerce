"use client";

import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { brandService } from "@/services/brandService";

type BrandRow = {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
};

const emptyForm = { id: 0, name: "", description: "", status: "active" as "active" | "inactive" };

function getErrorMessage(error: any, fallback: string) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) return String(item.msg);
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail === "object" && "msg" in detail) return String(detail.msg);
  return fallback;
}

export default function BrandsPage() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [viewBrand, setViewBrand] = useState<BrandRow | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: number } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await brandService.list({ search, status });
      setRows(r.data);
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Unable to load brands"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setConfirm({ type: "save" });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description, status: form.status };
      if (form.id) await brandService.update(form.id, payload);
      else await brandService.create(payload);
      setForm(emptyForm);
      setConfirm(null);
      await load();
      setMessage(form.id ? "Brand updated" : "Brand saved");
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Brand could not be saved"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setSaving(true);
    setMessage("");
    try {
      await brandService.remove(id);
      setConfirm(null);
      await load();
      setMessage("Brand deleted");
    } catch (error: any) {
      setMessage(getErrorMessage(error, "Brand could not be deleted"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Brands" subtitle="Organize product brands and catalog ownership" />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card title={form.id ? "Edit Brand" : "Add Brand"}>
          <form onSubmit={submit} className="space-y-3">
            <div className="theme-field"><label>Brand name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand name" className="form-control" required /></div>
            <div className="theme-field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="form-control min-h-24" /></div>
            <div className="theme-field"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value.toLowerCase() as "active" | "inactive" })} className="form-select" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select></div>
            {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
            <div className="flex gap-2">
              <LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>
              {form.id > 0 && <button type="button" onClick={() => setForm(emptyForm)} className="app-secondary">Cancel</button>}
            </div>
          </form>
        </Card>
      </div>
      <Card
        title="Brands"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-64 flex-1 sm:min-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand or description" className="form-control w-full py-2 pl-9 pr-3" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select w-auto min-w-36">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <LoadingButton loading={loading} onClick={load}>Apply</LoadingButton>
          </div>
        }
      >
        <DataTable
          loading={loading}
          rows={rows}
          columns={[
            { key: "name", label: "Brand Name" },
            { key: "description", label: "Description" },
            { key: "status", label: "Status", render: (row) => <span className={`rounded-md px-2 py-1 text-xs font-semibold ${row.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{row.status}</span> },
            { key: "created_at", label: "Created Date", render: (row) => new Date(row.created_at).toLocaleDateString() },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button title="View" onClick={() => setViewBrand(row)} className="theme-icon-btn"><Eye className="h-4 w-4" /></button>
                  <button title="Edit" onClick={() => setForm({ id: row.id, name: row.name, description: row.description || "", status: row.status })} className="theme-icon-btn text-blue-600"><Pencil className="h-4 w-4" /></button>
                  <button title="Delete" onClick={() => setConfirm({ type: "delete", id: row.id })} className="theme-icon-btn text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              )
            }
          ]}
        />
      </Card>
      {viewBrand && (
        <Card title="Brand Detail">
          <div className="grid gap-3 text-sm md:grid-cols-4">
            <div><div className="text-slate-500">Brand Name</div><div className="font-semibold">{viewBrand.name}</div></div>
            <div><div className="text-slate-500">Status</div><div className="font-semibold capitalize">{viewBrand.status}</div></div>
            <div><div className="text-slate-500">Created Date</div><div className="font-semibold">{new Date(viewBrand.created_at).toLocaleDateString()}</div></div>
            <div className="md:col-span-4"><div className="text-slate-500">Description</div><div>{viewBrand.description || "No description"}</div></div>
          </div>
        </Card>
      )}
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
