import { Card } from "@/components/common/Card";
import { ChatBox } from "@/components/chat/ChatBox";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ChatPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="AI Chat Assistant" subtitle="Ask questions about your business data" />
      <Card><ChatBox /></Card>
    </div>
  );
}
