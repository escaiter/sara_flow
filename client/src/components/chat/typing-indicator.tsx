export function TypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="typing-indicator">
      <div className="flex items-start space-x-3 max-w-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-ai-glow to-ai-accent rounded-full flex items-center justify-center flex-shrink-0 ai-glow">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
        <div className="ai-glass ai-border rounded-xl rounded-tl-md p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-ai-glow rounded-full typing-indicator"></div>
              <div className="w-2 h-2 bg-ai-glow rounded-full typing-indicator" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-ai-glow rounded-full typing-indicator" style={{ animationDelay: '0.6s' }}></div>
            </div>
            <span className="text-xs text-ai-glow font-mono ml-2">PROCESANDO...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
