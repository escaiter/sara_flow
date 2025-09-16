# Overview

A full-stack chatbot application built with React frontend and Express backend, integrating with Google Dialogflow for conversational AI. The application features a modern chat interface with real-time messaging, session management, and a responsive design using shadcn/ui components. The system supports both user authentication and guest sessions, with PostgreSQL database integration through Drizzle ORM.

# Recent Changes

**September 16, 2025** - Backend Deployment Configuration:
- Created `server/backend.ts` for independent Render deployment
- Added CORS middleware for cross-origin requests from Vercel frontend
- Updated frontend API client to support environment variable for backend URL
- Configured production-ready error handling and logging
- Added health check endpoint for deployment monitoring

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React 18** with **TypeScript** and follows a modern component-based architecture:

- **UI Framework**: Uses shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system variables and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The component structure follows a clean separation:
- `/components/ui/` - Reusable UI components from shadcn/ui
- `/components/chat/` - Chat-specific components (container, messages, input, header)
- `/pages/` - Route-based page components
- `/hooks/` - Custom React hooks for shared logic

## Backend Architecture

The backend uses **Express.js** with **TypeScript** in a monorepo structure:

- **API Layer**: RESTful endpoints for chat messaging and session management
- **Mock Dialogflow Integration**: Currently uses a mock implementation that can be replaced with actual Google Dialogflow client
- **Session Management**: Handles chat sessions with unique identifiers stored in browser localStorage
- **Storage Abstraction**: Interface-based storage system with in-memory implementation (designed to be replaceable with database layer)

The server structure includes:
- `/server/routes.ts` - API route definitions and handlers
- `/server/storage.ts` - Storage abstraction layer with in-memory implementation
- `/server/vite.ts` - Development server setup with HMR support

## Data Storage Solutions

**Database Schema** (Drizzle ORM with PostgreSQL):
- `users` table - User authentication with username/password
- `messages` table - Chat messages with session association, sender type, and timestamps
- `chat_sessions` table - Session tracking with user association and timestamps

**Current Implementation**: Uses in-memory storage for development with interface designed for easy migration to PostgreSQL.

**Migration Strategy**: Drizzle Kit configured for PostgreSQL with migrations in `/migrations` directory.

## Session Management

- **Frontend**: Session IDs stored in localStorage for persistence across browser sessions
- **Backend**: Session creation and validation through dedicated endpoints
- **Guest Support**: Anonymous sessions supported without user authentication
- **Session Persistence**: Automatic session restoration on page reload

## External Dependencies

### Core Dependencies
- **@google-cloud/dialogflow**: Google's conversational AI platform (currently mocked)
- **@neondatabase/serverless**: Neon PostgreSQL serverless database connector
- **drizzle-orm**: Type-safe SQL ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js

### UI and Styling
- **@radix-ui/***: Headless UI component primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library built on Radix UI
- **lucide-react**: Icon library for React components

### Production Dependencies
- **typescript**: TypeScript compiler used for backend compilation in production builds

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tool
- **tsx**: TypeScript execution engine for Node.js

### Planned Integrations
- **Google Cloud Dialogflow**: Real conversational AI (currently mocked for development)
- **PostgreSQL**: Production database (Drizzle configured but using in-memory storage)
- **Authentication System**: User management (schema exists but not fully implemented)

## Deployment Configuration

### Backend Deployment (Render)

The backend has been configured for independent deployment to Render with the following setup:

**Files Created:**
- `server/backend.ts` - Backend-only server that excludes Vite setup
- Updated `server/index.ts` - Added CORS middleware for cross-origin requests

**Key Features:**
- **CORS Configuration**: Supports Vercel production and preview domains (*.vercel.app pattern matching)
- **Environment Variables**: Supports `FRONTEND_URL` for main domain and `ALLOWED_DOMAINS` for custom domains
- **Health Check**: Available at `/health` endpoint
- **Error Handling**: Comprehensive error logging and handling
- **Session Management**: Maintains chat sessions across requests
- **Flexible Domain Support**: Automatically allows all Vercel preview deployments while maintaining security

**Deployment Commands for Render:**
```bash
# Build command (REQUIRED for production)
tsc --project tsconfig.backend.json

# Start command (uses compiled output)
NODE_ENV=production node dist/server/backend.js
```

**Required Environment Variables for Render:**
```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
ALLOWED_DOMAINS=https://custom-domain.com,https://another-domain.com (optional)
DATABASE_URL=your_postgresql_connection_string
DIALOGFLOW_PROJECT_ID=your_dialogflow_project_id
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_service_account_json
PORT=5000
```

### Frontend Configuration (Vercel)

The frontend has been updated to support backend URL configuration:

**Environment Variable:**
```
VITE_BACKEND_URL=https://your-render-backend.onrender.com
```

**Features:**
- **Dynamic Backend URL**: Uses environment variable or falls back to relative URLs for development
- **Cross-Origin Support**: Includes credentials in requests for session management
- **Error Handling**: Maintains existing error handling with remote backend

### Local Development

**Current Setup** (Full-stack development):
```bash
npm run dev  # Runs frontend + backend with Vite
```

**Backend-Only Testing:**
```bash
# Development (with tsx)
NODE_ENV=production tsx server/backend.ts

# Production-like (with compiled output)
tsc --project tsconfig.backend.json
NODE_ENV=production node dist/server/backend.js
```

### Production Architecture

```
[Vercel Frontend] <---> [Render Backend] <---> [PostgreSQL Database]
                                         <---> [Google Dialogflow]
```

**Communication Flow:**
1. Frontend (Vercel) makes API calls to backend (Render)
2. Backend handles CORS and validates sessions
3. Backend integrates with Dialogflow for AI responses
4. Backend stores messages and sessions in PostgreSQL
5. Response sent back to frontend

### Security Considerations

- **CORS**: Multi-layered domain validation:
  - Exact matches for specified domains (FRONTEND_URL)
  - Pattern matching for Vercel preview deployments (*.vercel.app)
  - Custom domains via ALLOWED_DOMAINS environment variable
  - Development mode allows all origins for testing
- **Credentials**: Session cookies and headers included in cross-origin requests
- **Environment Variables**: Sensitive data (API keys, database URLs) stored securely
- **Error Handling**: No sensitive information exposed in error responses
- **Domain Security**: Vercel pattern matching prevents subdomain takeover attacks while allowing legitimate previews