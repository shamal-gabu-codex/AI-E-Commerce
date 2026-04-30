"use client";

import { Pencil, Trash2 } from "lucide-react";
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
    <div className="row g-4">
      <div className="col-12 col-xl-4">
        <Card title={form.id ? "Edit Product" : "Add Product"}>
          <form onSubmit={submit} className="row g-3">
            {["name","sku","category","price","current_stock","reorder_level"].map((n) => (
              <div className="col-12" key={n}>
                <input value={(form as any)[n]} onChange={(e) => setForm({ ...form, [n]: e.target.value })} placeholder={n.replace("_"," ")} className="form-control" required />
              </div>
            ))}
            <div className="col-12">
              <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="form-select">
                <option value="">Select brand</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div className="col-12">
              <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="form-select">
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            {message && <div className="col-12"><div className="alert alert-success py-2">{message}</div></div>}
            {error && <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>}
            <div className="col-12 d-flex gap-2">
              <LoadingButton loading={saving} type="submit">{form.id ? "Update" : "Save"}</LoadingButton>
              {form.id > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(emptyForm)}>Cancel</button>}
            </div>
          </form>
        </Card>
      </div>
      <div className="col-12 col-xl-8">
        <Card title="Products">
          <DataTable
            loading={loading}
            rows={rows}
            columns={[
              { key: "name", label: "Name" },
              { key: "sku", label: "SKU" },
              { key: "category", label: "Category" },
              { key: "brand_id", label: "Brand" },
              { key: "current_stock", label: "Stock" },
              { key: "actions", label: "Actions", render: (row) => <div className="d-flex gap-2"><button title="Edit" className="btn btn-sm btn-outline-secondary" onClick={() => setForm({ ...row, price: String(row.price), current_stock: String(row.current_stock), reorder_level: String(row.reorder_level), brand_id: String(row.brand_id || ""), supplier_id: String(row.supplier_id || "") })}><Pencil className="h-4 w-4" /></button><button title="Delete" className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ type: "delete", id: row.id })}><Trash2 className="h-4 w-4" /></button></div> }
            ]}
          />
        </Card>
      </div>
      <ConfirmModal open={!!confirm} message={confirm?.type === "delete" ? "Are you sure you want to delete this record?" : form.id ? "Are you sure you want to update this record?" : "Are you sure you want to save this record?"} confirmText={confirm?.type === "delete" ? "Delete" : form.id ? "Update" : "Save"} loading={saving} onConfirm={() => confirm?.type === "delete" && confirm.id ? remove(confirm.id) : save()} onCancel={() => setConfirm(null)} />
    </div>
  );
}
