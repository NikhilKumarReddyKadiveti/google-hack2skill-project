# Overview

Feel-Better AI is a mental health companion application that provides empathetic AI-powered conversations and crisis intervention support. The system combines real-time chat capabilities with voice interaction, mood tracking, and crisis detection to create a safe, supportive environment for users seeking emotional support. Built as a full-stack TypeScript application, it features a React frontend with voice recognition and text-to-speech capabilities, an Express backend with WebSocket support, and PostgreSQL database integration for persistent user data and conversation history.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application is built with React 18 and TypeScript, utilizing a component-based architecture with functional components and React hooks. The UI framework leverages shadcn/ui components built on Radix UI primitives for accessibility and consistency. The application uses Wouter for lightweight client-side routing and TanStack Query for server state management with intelligent caching and background updates.

The frontend implements several specialized hooks for browser APIs:
- `useSpeechRecognition` for voice input processing
- `useTextToSpeech` for AI response vocalization
- `useWebSocket` for real-time communication with the backend
- `useAuth` for user authentication state management

The styling system combines Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes with a cohesive design system focused on accessibility and emotional comfort.

## Backend Architecture
The server is built with Express.js and follows a service-oriented architecture pattern. Core services include:
- OpenAI integration for natural language processing and empathetic response generation
- Crisis detection algorithms that analyze user input for concerning language patterns
- Mood analysis services that track emotional patterns over time
- WebSocket server for real-time bidirectional communication

The authentication system integrates with Replit's OpenID Connect provider, handling user sessions with PostgreSQL-backed session storage. The backend implements comprehensive error handling and request logging for debugging and monitoring.

## Database Design
The PostgreSQL schema supports the core application features through several interconnected tables:
- Users table for authentication and profile data
- Conversations table tracking chat sessions with mode differentiation (talk vs survey)
- Messages table storing all conversation content with sentiment analysis
- Mood entries for tracking emotional states over time
- Crisis events for logging and managing emergency situations
- User sessions for activity tracking and analytics

The database uses Drizzle ORM for type-safe database operations and schema management, with automatic migrations and relationship handling.

## Real-time Communication
WebSocket integration enables immediate message delivery and real-time crisis intervention capabilities. The system maintains persistent connections for active users and implements automatic reconnection with exponential backoff for network resilience.

## AI Integration
The application leverages OpenAI's language models for generating empathetic responses and performing sentiment analysis. The AI system is specifically tuned for mental health conversations, with crisis detection algorithms that can identify concerning language patterns and trigger appropriate intervention protocols.

# External Dependencies

## Cloud Services
- **Neon Database**: PostgreSQL hosting with serverless scaling and connection pooling
- **OpenAI API**: GPT models for natural language processing, empathetic response generation, and sentiment analysis
- **Replit Authentication**: OpenID Connect provider for secure user authentication and session management

## Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript for component architecture
- **TanStack Query**: Server state management with caching and synchronization
- **Radix UI**: Accessible component primitives for UI foundation
- **shadcn/ui**: Pre-built component library for consistent design system
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting utilities

## Backend Dependencies
- **Express.js**: Web application framework with middleware support
- **Drizzle ORM**: Type-safe database operations and schema management
- **WebSocket (ws)**: Real-time bidirectional communication
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **express-session**: Session management with PostgreSQL storage

## Development Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS compilation