import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { chatMessageSchema } from "../shared/schema.js";
import { z } from "zod";
import { SessionsClient } from "@google-cloud/dialogflow";

// Real Dialogflow integration
class DialogflowClient {
  private sessionClient: SessionsClient | null = null;
  private projectId: string;
  private isInitialized = false;
  private initError: string | null = null;

  constructor() {
    this.projectId = process.env.DIALOGFLOW_PROJECT_ID || '';
  }

  private async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.sessionClient !== null;
    }

    try {
      if (!this.projectId) {
        throw new Error('DIALOGFLOW_PROJECT_ID environment variable is required');
      }

      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      if (!credentialsJson) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
      }

      const credentials = JSON.parse(credentialsJson);
      
      this.sessionClient = new SessionsClient({
        credentials,
        projectId: this.projectId,
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      this.initError = error instanceof Error ? error.message : 'Unknown initialization error';
      console.error('Dialogflow client initialization failed:', this.initError);
      this.isInitialized = true;
      return false;
    }
  }

  async detectIntent(request: { session: string; queryInput: any }): Promise<any> {
    const isReady = await this.initialize();
    
    if (!isReady || !this.sessionClient) {
      throw new Error(`Dialogflow no disponible: ${this.initError || 'Cliente no inicializado'}`);
    }

    try {
      // Create the session path
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        this.projectId,
        request.session
      );

      // The request to send to Dialogflow
      const dialogflowRequest = {
        session: sessionPath,
        queryInput: request.queryInput,
      };

      // Send request to Dialogflow
      const responses = await this.sessionClient.detectIntent(dialogflowRequest);
      return responses;
    } catch (error) {
      console.error('Dialogflow API error:', error);
      throw error;
    }
  }
}

const dialogflowClient = new DialogflowClient();

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

  // Check if session exists (dedicated validation endpoint)
  app.head("/api/chat/:sessionId/exists", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Set cache control header to prevent caching
      res.set('Cache-Control', 'no-store');
      
      const session = await storage.getSession(sessionId);
      if (session) {
        res.status(204).end(); // Use .end() for HEAD requests instead of .send()
      } else {
        res.status(404).end(); // Session not found
      }

    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).end(); // Use .end() for HEAD requests
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
