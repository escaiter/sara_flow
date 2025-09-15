export function TypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="typing-indicator">
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
          <i className="fas fa-robot text-primary-foreground text-sm"></i>
        </div>
        <div className="bg-muted rounded-xl rounded-tl-md p-3 shadow-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2">Escribiendo...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
