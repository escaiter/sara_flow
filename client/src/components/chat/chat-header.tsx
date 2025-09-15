import { Cpu } from "lucide-react";

interface ChatHeaderProps {
  onClearChat: () => void;
}

export function ChatHeader({ onClearChat }: ChatHeaderProps) {

  return (
    <div className="ai-glass ai-border rounded-t-xl shadow-lg circuit-bg" data-testid="chat-header">
      <div className="flex items-center justify-between p-6 border-b border-ai-border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 ai-glow-intense rounded-full flex items-center justify-center bg-gradient-to-br from-ai-glow via-ai-secondary to-ai-accent">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-ai-accent ai-glow rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="ai-text text-lg font-bold" data-testid="bot-name">NEXUS AI</h3>
            <p className="text-xs text-ai-glow font-mono" data-testid="bot-status">● SISTEMA ACTIVO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
