"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/common/Card";
import { FormSkeleton, LoadingButton, PanelSkeleton } from "@/components/common/Loader";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api-client";

export default function SimulationPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => { api.get("/products").then((r) => setProducts(r.data)).finally(() => setProductsLoading(false)); }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const response = await api.post("/ai/simulation", body);
      setResult(response.data);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-5">
      <PageHeader title="What-If Simulation" subtitle="Predict revenue, inventory and stockout impact from business scenarios" />
      <Card title="Simulation Builder">
        {productsLoading ? <FormSkeleton fields={4} /> : <form onSubmit={submit} className="theme-form-grid">
          <div className="theme-field"><label>Scenario</label><select name="scenario_type" className="form-select"><option value="price_change">Increase price</option><option value="inventory_reduction">Reduce inventory</option><option value="supplier_delay">Supplier delay</option><option value="demand_increase">Demand increase</option></select></div>
          <div className="theme-field"><label>Product</label><select name="product_id" className="form-select">{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="theme-field"><label>Percent</label><input name="percent" className="form-control" placeholder="10" /></div>
          <div className="theme-field"><label>Delay Days</label><input name="delay_days" className="form-control" placeholder="7" /></div>
          <div className="md:col-span-2 xl:col-span-3"><LoadingButton loading={loading} type="submit">Run Simulation</LoadingButton></div>
        </form>}
      </Card>
      {loading ? <Card title="Scenario Results"><PanelSkeleton lines={4} /></Card> : result && <Card title="Scenario Results"><div className="grid gap-4 md:grid-cols-4 text-sm"><div><b>Revenue Impact</b><div>${result.revenue_impact}</div></div><div><b>Inventory Impact</b><div>{result.inventory_impact}</div></div><div><b>Profit Impact</b><div>${result.profit_impact}</div></div><div><b>Stockout Risk</b><div>{result.stockout_risk}</div></div></div><ul className="mt-4 space-y-2 text-sm">{result.recommended_actions.map((x: string) => <li key={x}>{x}</li>)}</ul></Card>}
    </div>
  );
}
