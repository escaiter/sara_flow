import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const timeStr = message.timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} chat-bubble-enter`} data-testid={`message-${message.sender}-${message.id}`}>
      {isUser ? (
        <div className="flex items-start space-x-2 max-w-xs">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl rounded-tr-md p-3 shadow-sm">
            <p className="text-sm text-primary-foreground">{message.content}</p>
            <div className="text-xs text-primary-foreground mt-1 opacity-80">{timeStr}</div>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-user text-accent-foreground text-sm"></i>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-2 max-w-xs">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-primary-foreground text-sm"></i>
          </div>
          <div className="bg-muted rounded-xl rounded-tl-md p-3 shadow-sm">
            <p className="text-sm text-card-foreground whitespace-pre-wrap">{message.content}</p>
            <div className="text-xs text-muted-foreground mt-1">{timeStr}</div>
          </div>
        </div>
      )}
    </div>
  );
}
