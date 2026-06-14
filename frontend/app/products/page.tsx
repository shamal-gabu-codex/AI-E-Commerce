"use client";

import { Package, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DataTable } from "@/components/DataTable";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { brandService } from "@/services/brandService";
import { productService } from "@/services/productService";
import { supplierService } from "@/services/supplierService";

const emptyForm = { id: 0, name: "", sku: "", category: "", price: "", current_stock: "", reorder_level: "", brand_id: "", supplier_id: "", status: "active" };

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: number } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  function moveToForm() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formRef.current?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select")?.focus();
    }, 0);
  }

  function editProduct(row: any) {
    setForm({ ...row, price: String(row.price), current_stock: String(row.current_stock), reorder_level: String(row.reorder_level), brand_id: String(row.brand_id || ""), supplier_id: String(row.supplier_id || "") });
    moveToForm();
  }
  const filteredRows = rows.filter((row) => {
    const term = search.trim().toLowerCase();
    return !term || [row.name, row.sku, row.category].some((value) => String(value || "").toLowerCase().includes(term));
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Products" subtitle="Manage your product catalog" />
      <div ref={formRef}>
      <Card title={form.id ? "Edit Product" : "Add New Product"}>
          <form onSubmit={submit} className="space-y-4">
            <div className="theme-form-grid">
            {["name","sku","category","price","current_stock","reorder_level"].map((n) => (
              <div className="theme-field" key={n}>
                <label>{n.replace("_"," ")}</label>
                <input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required />
              </div>
            ))}
            <div className="theme-field">
              <label>Brand</label>
              <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="form-select">
                <option value="">Select brand</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div className="theme-field">
              <label>Supplier</label>
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="form-select">
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            </div>
            {message && <div className="theme-alert success text-sm font-bold">{message}</div>}
            {error && <div className="theme-alert danger text-sm font-bold">{error}</div>}
            <div className="flex gap-2 border-t border-line pt-4">
              <LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>
              {form.id > 0 && <button type="button" className="app-secondary" onClick={() => setForm(emptyForm)}>Cancel</button>}
            </div>
          </form>
      </Card>
      </div>
      <Card
        title="Products"
        actions={
          <div className="app-search min-w-[280px] sm:min-w-[360px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 px-3 py-2 focus:shadow-none" placeholder="Search products by name or SKU..." />
          </div>
        }
      >
          <DataTable
            loading={loading}
            rows={filteredRows}
            columns={[
              { key: "sku", label: "SKU" },
              { key: "name", label: "Product Name", render: (row) => <span className="inline-flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-md bg-violet-100 text-primary"><Package className="h-4 w-4" /></span>{row.name}</span> },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", render: (row) => `$${Number(row.price || 0).toLocaleString()}` },
              { key: "current_stock", label: "Stock", render: (row) => <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{row.current_stock}</span> },
              { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button title="Edit" className="theme-icon-btn text-blue-600" onClick={() => editProduct(row)}><Pencil className="h-4 w-4" /></button><button title="Delete" className="theme-icon-btn text-red-500" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button></div> }
            ]}
          />
      </Card>
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
