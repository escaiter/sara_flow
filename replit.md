# Overview

A full-stack chatbot application built with React frontend and Express backend, integrating with Google Dialogflow for conversational AI. The application features a modern chat interface with real-time messaging, session management, and a responsive design using shadcn/ui components. The system supports both user authentication and guest sessions, with PostgreSQL database integration through Drizzle ORM.

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

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tool
- **tsx**: TypeScript execution engine for Node.js

### Planned Integrations
- **Google Cloud Dialogflow**: Real conversational AI (currently mocked for development)
- **PostgreSQL**: Production database (Drizzle configured but using in-memory storage)
- **Authentication System**: User management (schema exists but not fully implemented)