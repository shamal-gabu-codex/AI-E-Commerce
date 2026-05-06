"use client";

import { AlertTriangle, BarChart3, Bot, Pencil, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader title="Inventory Management" subtitle="Track and optimize stock levels" />
      {suggestions.length > 0 && (
        <div className="theme-alert danger">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <div className="font-extrabold">Low Stock Alert</div>
            <p className="text-xs">{suggestions.length} item(s) need supplier attention.</p>
          </div>
        </div>
      )}
      <Card title="Stock Level Trend">
        <div className="flex h-56 items-end gap-5 px-4">
          {[72, 82, 66, 88, 98, 92].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-md bg-indigo-500" style={{ height: `${height}%` }} />
              <span className="text-xs text-muted">{["Jan","Feb","Mar","Apr","May","Jun"][index]}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="AI Restock Recommendations" className="bg-fuchsia-50/60">
        {loading ? <div className="placeholder-glow"><span className="placeholder col-12 mb-2" /><span className="placeholder col-8" /></div> : (
          <div className="grid gap-3 md:grid-cols-2">
            {suggestions.map((s, i) => <div key={i} className="flex gap-3 rounded-md bg-white p-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-violet-100 text-primary"><Bot className="h-4 w-4" /></span><div><div className="font-bold text-ink">{s.product}</div><div className="text-xs text-muted">{s.action}</div><div className="mt-2 text-xs font-bold text-primary">Stock {s.stock}, days left {s.days_left ?? "n/a"}, lead time {s.lead_time_days}</div></div></div>)}
          </div>
        )}
      </Card>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div>
          <Card title="Update Stock">
            <form onSubmit={submit} className="space-y-3">
              <div className="theme-field"><label>Inventory ID</label><input value={form.id || ""} className="form-control" placeholder="Inventory ID" readOnly /></div>
              <div className="theme-field"><label>Stock</label><input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="form-control" placeholder="Stock" required /></div>
              <div className="theme-field"><label>Reorder level</label><input value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="form-control" placeholder="Reorder level" required /></div>
              {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
              {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
              <LoadingButton loading={saving} type="submit">Update Inventory</LoadingButton>
            </form>
          </Card>
        </div>
        <div>
          <Card
            title="Inventory"
            actions={
            <div className="app-search min-w-[280px] sm:min-w-[420px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search inventory by product name or SKU..." readOnly />
            </div>
            }
          >
            <DataTable loading={loading} rows={rows} columns={[
              { key: "id", label: "ID" },
              { key: "product_id", label: "Product ID" },
              { key: "stock", label: "Stock", render: (row) => <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />{row.stock} units</span> },
              { key: "reorder_level", label: "Reorder Level" },
              { key: "last_updated", label: "Last Updated" },
              { key: "actions", label: "Actions", render: (row) => <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white" onClick={() => setForm({ id: row.id, stock: String(row.stock), reorder_level: String(row.reorder_level) })}>Restock</button> }
            ]} />
          </Card>
        </div>
      </div>
      <ConfirmModal open={confirm} message="Are you sure you want to update this record?" confirmText="Update" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
    </div>
  );
}
