// Simple frontend-only types for chat functionality
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}

// Bot response patterns for intelligent responses
export interface BotResponse {
  patterns: string[];
  responses: string[];
}