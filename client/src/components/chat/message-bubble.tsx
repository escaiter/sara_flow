import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  index?: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const timestamp = typeof message.timestamp === 'string' 
    ? new Date(message.timestamp) 
    : message.timestamp;
  const timeStr = timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} opacity-0 animate-fade-in`} 
      data-testid={`message-${message.sender}-${message.id}`}
      style={{ animationDelay: `${(index || 0) * 50}ms`, animationFillMode: 'forwards' }}
    >
      {isUser ? (
        <div className="flex items-start space-x-3 max-w-sm">
          <div className="ai-glass ai-border rounded-xl rounded-tr-md p-4 shadow-lg ai-glow message-transition">
            <p className="text-sm text-foreground font-medium">{message.content}</p>
            <div className="text-xs text-ai-glow font-mono mt-2 opacity-80">{timeStr}</div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-ai-accent to-ai-secondary rounded-full flex items-center justify-center flex-shrink-0 ai-glow">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3 max-w-sm">
          <div className="w-8 h-8 bg-gradient-to-br from-ai-glow to-ai-accent rounded-full flex items-center justify-center flex-shrink-0 ai-glow">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <div className="ai-glass ai-border rounded-xl rounded-tl-md p-4 shadow-lg message-transition">
            <p className="text-sm text-foreground whitespace-pre-wrap font-medium">{message.content}</p>
            <div className="text-xs text-ai-glow font-mono mt-2">{timeStr}</div>
          </div>
        </div>
      )}
    </div>
  );
}
