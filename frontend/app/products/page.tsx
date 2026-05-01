"use client";

import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { brandService } from "@/services/brandService";
import { productService } from "@/services/productService";
import { supplierService } from "@/services/supplierService";

const emptyForm = { id: 0, name: "", sku: "", category: "", price: "", current_stock: "", reorder_level: "", brand_id: "", supplier_id: "", status: "active" };

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: number } | null>(null);

  const load = async () => {
    setLoading(true);
    const [productRes, brandRes, supplierRes] = await Promise.all([
      productService.list(),
      brandService.list({ status: "active" }),
      supplierService.list()
    ]);
    setRows(productRes.data);
    setBrands(brandRes.data);
    setSuppliers(supplierRes.data);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => { setError("Unable to load products."); setLoading(false); }); }, []);

  function payload() {
    return {
      name: form.name,
      sku: form.sku,
      category: form.category,
      price: Number(form.price),
      current_stock: Number(form.current_stock),
      reorder_level: Number(form.reorder_level),
      supplier_id: Number(form.supplier_id) || null,
      brand_id: Number(form.brand_id) || null,
      status: form.status
    };
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setConfirm({ type: "save" });
  }

  async function save() {
    setSaving(true);
    try {
      if (form.id) await productService.update(form.id, payload());
      else await productService.create(payload());
      setForm(emptyForm);
      setConfirm(null);
      setMessage(form.id ? "Product updated successfully." : "Product saved successfully.");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Product action failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setSaving(true);
    try {
      await productService.remove(id);
      setConfirm(null);
      setMessage("Product deleted successfully.");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Product delete failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Products</h1>
          <p className="text-sm text-muted">Manage your product catalog</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-lift" onClick={() => setForm(emptyForm)}>
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>
      <Card title={form.id ? "Edit Product" : "Add New Product"}>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
            {["name","sku","category","price","current_stock","reorder_level"].map((n) => (
              <div key={n}>
                <input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required />
              </div>
            ))}
            <div>
              <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="form-select">
                <option value="">Select brand</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div>
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="form-select">
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            {message && <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 md:col-span-2">{message}</div>}
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700 md:col-span-2">{error}</div>}
            <div className="flex gap-2 md:col-span-2">
              <LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>
              {form.id > 0 && <button type="button" className="rounded-md bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setForm(emptyForm)}>Cancel</button>}
            </div>
          </form>
      </Card>
      <Card>
          <div className="mb-4 flex items-center rounded-md border border-line px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search products by name or SKU..." readOnly />
          </div>
          <DataTable
            loading={loading}
            rows={rows}
            columns={[
              { key: "sku", label: "SKU" },
              { key: "name", label: "Product Name", render: (row) => <span className="inline-flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-violet-100 text-primary"><Package className="h-4 w-4" /></span>{row.name}</span> },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", render: (row) => `$${Number(row.price || 0).toLocaleString()}` },
              { key: "current_stock", label: "Stock", render: (row) => <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{row.current_stock}</span> },
              { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button title="Edit" className="rounded-md p-2 text-blue-600 hover:bg-blue-50" onClick={() => setForm({ ...row, price: String(row.price), current_stock: String(row.current_stock), reorder_level: String(row.reorder_level), brand_id: String(row.brand_id || ""), supplier_id: String(row.supplier_id || "") })}><Pencil className="h-4 w-4" /></button><button title="Delete" className="rounded-md p-2 text-red-500 hover:bg-red-50" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button></div> }
            ]}
          />
      </Card>
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
