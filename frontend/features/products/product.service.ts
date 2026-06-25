import { api } from "@/lib/api-client";

export const productService = {
  list: () => api.get("/products"),
  create: (payload: unknown) => api.post("/products", payload),
  update: (id: number, payload: unknown) => api.put(`/products/${id}`, payload),
  remove: (id: number) => api.delete(`/products/${id}`)
};
