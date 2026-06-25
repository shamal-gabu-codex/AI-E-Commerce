import { api } from "@/lib/api-client";

export const errorLogService = {
  list: (params?: { status_code?: string; path?: string }) => api.get("/error-logs", { params })
};
