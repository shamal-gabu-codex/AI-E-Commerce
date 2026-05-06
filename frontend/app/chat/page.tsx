import { Card } from "@/components/Card";
import { ChatBox } from "@/components/ChatBox";
import { PageHeader } from "@/components/PageHeader";

export default function ChatPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="AI Chat Assistant" subtitle="Ask questions about your business data" />
      <Card><ChatBox /></Card>
    </div>
  );
}
