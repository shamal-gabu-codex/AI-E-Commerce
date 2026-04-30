"use client";

import { Send } from "lucide-react";
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
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-mist" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="min-h-[420px] rounded-lg border border-slate-200 bg-white p-4">
        {messages.length === 0 && <div className="pt-32 text-center text-sm text-slate-500">Ask Gemini for a business recommendation based on your sales, inventory, supplier, and review data.</div>}
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] whitespace-pre-line rounded-lg px-4 py-3 text-sm ${m.role === "user" ? "ml-auto bg-teal text-white" : "bg-mist text-slate-700"}`}>
              {m.text}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} className="flex-1 rounded-md border border-slate-200 px-4 py-3 text-sm" placeholder="Ask a business question..." />
        <button disabled={loading} title="Send" onClick={() => ask()} className="rounded-md bg-teal px-4 text-white disabled:opacity-60">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
