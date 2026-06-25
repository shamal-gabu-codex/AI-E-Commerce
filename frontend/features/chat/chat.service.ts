import { api } from "@/lib/api-client";

export const chatService = {
  ask: (question: string) => api.post("/chat", { question }),
  history: () => api.get("/chat/history")
};
