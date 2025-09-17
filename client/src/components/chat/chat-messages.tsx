import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble.tsx";
import { TypingIndicator } from "./typing-indicator.tsx";
import type { Message } from "@/types/chat";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="ai-glass h-96 overflow-y-auto p-6 space-y-4 scroll-smooth border-x border-ai-border circuit-bg" data-testid="chat-messages">
      {/* Welcome message */}
      {messages.length === 0 && (
        <div className="flex justify-start">
          <div className="flex items-start space-x-3 max-w-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-ai-glow to-ai-accent rounded-full flex items-center justify-center flex-shrink-0 ai-glow">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <div className="ai-glass ai-border rounded-xl rounded-tl-md p-4 shadow-lg">
              <p className="text-sm text-foreground font-medium">¡Hola! Soy NEXUS AI, tu asistente inteligente. ¿En qué puedo ayudarte hoy?</p>
              <div className="text-xs text-ai-glow font-mono mt-2">
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message: Message, index: number) => (
        <MessageBubble key={message.id} message={message} index={index} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}


      <div ref={messagesEndRef} />
    </div>
  );
}
