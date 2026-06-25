import { api } from "@/lib/api-client";

export const reviewService = {
  list: () => api.get("/reviews"),
  create: (payload: unknown) => api.post("/reviews", payload),
  upload: (form: FormData) => api.post("/reviews/upload-csv", form),
  analysis: () => api.get("/reviews/analysis")
};
