import { api } from "@/lib/api-client";

export const authService = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => api.post("/auth/register", { name, email, password }),
  me: () => api.get("/auth/me"),
  updateProfile: (payload: { name: string; email: string }) => api.put("/auth/me", payload),
  changePassword: (payload: { current_password: string; new_password: string; confirm_password: string }) => api.post("/auth/change-password", payload)
};
