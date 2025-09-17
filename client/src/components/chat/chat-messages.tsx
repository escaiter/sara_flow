import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageBubble } from "./message-bubble.tsx";
import { TypingIndicator } from "./typing-indicator.tsx";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  sessionId: string;
  isTyping: boolean;
}

export function ChatMessages({ sessionId, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/chat', sessionId, 'messages'],
    enabled: false, // Disabled to prevent automatic refetch that clears optimistic messages
    initialData: [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  if (isLoading) {
    return (
      <div className="bg-card h-96 flex items-center justify-center border-x border-border">
        <div className="text-muted-foreground">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="ai-glass h-96 overflow-y-auto p-6 space-y-4 scroll-smooth border-x border-ai-border circuit-bg" data-testid="chat-messages">
      {/* Welcome message */}
      {(messages as Message[]).length === 0 && (
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
      {(messages as Message[]).map((message: Message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}


      <div ref={messagesEndRef} />
    </div>
  );
}
