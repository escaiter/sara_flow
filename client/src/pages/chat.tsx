import { useState, useEffect } from "react";
import { ChatContainer } from "@/components/chat/chat-container";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get existing session from localStorage or create new one
    const existingSession = localStorage.getItem('chat-session-id');
    if (existingSession) {
      setSessionId(existingSession);
    } else {
      createNewSession();
    }
  }, []);

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        localStorage.setItem('chat-session-id', data.sessionId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const clearChat = () => {
    localStorage.removeItem('chat-session-id');
    createNewSession();
  };

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
