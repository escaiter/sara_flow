import { useState } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

interface ChatContainerProps {
  sessionId: string;
  onClearChat: () => void;
}

export function ChatContainer({ sessionId, onClearChat }: ChatContainerProps) {
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto ai-glow-intense" data-testid="chat-container">
      <ChatHeader onClearChat={onClearChat} />
      <ChatMessages sessionId={sessionId} isTyping={isTyping} />
      <ChatInput sessionId={sessionId} setIsTyping={setIsTyping} />
    </div>
  );
}
