import { api } from "./api";

export const chatService = {
  ask: (question: string) => api.post("/chat", { question }),
  history: () => api.get("/chat/history")
};
