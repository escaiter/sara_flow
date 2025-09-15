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
  setIsTyping: (typing: boolean) => void;
}

export function ChatInput({ sessionId, setIsTyping }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message: messageText,
      }, {
        'x-session-id': sessionId,
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

      // Invalidar cache para mantener sincronización
      queryClient.invalidateQueries({
        queryKey: ['/api/chat', sessionId, 'messages']
      });
      
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
    <div className="ai-glass ai-border rounded-b-xl shadow-lg border-x border-b border-ai-border p-6 circuit-bg" data-testid="chat-input">
      <div className="flex items-end space-x-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta..."
            className="w-full bg-ai-surface border border-ai-border rounded-xl px-5 py-4 text-sm text-foreground placeholder-ai-glow/60 focus:outline-none focus:ring-2 focus:ring-ai-glow focus:border-ai-glow resize-none pr-12 ai-glow font-medium"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAttachFile}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-ai-surface transition-colors ai-button"
            data-testid="button-attach"
          >
            <Paperclip className="h-4 w-4 text-ai-glow" />
          </Button>
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="ai-button bg-gradient-to-r from-ai-glow to-ai-secondary text-white px-6 py-4 rounded-xl hover:from-ai-glow/90 hover:to-ai-secondary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ai-glow-intense"
          data-testid="button-send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
