import { useState } from "react";
import { ChatHeader } from "./chat-header.tsx";
import { ChatMessages } from "./chat-messages.tsx";
import { ChatInput } from "./chat-input.tsx";
import type { Message } from "@/types/chat";

interface ChatContainerProps {
  onClearChat: () => void;
}

export function ChatContainer({ onClearChat }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleBotResponse = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsTyping(false);
    onClearChat();
  };

  return (
    <div className="w-full max-w-2xl mx-auto ai-glow-intense" data-testid="chat-container">
      <ChatHeader onClearChat={handleClearChat} />
      <ChatMessages messages={messages} isTyping={isTyping} />
      <ChatInput 
        onSendMessage={handleSendMessage}
        onBotResponse={handleBotResponse}
        setIsTyping={setIsTyping}
        isTyping={isTyping}
      />
    </div>
  );
}
