"use client";

import { AlertTriangle, BarChart3, Bot, Pencil, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/common/Card";
import { ConfirmModal } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/tables/DataTable";
import { ChartSkeleton, LoadingButton, PanelSkeleton } from "@/components/common/Loader";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { inventoryService } from "@/features/inventory/inventory.service";

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: 0, stock: "", reorder_level: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
    save();
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await inventoryService.update(form.id, { stock: Number(form.stock), reorder_level: Number(form.reorder_level) });
      setMessage("Inventory updated successfully.");
      setForm({ id: 0, stock: "", reorder_level: "" });
      await load();
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Inventory update failed.");
    } finally {
      setSaving(false);
    }
  }

  function editInventory(row: any) {
    setForm({ id: row.id, stock: String(row.stock), reorder_level: String(row.reorder_level) });
    setMessage("");
    setError("");
    setModalOpen(true);
  }
  const filteredRows = rows.filter((row) => {
    const term = search.trim().toLowerCase();
    return !term || [row.id, row.product_id, row.product_name, row.sku].some((value) => String(value || "").toLowerCase().includes(term));
  });
  const stockChartRows = rows.slice(0, 8);
  const maxStock = Math.max(...stockChartRows.map((row) => Number(row.stock) || 0), 1);

  return (
    <div className="space-y-5">
      <PageHeader title="Inventory Management" subtitle="Track and optimize stock levels" />
      {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
      {suggestions.length > 0 && (
        <div className="theme-alert danger">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <div className="font-extrabold">Low Stock Alert</div>
            <p className="text-xs">{suggestions.length} item(s) need supplier attention.</p>
          </div>
        </div>
      )}
      <Card title="Current Stock Levels">
        {loading ? <ChartSkeleton bars={8} /> : <div className="flex h-56 items-end gap-5 px-4">
          {stockChartRows.map((row) => (
            <div key={row.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">{row.stock}</span>
              <div className="w-full rounded-t-md bg-indigo-500" style={{ height: `${Math.max((Number(row.stock) / maxStock) * 85, 6)}%` }} />
              <span className="max-w-full truncate text-[10px] text-muted" title={row.product_name || row.sku}>{row.sku || `#${row.product_id}`}</span>
            </div>
          ))}
          {!stockChartRows.length && <div className="m-auto text-sm text-muted">No inventory data available.</div>}
        </div>}
      </Card>
      <Card title="AI Restock Recommendations" className="bg-fuchsia-50/60">
        {loading ? <PanelSkeleton lines={4} /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {suggestions.map((s, i) => <div key={i} className="flex gap-3 rounded-md bg-white p-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-violet-100 text-primary"><Bot className="h-4 w-4" /></span><div><div className="font-bold text-ink">{s.product}</div><div className="text-xs text-muted">{s.action}</div><div className="mt-2 text-xs font-bold text-primary">Stock {s.stock}, days left {s.days_left ?? "n/a"}, lead time {s.lead_time_days}</div></div></div>)}
          </div>
        )}
      </Card>
          <Card
            title="Inventory"
            actions={
            <div className="app-search min-w-[280px] sm:min-w-[420px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search inventory by product name or SKU..." />
            </div>
            }
          >
            <DataTable loading={loading} rows={filteredRows} columns={[
              { key: "id", label: "ID" },
              { key: "product_name", label: "Product", render: (row) => <div><div className="font-bold text-ink">{row.product_name || `Product #${row.product_id}`}</div><div className="text-xs text-muted">{row.sku || `ID ${row.product_id}`}</div></div> },
              { key: "stock", label: "Stock", render: (row) => <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />{row.stock} units</span> },
              { key: "reorder_level", label: "Reorder Level" },
              { key: "last_updated", label: "Last Updated" },
              { key: "actions", label: "Actions", render: (row) => <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white" onClick={() => editInventory(row)}>Restock</button> }
            ]} />
          </Card>
      <Modal
        open={modalOpen}
        title="Update Stock"
        loading={saving}
        onClose={() => { if (!saving) setModalOpen(false); }}
        footer={
          <>
            <button type="button" className="app-secondary border-0" disabled={saving} onClick={() => setModalOpen(false)}>Cancel</button>
            <LoadingButton loading={saving} type="submit" form="inventory-form">Update</LoadingButton>
          </>
        }
      >
        <form id="inventory-form" onSubmit={submit} className="space-y-4">
          <div className="theme-form-grid">
            <div className="theme-field"><label>Inventory ID</label><input value={form.id || ""} className="form-control" placeholder="Inventory ID" readOnly /></div>
            <div className="theme-field"><label>Stock</label><input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="form-control" placeholder="Stock" required /></div>
            <div className="theme-field"><label>Reorder level</label><input value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="form-control" placeholder="Reorder level" required /></div>
          </div>
          {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
