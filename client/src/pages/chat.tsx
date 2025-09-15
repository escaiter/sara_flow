import { useState, useEffect, useRef } from "react";
import { ChatContainer } from "@/components/chat/chat-container";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isValidatingRef = useRef(false);

  useEffect(() => {
    // Get existing session from localStorage or create new one
    const existingSession = localStorage.getItem('chat-session-id');
    if (existingSession) {
      // Validate that the session exists in the backend with debouncing
      debouncedValidateAndSetSession(existingSession);
    } else {
      createNewSession();
    }
  }, []);

  const debouncedValidateAndSetSession = (sessionId: string) => {
    // Clear any existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    // Set a new timeout for debounced validation
    validationTimeoutRef.current = setTimeout(() => {
      validateAndSetSession(sessionId);
    }, 100); // 100ms debounce
  };

  const validateAndSetSession = async (sessionId: string) => {
    // Prevent multiple simultaneous validations
    if (isValidatingRef.current) {
      return;
    }
    
    isValidatingRef.current = true;
    setError(null);

    try {
      // Use the dedicated validation endpoint with cache control
      const response = await fetch(`/api/chat/${sessionId}/exists`, {
        method: 'HEAD',
        cache: 'no-store', // Prevent caching issues
      });
      
      if (response.status === 204 || response.status === 200) {
        // Session exists, use it (accept both 204 and 200 as valid)
        setSessionId(sessionId);
      } else if (response.status === 404) {
        // Session doesn't exist, clear localStorage and create new one
        console.log('Session not found in backend, creating new session');
        localStorage.removeItem('chat-session-id');
        createNewSession();
      } else {
        // Other error status (5xx, etc.) - treat as temporary error
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      // Network error or server error - don't create new session, show retryable error
      console.error('Error validating session:', error);
      setError('Error de conexión. Verifica tu conexión a internet.');
      // Don't clear localStorage or create new session for network errors
    } finally {
      isValidatingRef.current = false;
    }
  };

  const createNewSession = async () => {
    setError(null);
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        localStorage.setItem('chat-session-id', data.sessionId);
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error al crear nueva sesión. Verifica tu conexión a internet.');
    }
  };

  const clearChat = () => {
    // Clear current session
    setSessionId(null);
    setError(null);
    localStorage.removeItem('chat-session-id');
    
    // Clear any pending validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    isValidatingRef.current = false;
    
    // Create new session
    createNewSession();
  };

  const retryConnection = () => {
    setIsRetrying(true);
    setError(null);
    
    const existingSession = localStorage.getItem('chat-session-id');
    if (existingSession) {
      validateAndSetSession(existingSession).finally(() => {
        setIsRetrying(false);
      });
    } else {
      createNewSession().finally(() => {
        setIsRetrying(false);
      });
    }
  };

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-background circuit-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="ai-text text-lg mb-4 text-red-400">ERROR DE CONEXIÓN</div>
          <div className="text-sm text-gray-400 mb-6">{error}</div>
          <div className="space-y-3">
            <button
              onClick={retryConnection}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md transition-colors disabled:opacity-50"
              data-testid="button-retry-connection"
            >
              {isRetrying ? 'REINTENTANDO...' : 'REINTENTAR'}
            </button>
            <button
              onClick={createNewSession}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors disabled:opacity-50"
              data-testid="button-new-session"
            >
              CREAR NUEVA SESIÓN
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background circuit-bg flex items-center justify-center">
        <div className="ai-text text-lg">INICIANDO SISTEMA NEXUS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background circuit-bg flex items-center justify-center p-4">
      <ChatContainer sessionId={sessionId} onClearChat={clearChat} />
    </div>
  );
}
