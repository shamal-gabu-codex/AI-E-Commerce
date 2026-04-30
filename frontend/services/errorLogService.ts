import { api } from "./api";

export const errorLogService = {
  list: (params?: { status_code?: string; path?: string }) => api.get("/error-logs", { params })
};
