import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
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

      // NOTE: No invalidamos queries porque usamos estado local optimista
      // La invalidación causaría pérdida de mensajes ya que el backend mock devuelve []
      
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


  return (
    <div className="bg-white border border-gray-200 rounded-b-xl shadow-lg border-x border-b p-8" data-testid="chat-input">
      <div className="flex items-center space-x-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta..."
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-200 hover:border-gray-300"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-5 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          data-testid="button-send"
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
