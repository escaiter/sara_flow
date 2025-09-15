import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatMessageSchema } from "@shared/schema";
import { z } from "zod";

// Mock Dialogflow integration - replace with actual @google-cloud/dialogflow
class MockDialogflowClient {
  async detectIntent(request: any): Promise<any> {
    const responses = [
      "¡Excelente pregunta! Te puedo ayudar con eso.",
      "Permíteme buscar esa información para ti.",
      "¿Podrías ser más específico sobre lo que necesitas?",
      "¡Perfecto! Aquí tienes la información que solicitaste.",
      "Entiendo tu consulta. Déjame ayudarte con eso.",
      "Esa es una muy buena pregunta. Te explico:",
      "Por supuesto, puedo ayudarte con información sobre ese tema.",
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return [{
      queryResult: {
        fulfillmentText: responses[Math.floor(Math.random() * responses.length)]
      }
    }];
  }
}

const dialogflowClient = new MockDialogflowClient();

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatMessageSchema.parse(req.body);
      
      // Get or create session
      let sessionId = req.headers['x-session-id'] as string;
      let session;
      
      if (sessionId) {
        session = await storage.getSession(sessionId);
      }
      
      if (!session) {
        session = await storage.createSession();
        sessionId = session.sessionId;
      }

      // Store user message
      await storage.createMessage({
        sessionId,
        content: message,
        sender: 'user',
      });

      // Get bot response from Dialogflow
      try {
        const dialogflowResponse = await dialogflowClient.detectIntent({
          session: sessionId,
          queryInput: {
            text: {
              text: message,
              languageCode: 'es',
            },
          },
        });

        const botResponse = dialogflowResponse[0].queryResult.fulfillmentText || 
                           'Lo siento, no pude procesar tu mensaje.';

        // Store bot response
        await storage.createMessage({
          sessionId,
          content: botResponse,
          sender: 'bot',
        });

        // Update session timestamp
        await storage.updateSessionTimestamp(sessionId);

        res.json({
          reply: botResponse,
          sessionId,
        });

      } catch (dialogflowError) {
        console.error('Dialogflow error:', dialogflowError);
        
        const errorResponse = 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.';
        
        await storage.createMessage({
          sessionId,
          content: errorResponse,
          sender: 'bot',
        });

        res.json({
          reply: errorResponse,
          sessionId,
        });
      }

    } catch (error) {
      console.error('Chat endpoint error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid message format',
          errors: error.errors,
        });
      }
      
      res.status(500).json({
        message: 'Error interno del servidor',
      });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Create new session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const session = await storage.createSession();
      res.json({ sessionId: session.sessionId });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
