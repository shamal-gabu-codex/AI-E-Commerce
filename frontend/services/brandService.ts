import { api } from "./api";

export const brandService = {
  list: (params?: { search?: string; status?: string }) => {
    const cleanParams = {
      ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
      ...(params?.status ? { status: params.status } : {})
    };
    return api.get("/brands", { params: cleanParams });
  },
  create: (payload: unknown) => api.post("/brands", payload),
  update: (id: number, payload: unknown) => api.put(`/brands/${id}`, payload),
  remove: (id: number) => api.delete(`/brands/${id}`)
};
