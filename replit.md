# OCS AI Triage Portal

## Overview

This is a white-label AI Triage Portal for professional services intake, classification, and routing. It acts as a "smart front door" concierge that helps hiring managers and budget holders define their service requirements through a guided, conversational AI-driven workflow. The portal classifies demand into engagement routes (independent contractors, statement of work, agency labour) and connects to downstream procure-to-pay systems.

Currently branded for **OCS – UK & Ireland Facilities Services Group** with the strapline "Technology-Led, Self-Delivered Integrated FM." The system is designed as a demo/MVP with no live integrations to external procurement platforms.

The core workflow is: **Define Need → AI Discovery Chat → Recommendation → Specification → Supplier Selection → Summary**

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State Management**: TanStack React Query for server state; local component state for UI
- **Styling**: Tailwind CSS with CSS variables for theming, shadcn/ui component library (new-york style), Framer Motion for animations
- **UI Components**: Full shadcn/ui component set in `client/src/components/ui/`, custom components in `client/src/components/`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Key pages**: Landing, Dashboard, TriageFlow (multi-step wizard with sub-pages: TriageChat, TriageRecommendation, TriageSpecification, TriageSuppliers, TriageSummary)
- **Triage Flow**: 3-step wizard tracked via URL query params (`?step=discovery|specification|summary`), with a visual stepper component (`StatusStepper`)
- **Conversational AI Flow**: Two-stage conversation — Stage 1 gathers general requirements (categories A-I) and recommends route(s), Stage 2 gathers route-specific details after agreement. Markers: `[RECOMMENDATION_AGREED]` saves route, `[SPECIFICATION_READY]` enables spec generation.
- **Supported Route Types**: Statement of Work (sow), Independent Contractor (independent), Agency Labour (agency), Permanent Hire (permanent). Multiple routes can be recommended simultaneously.

### Backend (Express + Node.js)
- **Framework**: Express.js on Node.js with TypeScript (via `tsx`)
- **Entry point**: `server/index.ts` creates HTTP server, registers routes, serves static files in production or Vite dev server in development
- **API structure**: RESTful JSON API under `/api/` prefix. Route definitions shared between client and server in `shared/routes.ts` using Zod schemas
- **Build**: Custom build script (`script/build.ts`) uses Vite for client and esbuild for server, outputting to `dist/`
- **Development**: `tsx server/index.ts` with Vite middleware for HMR

### Authentication
- **Replit Auth** via OpenID Connect (OIDC) with Passport.js
- Session storage in PostgreSQL via `connect-pg-simple`
- Auth files in `server/replit_integrations/auth/`
- Sessions table and users table are mandatory for Replit Auth — do not drop them
- Client uses `/api/auth/user` endpoint and `useAuth()` hook

### Database
- **PostgreSQL** with Drizzle ORM
- **Schema location**: `shared/schema.ts` (re-exports from `shared/models/`)
- **Migration tool**: `drizzle-kit push` (schema push approach, not migration files)
- **Key tables**:
  - `users` — Replit Auth users (mandatory)
  - `sessions` — Session storage (mandatory)
  - `conversations` — Chat conversation threads
  - `messages` — Individual chat messages within conversations
  - `triage_requests` — Main triage workflow records with JSONB `answers` and `recommendation` fields
  - `specifications` — Generated service specifications linked to triage requests
  - `suppliers` — Supplier directory (seeded on startup)

### AI / Chat Integration
- **OpenAI-compatible API** via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Chat routes in `server/replit_integrations/chat/` handle conversation CRUD and AI message generation
- Triage chat endpoint (`POST /api/triage/:id/chat`) sends user messages through AI to extract requirements
- Document upload endpoint (`POST /api/triage/:id/upload-document`) accepts PDF/DOCX/DOC/TXT/CSV files, extracts text using pdf-parse and mammoth, sends to AI for analysis, and auto-extracts structured data
- Recommendation generation endpoint (`POST /api/triage/:id/recommend`) uses AI to classify engagement routes
- Audio/voice capabilities available in `server/replit_integrations/audio/` (optional)
- Image generation available in `server/replit_integrations/image/` (optional)

### Shared Code (`shared/`)
- `shared/schema.ts` — Drizzle table definitions and Zod insert schemas
- `shared/routes.ts` — API route definitions with Zod validation schemas, used by both client and server
- `shared/models/auth.ts` — User and session table definitions
- `shared/models/chat.ts` — Conversation and message table definitions

### Key Design Patterns
- **Shared type safety**: Zod schemas in `shared/routes.ts` validate both client requests and server responses
- **Storage abstraction**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation
- **Replit integrations**: Modular structure under `server/replit_integrations/` for auth, chat, audio, image, and batch processing
- **White-labeling**: CSS variables for colors in `client/src/index.css`, OCS branding in components. Only logo and strapline are configurable per client

## External Dependencies

- **PostgreSQL**: Primary database, required. Connection via `DATABASE_URL` environment variable
- **Replit Auth (OIDC)**: Authentication provider. Requires `ISSUER_URL` (defaults to Replit OIDC), `REPL_ID`, and `SESSION_SECRET` environment variables
- **OpenAI-compatible AI API**: Used for chat, recommendations, and specifications. Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
- **Google Fonts**: Inter and Outfit fonts loaded via CDN in `client/index.html`
- **Replit Vite Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev-only)