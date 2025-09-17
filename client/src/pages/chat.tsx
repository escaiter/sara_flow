import { useState } from "react";
import { ChatContainer } from "@/components/chat/chat-container";

export default function ChatPage() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple initialization with loading animation
  if (!isInitialized) {
    setTimeout(() => setIsInitialized(true), 500);
    return (
      <div className="min-h-screen bg-background circuit-bg flex items-center justify-center">
        <div className="ai-text text-lg animate-pulse">INICIANDO SISTEMA NEXUS...</div>
      </div>
    );
  }

  const clearChat = () => {
    // Simple page refresh for clean start in frontend-only version
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background circuit-bg flex items-center justify-center p-4">
      <ChatContainer onClearChat={clearChat} />
    </div>
  );
}
