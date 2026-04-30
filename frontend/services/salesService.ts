import { api } from "./api";

export const salesService = {
  list: () => api.get("/sales"),
  create: (payload: unknown) => api.post("/sales", payload),
  upload: (form: FormData) => api.post("/sales/upload-csv", form)
};
