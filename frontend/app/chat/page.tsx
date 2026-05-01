import { Card } from "@/components/Card";
import { ChatBox } from "@/components/ChatBox";

export default function ChatPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">AI Chat Assistant</h1>
        <p className="text-sm text-muted">Ask questions about your business data</p>
      </div>
      <Card><ChatBox /></Card>
    </div>
  );
}
