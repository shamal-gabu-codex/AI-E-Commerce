import { api } from "@/lib/api-client";

export const supplierService = {
  list: () => api.get("/suppliers"),
  create: (payload: unknown) => api.post("/suppliers", payload),
  update: (id: number, payload: unknown) => api.put(`/suppliers/${id}`, payload),
  remove: (id: number) => api.delete(`/suppliers/${id}`)
};
