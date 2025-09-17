import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { BotService } from "@/services/botService";
import type { Message } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
  onBotResponse: (message: Message) => void;
  setIsTyping: (typing: boolean) => void;
  isTyping: boolean;
}

export function ChatInput({ onSendMessage, onBotResponse, setIsTyping, isTyping }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSendMessage = async (messageText: string) => {
    // Create and send user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    onSendMessage(userMessage);
    setIsTyping(true);

    // Simulate bot thinking with realistic delay
    const typingDuration = BotService.getTypingDuration();
    
    setTimeout(() => {
      // Generate bot response
      const botResponse = BotService.generateResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      onBotResponse(botMessage);
      setIsTyping(false);
      
      toast({
        description: "Respuesta de NEXUS procesada",
        variant: "default",
      });
    }, typingDuration);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    handleSendMessage(trimmedMessage);
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
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium input-focus hover:border-gray-300"
            disabled={isTyping}
            data-testid="input-message"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isTyping}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-5 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 font-medium button-press"
          data-testid="button-send"
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
