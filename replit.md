# Neurosurgery Department AI Scheduling Assistant

## Overview

This is a full-stack web application for a neurosurgery department that provides an AI-powered scheduling assistant. The system allows patients to interact with an AI chatbot to schedule appointments, while providing administrators with a comprehensive dashboard to manage appointments and view analytics. The application features a conversational interface that guides patients through the appointment booking process by collecting their location, assessing urgency levels, and connecting them with appropriate doctors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Design System**: Modern design with neutral color scheme and extensive component library

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Development Setup**: Hot reload with Vite integration for development mode
- **Storage**: In-memory storage implementation with interface for future database integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured but using memory storage currently)
- **Schema**: Well-defined tables for users, doctors, appointments, chat sessions, and messages
- **Migration System**: Drizzle Kit for database migrations

### Core Data Models
- **Users**: Authentication and user management
- **Doctors**: Medical professionals with specialties, ratings, and locations
- **Appointments**: Patient bookings with urgency levels and status tracking
- **Chat Sessions**: Conversation state management
- **Chat Messages**: Individual messages with sender identification

### AI Integration
- **Provider**: OpenAI GPT-4o for natural language processing
- **Conversation Flow**: Multi-step guided conversation for appointment booking
- **Information Extraction**: Automated extraction of patient details, location, and urgency
- **Response Generation**: Context-aware responses based on conversation state

### Authentication & Authorization
- **Current State**: Basic user schema prepared but no active authentication
- **Session Management**: Connect-pg-simple configured for PostgreSQL sessions
- **Future Implementation**: Ready for session-based authentication system

### Application Features
- **Patient Interface**: AI chat for appointment scheduling with guided conversation flow
- **Admin Dashboard**: Comprehensive view of appointments, calendar, and urgent cases
- **Dual Mode Interface**: Toggle between patient chat and admin views
- **Responsive Design**: Mobile-optimized interface with proper breakpoints
- **Real-time Updates**: Live data fetching and updates via React Query

### Development & Deployment
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Environment**: Development and production configurations
- **Code Quality**: TypeScript strict mode with comprehensive type definitions
- **Asset Management**: Optimized asset handling and static file serving

## External Dependencies

### Core Framework Dependencies
- **Frontend**: React 18, Vite, TypeScript
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL via Neon Database serverless driver
- **ORM**: Drizzle ORM with Zod validation

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icon library
- **Design Utilities**: Class Variance Authority, clsx for conditional styling

### AI and External Services
- **AI Provider**: OpenAI API for GPT-4o language model
- **API Key Management**: Environment variable configuration for OpenAI

### Development Tools
- **Build Tools**: Vite with React plugin, esbuild for backend
- **Type Checking**: TypeScript with strict configuration
- **Development Enhancements**: Replit-specific plugins for development environment
- **Error Handling**: Runtime error overlay for development

### Data Management
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Hookform resolvers
- **Validation**: Zod schema validation with Drizzle integration
- **Date Handling**: date-fns for date manipulation

### Database and Storage
- **Database Driver**: Neon Database serverless for PostgreSQL
- **Session Store**: connect-pg-simple for PostgreSQL session management
- **Migration Tools**: Drizzle Kit for database schema management