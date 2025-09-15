import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface ChatInputProps {
  sessionId: string;
}

export function ChatInput({ sessionId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message: messageText,
      });
      return response.json();
    },
    onMutate: async (messageText) => {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        sessionId,
        content: messageText,
        sender: 'user',
        timestamp: new Date(),
        isRead: false,
      };

      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], (old: Message[] = []) => [
        ...old,
        userMessage,
      ]);

      setIsTyping(true);
      return { userMessage };
    },
    onSuccess: (data) => {
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId,
        content: data.reply,
        sender: 'bot',
        timestamp: new Date(),
        isRead: false,
      };

      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], (old: Message[] = []) => [
        ...old,
        botMessage,
      ]);

      toast({
        description: "Mensaje enviado correctamente",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId,
        content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
        isRead: false,
      };

      queryClient.setQueryData(['/api/chat', sessionId, 'messages'], (old: Message[] = []) => [
        ...old,
        errorMessage,
      ]);

      toast({
        description: "Error al conectar con el servidor",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(trimmedMessage);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachFile = () => {
    toast({
      description: "Función de adjuntar archivos próximamente",
      variant: "default",
    });
  };

  return (
    <div className="bg-card rounded-b-xl shadow-lg border-x border-b border-border p-4" data-testid="chat-input">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none pr-12"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAttachFile}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-muted transition-colors"
            data-testid="button-attach"
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground p-3 rounded-xl hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
