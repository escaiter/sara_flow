import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  sessionId: string;
}

export function ChatMessages({ sessionId }: ChatMessagesProps) {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/chat', sessionId, 'messages'],
    enabled: !!sessionId,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'help':
        sendQuickMessage('¡Hola! Puedo ayudarte con información sobre productos, servicios o cualquier consulta que tengas. ¿En qué puedo asistirte?');
        break;
      case 'examples':
        sendQuickMessage('Aquí tienes algunos ejemplos de lo que puedes preguntarme:\n• "¿Qué productos tienen disponibles?"\n• "Necesito ayuda con mi pedido"\n• "¿Cuáles son sus horarios de atención?"\n• "¿Cómo puedo contactar con soporte?"');
        break;
      case 'clear':
        handleClearChat();
        break;
    }
  };

  const sendQuickMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sessionId,
      content: message,
      sender: 'bot',
      timestamp: new Date(),
      isRead: false,
    };

    queryClient.setQueryData(['/api/chat', sessionId, 'messages'], (old: Message[] = []) => [
      ...old,
      newMessage,
    ]);
  };

  const handleClearChat = () => {
    queryClient.setQueryData(['/api/chat', sessionId, 'messages'], []);
    toast({
      description: "Chat limpiado correctamente",
      variant: "success",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card h-96 flex items-center justify-center border-x border-border">
        <div className="text-muted-foreground">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="bg-card h-96 overflow-y-auto p-4 space-y-4 scroll-smooth border-x border-border" data-testid="chat-messages">
      {/* Welcome message */}
      {(messages as Message[]).length === 0 && (
        <div className="flex justify-start">
          <div className="flex items-start space-x-2 max-w-xs">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-robot text-primary-foreground text-sm"></i>
            </div>
            <div className="bg-muted rounded-xl rounded-tl-md p-3 shadow-sm">
              <p className="text-sm text-card-foreground">¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
              <div className="text-xs text-muted-foreground mt-1">
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

      {/* Quick actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction('help')}
            className="px-3 py-1.5 text-xs"
            data-testid="button-help"
          >
            Ayuda
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction('examples')}
            className="px-3 py-1.5 text-xs"
            data-testid="button-examples"
          >
            Ejemplos
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleQuickAction('clear')}
            className="px-3 py-1.5 text-xs"
            data-testid="button-clear"
          >
            Limpiar chat
          </Button>
        </div>
        <div className="text-xs text-muted-foreground flex items-center">
          <i className="fas fa-shield-alt mr-1"></i>
          Seguro y privado
        </div>
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
}
