# ReelRevive - VHS-to-Digital Conversion Service

## Overview

ReelRevive is a full-stack web platform for a VHS-to-digital conversion service. The platform enables customers to configure orders for converting their old VHS tapes (and other formats like VHS-C, Hi8, MiniDV, Betamax) into digital formats. It includes a customer-facing website for browsing services and placing orders, plus an admin dashboard for order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (navy/amber color scheme for nostalgic VHS-era feel)
- **File Uploads**: Uppy with AWS S3 integration for presigned URL uploads

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled with tsx for development, esbuild for production)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL storage (connect-pg-simple)

### Data Storage
- **Primary Database**: PostgreSQL (required - uses DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions using Drizzle
- **Key Entities**: Users, Orders, OrderNotes with defined status workflows
- **Object Storage**: Google Cloud Storage integration via Replit's sidecar service for file uploads

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Page components (Home, Pricing, GetStarted, Admin, etc.)
    hooks/        # Custom React hooks
    lib/          # Utility functions and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database operations layer
  db.ts           # Database connection setup
shared/           # Code shared between client and server
  schema.ts       # Drizzle schema definitions and Zod validators
```

### Key Design Decisions

1. **Shared Schema Approach**: Database schema and validation types are defined once in `shared/schema.ts` and used by both frontend (for type safety) and backend (for database operations and validation).

2. **Storage Abstraction**: The `IStorage` interface in `server/storage.ts` abstracts database operations, making it easier to test and potentially swap storage implementations.

3. **Pricing Logic**: Pricing calculations are defined in the shared schema with constants (`PRICING`) to ensure consistency between frontend estimates and backend calculations.

4. **Order Status Workflow**: Orders follow a defined status progression (pending → label_sent → tapes_received → in_progress → quality_check → ready_for_download → shipped → complete).

## External Dependencies

### Database
- **PostgreSQL**: Required for all data persistence. Connection via `DATABASE_URL` environment variable.

### Cloud Services
- **Google Cloud Storage**: Used for file uploads via Replit's object storage integration. Handles presigned URL generation for direct client uploads.

### Key NPM Packages
- **@tanstack/react-query**: Server state management
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **@radix-ui/***: Accessible UI primitives
- **@uppy/core, @uppy/aws-s3**: File upload handling
- **stripe**: Payment processing (configured but implementation details in routes)
- **zod**: Schema validation for API requests