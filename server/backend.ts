import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();

// CORS configuration for cross-origin requests
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow specific domains and patterns
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app',
      'https://localhost:3000',
      'http://localhost:3000',
      'https://localhost:5173',
      'http://localhost:5173'
    ];
    
    // Check exact matches first
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin && /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow custom domains that might be configured via environment variable
    const customDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    if (customDomains.some(domain => origin === domain.trim())) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log all requests for debugging (not just /api)
    if (true) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit", 
        second: "2-digit",
        hour12: true,
      })} [backend] ${logLine}`);
    }
  });

  next();
});


// Simple root route for debugging
app.get("/", (req, res) => {
  res.send("Backend is running");
});

(async () => {
  try {
    // Register API routes
    await registerRoutes(app);

    // Status check endpoint (moved after registerRoutes to avoid conflicts)
    app.get("/status", (req, res) => {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
      });
    });

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error(`Error ${status}: ${message}`, err);
      res.status(status).json({ message });
    });

    // Catch-all for undefined routes
    app.use("*", (req, res) => {
      res.status(404).json({ message: "API endpoint not found" });
    });

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Fix: Use proper Express server binding with separate arguments
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit", 
        hour12: true,
      })} [backend] Backend server running on port ${port}`);
      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })} [backend] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })} [backend] Server successfully bound to 0.0.0.0:${port}`);
    });

    // Handle server errors
    server.on('error', (err: any) => {
      console.error(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })} [backend] Server error:`, err);
      
      if (err.code === 'EADDRINUSE') {
        console.error(`${new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })} [backend] Port ${port} is already in use`);
      }
      
      process.exit(1);
    });

  } catch (e) {
    console.error(`${new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })} [backend] registerRoutes failed:`, e);
    process.exit(1);
  }
})();