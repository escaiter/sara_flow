export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in" data-testid="typing-indicator">
      <div className="flex items-start space-x-3 max-w-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-ai-glow to-ai-accent rounded-full flex items-center justify-center flex-shrink-0 ai-glow typing-indicator">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
        <div className="ai-glass ai-border rounded-xl rounded-tl-md p-4 shadow-lg message-transition">
          <div className="flex items-center space-x-3">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-xs text-ai-glow font-mono animate-pulse">NEXUS PROCESANDO...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
