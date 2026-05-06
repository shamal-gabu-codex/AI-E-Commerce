"use client";

import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { chatService } from "@/services/chatService";

const suggestions = [
  "Why did my sales drop this week?",
  "Which products need urgent restocking?",
  "Which supplier should I contact?",
  "Which products have negative reviews?",
  "What is my expected demand for next 30 days?"
];

export function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(text = question) {
    if (!text.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text }]);
    try {
      const { data } = await chatService.ask(text);
      const answer = data.response;
      setMessages((m) => [...m, { role: "ai", text: `${answer.summary}\n${(answer.recommended_actions || []).join("\n")}` }]);
      setQuestion("");
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "I could not reach the backend. Please check your API server and login token." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="min-h-[420px] rounded-lg border border-line bg-white">
        <div className="app-scrollbar min-h-[330px] space-y-3 p-4">
        {messages.length === 0 && (
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-fuchsia-100 text-primary"><Bot className="h-5 w-5" /></span>
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">Hello! I am your AI E-Commerce Intelligence Assistant. Ask about sales trends, inventory, demand, and customer reviews.</div>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-fuchsia-100 text-primary"><Bot className="h-5 w-5" /></span>}
              <div className={`max-w-[80%] whitespace-pre-line rounded-lg px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}>{m.text}</div>
              {m.role === "user" && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-white"><UserRound className="h-5 w-5" /></span>}
            </div>
          ))}
        </div>
        </div>
        <div className="border-t border-line p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} disabled={loading} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-60" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-primary" />
              <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded-md border border-line px-4 py-3 pr-10 text-sm" placeholder="Ask me anything about your business..." />
            </div>
            <button disabled={loading} title="Send" onClick={() => ask()} className="app-action">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-violet-100 bg-violet-50 p-4">
        <div className="flex items-center gap-2 font-extrabold text-ink"><Sparkles className="h-4 w-4 text-primary" />Powered by Gemini AI</div>
        <p className="mt-1 text-xs text-muted">Using business data retrieval to provide real-time ecommerce insights with natural language understanding.</p>
      </div>
    </div>
  );
}
