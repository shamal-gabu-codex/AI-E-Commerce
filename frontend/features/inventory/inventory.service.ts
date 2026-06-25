import { api } from "@/lib/api-client";

export const inventoryService = {
  list: () => api.get("/inventory"),
  lowStock: () => api.get("/inventory/low-stock"),
  update: (id: number, payload: unknown) => api.put(`/inventory/${id}`, payload),
  suggestions: () => api.get("/inventory/supplier-restock-suggestions")
};
