"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { inventoryService } from "@/services/inventoryService";

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [form, setForm] = useState({ id: 0, stock: "", reorder_level: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [inventoryRes, suggestionRes] = await Promise.all([inventoryService.list(), inventoryService.suggestions()]);
    setRows(inventoryRes.data);
    setSuggestions(suggestionRes.data);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => { setError("Unable to load inventory."); setLoading(false); }); }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.id) {
      setError("Select an inventory row to update.");
      return;
    }
    setConfirm(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await inventoryService.update(form.id, { stock: Number(form.stock), reorder_level: Number(form.reorder_level) });
      setMessage("Inventory updated successfully.");
      setForm({ id: 0, stock: "", reorder_level: "" });
      setConfirm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Inventory update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Supplier Restock Suggestions">
        {loading ? <div className="placeholder-glow"><span className="placeholder col-12 mb-2" /><span className="placeholder col-8" /></div> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((s, i) => <div key={i} className="card border-0 shadow-sm"><div className="card-body"><div className="fw-semibold">{s.product}</div><div className="small text-secondary">{s.action}</div><div className="mt-2 small text-danger">Stock {s.stock}, days left {s.days_left ?? "n/a"}, lead time {s.lead_time_days}</div></div></div>)}
          </div>
        )}
      </Card>
      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <Card title="Update Stock">
            <form onSubmit={submit} className="row g-3">
              <div className="col-12"><input value={form.id || ""} className="form-control" placeholder="Inventory ID" readOnly /></div>
              <div className="col-12"><input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="form-control" placeholder="Stock" required /></div>
              <div className="col-12"><input value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="form-control" placeholder="Reorder level" required /></div>
              {message && <div className="col-12"><div className="alert alert-success py-2">{message}</div></div>}
              {error && <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>}
              <div className="col-12"><LoadingButton loading={saving} type="submit">Update Inventory</LoadingButton></div>
            </form>
          </Card>
        </div>
        <div className="col-12 col-xl-8">
          <Card title="Inventory">
            <DataTable loading={loading} rows={rows} columns={[
              { key: "id", label: "ID" },
              { key: "product_id", label: "Product ID" },
              { key: "stock", label: "Stock" },
              { key: "reorder_level", label: "Reorder Level" },
              { key: "last_updated", label: "Last Updated" },
              { key: "actions", label: "Actions", render: (row) => <button className="btn btn-sm btn-outline-secondary" onClick={() => setForm({ id: row.id, stock: String(row.stock), reorder_level: String(row.reorder_level) })}><Pencil className="h-4 w-4" /></button> }
            ]} />
          </Card>
        </div>
      </div>
      <ConfirmModal open={confirm} message="Are you sure you want to update this record?" confirmText="Update" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
    </div>
  );
}
