# 03 — System Architecture

---

## Document Metadata

| Field           | Value                                                                              |
|-----------------|------------------------------------------------------------------------------------|
| Document ID     | 03-system-architecture                                                             |
| Version         | 1.0.0                                                                              |
| Status          | Living Document                                                                    |
| Created         | 2026-06-28                                                                         |
| Last Updated    | 2026-06-28                                                                         |
| Authors         | Founding Engineering Team                                                          |
| Audience        | Engineers, DevOps, AI Architects, Technical Founders                               |
| Parent Documents| docs/00-project-vision.md, docs/01-product-requirements.md, docs/02-ai-coach-spec.md |
| Classification  | Internal — Engineering                                                             |

---

## 1. Executive Summary

This document defines the complete technical architecture for the Zyvora MVP. It establishes the system boundaries, integration contracts, data flows, infrastructure decisions, and operational posture for every layer of the platform — from the user-facing frontend to the AI coaching intelligence to the persistence and storage layers.

Zyvora is built on a modern, cloud-native stack: **Next.js** on the frontend, **Supabase** as the backend-as-a-service layer (PostgreSQL, Edge Functions, Auth, Storage), and **OpenAI** as the primary AI provider. The architecture is designed to move quickly at MVP scale while preserving a clear path to horizontal scaling, service decomposition, and infrastructure maturity as the product grows.

The AI Coach Specification (`docs/02-ai-coach-spec.md`) defines *what* the AI must do. This document defines *how* the system is architected to fulfill those behavioral requirements. Every architectural decision here traces back to a behavioral, performance, or safety requirement established in the upstream documents.

---

## 2. High-Level Architecture

Zyvora is a full-stack web application with an AI service layer. At the highest level, the system is composed of six distinct layers:

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│          Next.js / React / TypeScript / Tailwind CSS             │
│                        (Vercel CDN)                              │
└──────────────────────────┬───────────────────────────────────────┘
                           │  HTTPS / REST / Realtime WS
┌──────────────────────────▼───────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│               Next.js API Routes + Edge Functions                │
│                  (Vercel Serverless + Edge Runtime)              │
└───────────┬──────────────┬──────────────────┬────────────────────┘
            │              │                  │
┌───────────▼───┐  ┌───────▼────────┐  ┌─────▼──────────────────┐
│  SUPABASE BaaS │  │  AI ORCH. LAYER│  │  EXTERNAL SERVICES      │
│  - Auth        │  │  - Context     │  │  - OpenAI API           │
│  - PostgreSQL  │  │    Assembly    │  │  - Vision Analysis      │
│  - Edge Funcs  │  │  - Memory Mgmt │  │  - Stripe               │
│  - Realtime    │  │  - Prompt Exec │  │  - Email (Resend/SES)   │
│  - Storage     │  │  - Safety Gate │  │                         │
└───────────────┘  └────────────────┘  └─────────────────────────┘
```

### 2.1 Client Layer

The frontend is a Next.js application deployed on Vercel. All user-facing interfaces — landing page, onboarding wizard, dashboard, AI chat, progress tracking, and settings — are rendered from this layer. The client communicates with the backend exclusively via HTTPS API calls and Supabase Realtime subscriptions for live state updates.

The client is a Progressive Web App (PWA). It is the sole user-facing delivery mechanism for the MVP. Native mobile builds are out of scope.

### 2.2 API Gateway Layer

Next.js API Routes serve as the primary API gateway. They handle request routing, authentication token verification, input validation, and orchestration of downstream service calls. Computationally lightweight operations (auth checks, profile reads, simple CRUD) are handled directly by API Routes. AI orchestration flows and background operations are dispatched to Supabase Edge Functions to keep API Route response times low.

Vercel's Edge Runtime is used selectively for routes requiring geographic proximity to the user (e.g., streaming AI responses), minimizing latency on globally distributed traffic.

### 2.3 Backend Layer (Supabase)

Supabase provides the core backend infrastructure:

- **PostgreSQL:** The primary relational database for all structured user data, plans, logs, and memory records.
- **Auth:** JWT-based authentication with Google OAuth support. Session management and token refresh are handled natively.
- **Edge Functions:** Deno-based serverless functions for AI orchestration, background processing, memory management, and webhook handling.
- **Realtime:** WebSocket-based subscriptions for live dashboard updates (macro progress bars, workout completion indicators).
- **Storage:** S3-compatible object storage for physique photos and progress images, with row-level security policies enforcing user data isolation.

### 2.4 AI Layer

The AI layer is not a single service — it is an orchestration pipeline assembled from several components:

- **Context Assembly Service:** Gathers and structures the User Context Model (as defined in `docs/02-ai-coach-spec.md`, Section 6) before every AI call.
- **Memory Management Service:** Handles reading from and writing to all four memory layers (session, short-term, long-term, persistent).
- **Safety Gate:** Pre-processes user inputs to detect emergency signals before they reach the AI model. Rules-based, not model-dependent.
- **Prompt Execution Service:** Constructs the final prompt payload and dispatches it to the OpenAI API.
- **Response Parser:** Validates and structures AI outputs before returning them to the client.

### 2.5 Storage Layer

User-uploaded physique photos and progress images are stored in Supabase Storage in private, user-scoped buckets. Access is enforced via Row Level Security (RLS) policies and short-lived pre-signed URLs. Raw, unblurred images never leave the client — blurring occurs in-browser before upload.

### 2.6 External Services

- **OpenAI API:** GPT-4o (or equivalent) for AI coaching responses and plan generation. Vision API for physique image analysis.
- **Stripe:** Payment processing. Webhook integration for subscription lifecycle events.
- **Email Provider (Resend or AWS SES):** Transactional email for verification, password recovery, check-in reminders, and milestone notifications.

---

## 3. Architecture Principles

### 3.1 Scalability

The system is designed to scale from initial thousands of users to hundreds of thousands without architectural rewrites. This is achieved through:
- Stateless API layers (API Routes and Edge Functions) that scale horizontally with traffic.
- Supabase's managed PostgreSQL with connection pooling via PgBouncer.
- Vercel's automatic scaling and global CDN distribution for the frontend.
- Asynchronous processing for all AI and media workloads — no synchronous blocking on expensive operations.

### 3.2 Maintainability

- Each system concern (auth, AI orchestration, memory management, storage, payments) is encapsulated in a dedicated module or service with a defined interface.
- Shared business logic lives in a common utility layer consumed by both API Routes and Edge Functions.
- Environment-specific configuration is externalized. No hardcoded environment assumptions.
- All AI prompt templates and coaching logic are versioned and stored as configuration, not hardcoded strings.

### 3.3 Security

- All transport is TLS 1.3. Internal service-to-service calls use service-role tokens, not user tokens.
- Supabase Row Level Security (RLS) is the primary data access control mechanism. Every database table has RLS policies enforced at the database level — not solely at the application level.
- Secrets are managed via environment variables injected at deployment time (Vercel environment config + Supabase vault for function secrets). No secrets in source control.
- The AI layer never receives raw, identifiable PII (full names, email addresses). It receives user IDs and structured health/fitness data only.

### 3.4 Performance

- Frontend assets are statically generated at build time where possible (landing page, marketing content). Dynamic routes use server-side rendering with aggressive caching.
- AI responses are streamed to the client to reduce perceived latency.
- Database queries on hot paths (dashboard load, check-in retrieval) are index-optimized and query-planned.
- Images are served from Vercel's CDN with Next.js Image Optimization applied to all non-user-generated content.

### 3.5 Reliability

- Supabase provides managed PostgreSQL with automated failover and point-in-time recovery.
- AI calls are wrapped in retry logic with exponential backoff and graceful degradation messaging.
- Background jobs (memory promotion, notification dispatch, plan generation) are idempotent — safe to retry on failure.
- All critical paths have timeout bounds. No unbounded operations.

### 3.6 Observability

- Structured logging is applied to all API Routes and Edge Functions. Every log entry includes: user ID (hashed), operation type, duration, status, and any error context.
- AI call logs include: context payload hash, model version, token counts, latency, and whether the safety gate was triggered.
- Application-level metrics (active sessions, check-in completion rates, AI error rates) are emitted to a monitoring service.
- Error tracking (e.g., Sentry) captures unhandled exceptions with stack traces stripped of PII.

### 3.7 Modularity

- The codebase is organized by domain (auth, onboarding, ai-coach, progress, nutrition, plans), not by technical type (controllers, models, views).
- Each domain exposes a clean internal API consumed by the API layer. Domain internals are not accessed directly from route handlers.
- The AI layer is fully decoupled from the product layer. Swapping the underlying LLM provider requires changes only in the AI layer — no changes to product logic.

---

## 4. Frontend Architecture

### 4.1 Technology Stack

| Technology     | Role                                              |
|----------------|---------------------------------------------------|
| Next.js 14+    | Full-stack React framework, App Router            |
| React 18+      | Component rendering, Suspense, Server Components  |
| TypeScript     | Type safety across the full frontend codebase     |
| Tailwind CSS   | Utility-first styling                             |
| shadcn/ui      | Accessible, unstyled base component library       |
| Zustand        | Lightweight global client state management        |
| React Query    | Server state, caching, and data synchronization   |
| React Hook Form + Zod | Form management and schema validation     |

### 4.2 Folder Structure

The project follows a domain-driven folder structure within the Next.js App Router convention.

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Unauthenticated routes
│   │   ├── page.tsx              # Landing page
│   │   ├── login/
│   │   └── register/
│   ├── (auth)/                   # Authenticated routes (layout-guarded)
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── coach/                # AI Chat interface
│   │   ├── progress/
│   │   ├── nutrition/
│   │   ├── workouts/
│   │   ├── settings/
│   │   └── physique/
│   └── api/                      # API Routes
│       ├── auth/
│       ├── ai/
│       ├── plans/
│       ├── progress/
│       ├── nutrition/
│       └── webhooks/
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── shared/                   # Shared composite components
│   └── [domain]/                 # Domain-specific components
├── domains/
│   ├── auth/
│   ├── onboarding/
│   ├── ai-coach/
│   ├── workout/
│   ├── nutrition/
│   ├── progress/
│   └── physique/
├── lib/
│   ├── supabase/                 # Supabase client instances
│   ├── ai/                       # AI layer utilities
│   ├── validations/              # Shared Zod schemas
│   └── utils/
├── hooks/                        # Shared React hooks
├── stores/                       # Zustand stores
└── types/                        # Global TypeScript types
```

### 4.3 Routing

Next.js App Router is used exclusively. Route groups organize authenticated and public surfaces without affecting URL structure.

- **Public routes** (`(public)/`): Landing page, login, register. No auth required. Middleware redirects authenticated users away from these routes.
- **Authenticated routes** (`(auth)/`): All product surfaces. A shared layout component wraps these routes, validating the user session on every load. Unauthenticated users are redirected to `/login`.
- **Onboarding guard:** A middleware check on all `(auth)/` routes evaluates the user's `onboarding_status` flag. Users with incomplete onboarding are redirected to `/onboarding` regardless of the target route.
- **Admin routes** (`(admin)/`): Admin-only surfaces. Protected by a role check on the user's JWT claims. Returns 404 (not 403) to non-admin users.

### 4.4 State Management Strategy

State is partitioned by its nature:

| State Type          | Tool            | Examples                                                   |
|---------------------|-----------------|-------------------------------------------------------------|
| Server state        | React Query     | User profile, active plan, progress logs, nutrition data    |
| UI state            | Zustand         | Modal open/close, active tab, sidebar collapsed state       |
| Form state          | React Hook Form | Onboarding wizard, check-in forms, settings forms           |
| Auth session state  | Supabase Auth   | JWT, user ID, session expiry                                |
| Realtime state      | Supabase Realtime | Live macro progress, workout completion status            |

Global state via Zustand is kept minimal. The store contains only true global UI state — not data that belongs in React Query's cache.

### 4.5 Component Strategy

Components are organized by specificity:

- **Base components** (`components/ui/`): shadcn/ui primitives. Button, Input, Card, Dialog, etc. Modified from shadcn defaults to match the Zyvora design system. These components are never domain-aware.
- **Shared components** (`components/shared/`): Composite components used across multiple domains. Examples: `PageHeader`, `LoadingSpinner`, `ErrorBoundary`, `MetricCard`.
- **Domain components** (`components/[domain]/`): Components specific to one domain. They consume domain state and may call domain hooks. Examples: `WorkoutSessionLogger`, `MacroProgressBar`, `PhysiquePhotoUploader`.

Server Components are used for all data-fetching rendering paths. Client Components are used only where interactivity requires it (event handlers, state, browser APIs). This minimizes the JavaScript bundle delivered to the client.

### 4.6 Form Management

All forms use React Hook Form with Zod schemas for validation. The Zod schema is the single source of truth for a form's shape — it is shared between the client-side form and the server-side API validation layer. A change to a field type propagates automatically to both.

Multi-step forms (onboarding wizard, check-in) store intermediate state in a Zustand store keyed by form name. On page refresh, state is rehydrated from the store to prevent data loss.

### 4.7 Caching Strategy

- **React Query** manages server state with configured `staleTime` and `gcTime` per query. High-frequency queries (dashboard data) use shorter stale windows. Low-frequency queries (user profile, plan structure) use longer windows.
- **Next.js Data Cache** is used for statically cacheable content (exercise database lookups, coaching style definitions).
- **Optimistic updates** are applied to logging interactions (marking a set complete, incrementing a macro). The UI updates immediately; the server write is confirmed asynchronously.

### 4.8 Error Handling

- All async operations are wrapped in error boundaries at the route level. A route-level error does not crash the full application.
- API errors return a structured error object (`{ code, message, field? }`). The client maps error codes to user-facing messages. Raw error messages from the server are never displayed to users.
- Network errors on logging operations (gym connectivity) queue writes locally via IndexedDB and flush when connectivity restores.

---

## 5. Backend Architecture

### 5.1 Service Topology

The backend is composed of two compute surfaces:

**Next.js API Routes:** Handle synchronous, user-facing requests requiring low latency. Responsible for: authentication flows, profile CRUD, plan retrieval, log writes, and routing to appropriate domain services.

**Supabase Edge Functions:** Handle asynchronous, compute-intensive operations. Responsible for: AI orchestration, memory management, plan generation, physique analysis pipeline coordination, Stripe webhook processing, and notification dispatch.

This separation ensures that expensive AI and processing operations never block the user-facing API response cycle.

### 5.2 Domain Services

Each domain encapsulates its own business logic, validation rules, and data access patterns. Domain services are the only layer that interacts directly with the database. API Routes and Edge Functions call domain services — they do not write database queries directly.

| Domain Service         | Responsibilities                                                              |
|------------------------|-------------------------------------------------------------------------------|
| `AuthService`          | Session validation, token refresh, role resolution                            |
| `UserProfileService`   | Profile reads, profile updates, unit conversion, constraint management        |
| `OnboardingService`    | Step state management, completion detection, initial plan trigger             |
| `PhysiqueService`      | Photo metadata management, analysis result storage, override processing       |
| `WorkoutPlanService`   | Plan generation triggers, block retrieval, exercise substitution logic        |
| `WorkoutLogService`    | Session log writes, volume calculation, PR detection                          |
| `NutritionService`     | TDEE calculation, macro split generation, daily log management                |
| `AiCoachService`       | Context assembly, conversation management, memory promotion                   |
| `MemoryService`        | Read/write to all memory layers, retrieval query construction                 |
| `ProgressService`      | Metric aggregation, trend calculation, milestone detection                    |
| `NotificationService`  | Event-triggered dispatch, preference enforcement, schedule management         |
| `SubscriptionService`  | Tier management, feature gate enforcement, Stripe event handling              |

### 5.3 AI Orchestration Layer

AI orchestration is the most complex component of the backend. It is implemented as a stateless Edge Function pipeline with defined stages:

**Stage 1 — Safety Pre-Processing**
User input is passed through a rules-based safety filter before any other processing. Emergency signal detection occurs here. If a signal is detected, the pipeline is bypassed and an emergency response is returned directly.

**Stage 2 — Context Assembly**
The `MemoryService` is called to assemble the User Context Model. This involves:
- Reading persistent memory from the user profile table.
- Reading short-term memory from the recent logs tables.
- Executing a semantic similarity search against the long-term memory vector store.
- Assembling the structured context payload.

**Stage 3 — Prompt Construction**
The assembled context is merged with the interaction-type-specific prompt template and the user's active coaching style modifier. The final prompt payload is constructed with the system message, context block, and user message.

**Stage 4 — Model Execution**
The prompt payload is dispatched to the OpenAI API with streaming enabled. The response stream is forwarded to the client in real time via a Server-Sent Events (SSE) connection.

**Stage 5 — Response Post-Processing**
On stream completion, the full response is: parsed for structured signals (injury reports, goal changes, preference corrections), evaluated for memory promotion criteria, and logged to the AI output audit log.

**Stage 6 — Memory Write**
Any memory promotion events identified in Stage 5 are written to the appropriate memory store. This is an asynchronous write — it does not block the response already delivered to the client.

### 5.4 Input Validation

All API Route inputs are validated using Zod schemas before reaching domain services. Validation occurs at the API boundary — domain services assume valid input. Schema definitions are shared between client and server from a common `validations/` directory to ensure consistency.

Validation failures return structured `400` responses with field-level error details. The API never exposes internal error messages, stack traces, or database error codes to clients.

### 5.5 Structured Logging

Every API Route and Edge Function emits structured logs in JSON format. The log schema includes:

- `timestamp` — ISO 8601
- `requestId` — UUID generated at request entry
- `userId` — Hashed user identifier (never raw)
- `operation` — Domain service and method called
- `durationMs` — Operation execution time
- `status` — Success or error code
- `error` — Error message if applicable (no PII, no stack trace in production)

AI calls emit an additional log entry including: `contextPayloadHash`, `modelVersion`, `promptTokens`, `completionTokens`, `streamLatencyMs`, `safetyGateTriggered`.

### 5.6 Error Handling

Errors are classified into three categories:

| Category          | Handling                                                              |
|-------------------|-----------------------------------------------------------------------|
| Client Error (4xx)| Structured error response returned immediately. Not logged as system error. |
| Recoverable Server Error (5xx) | Logged with full context. Retry logic applied where applicable. User receives a generic retry message. |
| Critical Error    | Logged with full context. Alert fired to monitoring. Graceful degradation response to user. |

AI service errors have specific handling: OpenAI API unavailability returns a graceful degradation message ("Your coach is unavailable right now. Please try again in a few minutes.") — not a technical error. This is a named behavior, not an unhandled exception.

### 5.7 Background Jobs

Background jobs are implemented as Supabase Edge Functions triggered by database events (via pg_net or scheduled via pg_cron):

| Job                         | Trigger                                           | Frequency        |
|-----------------------------|---------------------------------------------------|------------------|
| Weekly Check-in Prompt      | 7 days since last check-in                        | Daily scan       |
| Memory Promotion Processor  | Post-check-in event                               | Event-driven     |
| Notification Dispatcher     | Scheduled workout days, milestone events          | Daily            |
| Plan Expiry Monitor         | Training block end date reached                   | Daily scan       |
| Inactive User Re-engagement | 5+ days since last login                          | Daily scan       |
| Long-Term Memory Summarizer | Weekly, per user with new short-term data         | Weekly           |

All background jobs are idempotent. Duplicate executions produce the same state — they do not create duplicate records or double-send notifications.

---

## 6. AI Architecture

### 6.1 AI Coach Engine

The AI Coach Engine is the central intelligence service. It is stateless — all state is retrieved from the memory and storage layers on each invocation. This statelessness is what allows the engine to scale horizontally without session affinity.

**Input:** User message + interaction type identifier + user ID.
**Output:** Streaming coaching response + structured post-processing signals.

The engine orchestrates the six-stage pipeline described in Section 5.3. It enforces the behavioral specification from `docs/02-ai-coach-spec.md` — coaching style application, confidence framework, explainability rules, and safety hard limits — at the prompt construction and response validation stages.

### 6.2 Memory Engine

The Memory Engine implements the four-layer memory model defined in `docs/02-ai-coach-spec.md`, Section 5.

**Session Memory:** Held in-process (not persisted). A session conversation array is maintained for the duration of an open chat session. On session close, the final conversation state is passed to the Memory Promotion Processor.

**Short-Term Memory:** Read from PostgreSQL tables (workout logs, nutrition logs, weight logs, conversation summaries) via indexed queries scoped to the 14-day window. Written directly by domain service actions (log write triggers a short-term memory update).

**Long-Term Memory:** Stored as structured summary records in PostgreSQL, with vector embeddings generated and stored in `pgvector` (Supabase's native vector extension). Retrieval uses cosine similarity search against an embedding of the current interaction context. The retrieval query is constructed by the Context Assembly stage.

**Persistent Memory:** Read from the user profile table. Always included in context. Updated only on explicit profile change events.

**Memory Promotion Processor:** An async Edge Function that runs post-check-in and post-session. It:
1. Receives the session conversation and the current short-term memory state.
2. Identifies promotion-eligible events (new injury, goal change, completed block, notable behavioral pattern).
3. Generates structured summaries for long-term memory records.
4. Generates vector embeddings for new long-term records.
5. Writes to the appropriate tables.

### 6.3 Recommendation Engine

The Recommendation Engine operates within the AI Coach Engine. It applies the Decision-Making Framework (Priority 1–8, as defined in `docs/02-ai-coach-spec.md`, Section 7) to construct coaching outputs.

For structured recommendations (plan adjustments, caloric changes, deload prescriptions), the engine outputs a machine-readable structured block alongside the natural language explanation. This structured block is used by downstream services to apply plan changes directly — the user does not need to manually update their plan based on a text recommendation.

Structured recommendation blocks include: `type`, `domain` (workout/nutrition), `action`, `parameters`, and `rationale_key` (a reference to the reasoning in the response text).

### 6.4 Prompt Layer

The Prompt Layer is responsible for constructing the final prompt payload sent to the OpenAI API.

- **System message:** Defines the AI's role, coaching style modifier, current date, and active safety constraints.
- **Context block:** The assembled User Context Model, formatted as structured Markdown sections (Profile, Current Plan, Recent Activity, Constraints, Goals).
- **Memory block:** Retrieved long-term memory summaries, formatted as bulleted context notes.
- **Interaction type block:** Defines the expected output structure for the current interaction type (check-in format, casual chat, plan review).
- **User message:** The user's input, passed verbatim after safety gate processing.

Prompt templates are versioned. Each template version is stored with a version identifier. AI calls log the template version used. This allows A/B testing of prompt changes and attribution of output quality changes to specific template versions.

### 6.5 Reasoning Layer

The Reasoning Layer is a post-processing component that parses AI outputs before delivery.

**Responsibilities:**
- Detects structured recommendation signals embedded in the response.
- Validates that the response satisfies the Explainability Rules (rationale present, confidence language appropriate).
- Identifies memory promotion signals (injury mentions, goal change statements, behavioral pattern confirmators).
- Flags outputs that violate safety constraints (medical advice leakage, certainty overclaiming).

Flagged outputs are logged for human review. In the MVP, flagged outputs are still delivered to the user (blocking delivery would create a worse UX than the occasional imperfect output). The review log feeds the AI quality improvement pipeline.

### 6.6 Image Analysis Pipeline

The Physique Analysis pipeline processes uploaded images to extract body composition estimates.

**Pipeline Stages:**

1. **Upload Validation:** File format, size, and basic image quality checks are performed server-side on receipt of the upload event. Low-quality images (too dark, too blurry, insufficient body coverage) are rejected with specific error codes.

2. **Secure Transfer:** Validated images are stored in the user's private Supabase Storage bucket. A pre-signed URL with a 10-minute expiry is generated.

3. **Vision API Call:** The pre-signed URLs for the front, side, and back images are passed to the OpenAI Vision API with a structured analysis prompt. The prompt instructs the model to estimate body fat percentage (with confidence interval), waist-to-hip ratio, frame structure, and generate a physique synthesis narrative.

4. **Result Validation:** The Vision API response is parsed and validated against expected output schema. Numeric estimates are checked for plausible ranges. Out-of-range estimates trigger a re-analysis request with a more constrained prompt.

5. **Storage:** Validated analysis results are written to the `physique_analyses` table, linked to the user and the specific photo set.

6. **Plan Feed:** The analysis results are written to the user's active profile context, making them immediately available to the Workout Plan and Nutrition Plan generators.

The image analysis pipeline is asynchronous. The client initiates the upload and receives a job ID. It polls or subscribes via Realtime to receive the analysis completion event. The UI displays an in-progress state during analysis.

---

## 7. Data Flow

### 7.1 User Registration Flow

```
Client                API Route           AuthService         Supabase Auth       Email Provider
  │                      │                    │                    │                   │
  ├─ POST /register ─────►│                    │                    │                   │
  │                      ├─ Validate Input ───►│                    │                   │
  │                      │                    ├─ supabase.auth ────►│                   │
  │                      │                    │   .signUp()         ├─ Create user ─────►│
  │                      │                    │                    │   record           ├─ Send verify
  │                      │                    │                    │                   │   email
  │◄─ 201 + session ──────┤                    │                    │                   │
  │                      │                    │                    │                   │
  ├─ Redirect to ─────────►                                                            
  │   /onboarding                                                                      
```

### 7.2 Onboarding Flow

```
Client                API Routes          OnboardingService   WorkoutPlanService  NutritionService
  │                      │                    │                    │                   │
  ├─ PATCH /onboarding ──►│  (per step)        │                    │                   │
  │   /step/{n}          ├─ ValidateStep ─────►│                    │                   │
  │                      │                    ├─ Persist step ──────►                   │
  │◄─ 200 + next step ────┤                    │   state             │                   │
  │                      │                    │                    │                   │
  │  [Final step]        │                    │                    │                   │
  ├─ POST /onboarding ───►│                    │                    │                   │
  │   /complete          ├─ Mark complete ────►│                    │                   │
  │                      │                    ├──────────────────────► GeneratePlan()   │
  │                      │                    │                    │                   │
  │                      │                    ├────────────────────────────────────────►│
  │                      │                    │                    │   CalculateTDEE()  │
  │◄─ 201 + redirect ─────┤                    │                    │                   │
  │   to /physique        │                    │                    │                   │
```

### 7.3 Photo Upload and Analysis Flow

```
Client (Browser)       API Route          PhysiqueService     Storage         Vision API
  │                      │                    │                  │               │
  ├─ Face blur           │                    │                  │               │
  │  (canvas, local)     │                    │                  │               │
  │                      │                    │                  │               │
  ├─ POST /physique ─────►│                    │                  │               │
  │   /upload            ├─ ValidateFile ─────►│                  │               │
  │                      │                    ├─ Upload to ───────►               │
  │                      │                    │   Storage         │               │
  │                      │                    ├─ Generate ────────►               │
  │                      │                    │   presigned URL   │               │
  │◄─ 202 + job_id ───────┤                    │                  │               │
  │                      │                    ├─ Call Vision ──────────────────────►
  │                      │                    │   API             │               │
  │  [Realtime sub]      │                    │◄─ Analysis ────────────────────────
  │◄─ analysis_complete ──┤                    │   result          │               │
  │                      │                    ├─ Write to DB ─────►               │
  │                      │                    ├─ Update user ──────►               │
  │                      │                    │   context         │               │
```

### 7.4 AI Chat Flow

```
Client            Safety Gate       Context Assembly      OpenAI API        Memory Engine
  │                   │                   │                   │                  │
  ├─ POST /ai ────────►│                   │                   │                  │
  │   /chat           ├─ Scan input        │                   │                  │
  │                   │                   │                   │                  │
  │  [Emergency?]     │                   │                   │                  │
  │◄─ Emergency ───────┤ Yes               │                   │                  │
  │   response        │                   │                   │                  │
  │                   │                   │                   │                  │
  │                   ├─ Pass ────────────►│                   │                  │
  │                   │   (No emergency)  ├─ Fetch persistent ─────────────────────►
  │                   │                   │   + short-term    │                  │
  │                   │                   ├─ Semantic search ──────────────────────►
  │                   │                   │   long-term mem.  │                  │
  │                   │                   ├─ Build payload    │                  │
  │                   │                   ├─ POST to OpenAI ──►│                  │
  │◄─ Stream ──────────────────────────────────────────────────┤                  │
  │   response        │                   │                   │                  │
  │                   │                   │                   │                  │
  │  [Stream end]     │                   │                   │                  │
  │                   │                   ├─ Parse signals ────────────────────────►
  │                   │                   │                   │   Promote memory  │
  │                   │                   │                   │   Write logs      │
```

### 7.5 Weekly Check-In Flow

```
Client           API Route        AiCoachService       MemoryEngine       PlanServices
  │                  │                 │                    │                  │
  ├─ POST /ai ───────►│                 │                    │                  │
  │   /checkin       ├─ Auth + ────────►│                    │                  │
  │                  │   validate      ├─ Assemble ──────────►                  │
  │                  │                 │   full context      │                  │
  │                  │                 ├─ Run check-in ───────────────────────────►
  │                  │                 │   template prompt   │   Fetch plan     │
  │◄─ Stream ─────────────────────────────────────────────────►                 │
  │   check-in       │                 │                    │                  │
  │   summary        │                 │                    │                  │
  │                  │                 │                    │                  │
  │  [Stream end]    │                 │                    │                  │
  │                  │                 ├─ Write checkin ─────►                  │
  │                  │                 │   summary           │                  │
  │                  │                 ├─ Apply plan ──────────────────────────────►
  │                  │                 │   adjustments       │   Update plan     │
  │◄─ 200 + plan ─────┤                 │                    │                  │
  │   updated        │                 │                    │                  │
```

### 7.6 Progress Tracking Flow

```
Client              API Route           WorkoutLogService     ProgressService
  │                     │                    │                     │
  ├─ POST /progress ────►│                   │                     │
  │   /workout-log      ├─ Validate ─────────►│                    │
  │                     │                    ├─ Write log          │
  │                     │                    ├─ Detect PR ─────────►│
  │                     │                    │                     ├─ Flag milestone
  │                     │                    │                     ├─ Queue notify
  │◄─ 201 + updated ─────┤                    │                     │
  │   state             │                    │                     │
```

---

## 8. Authentication Flow

### 8.1 Registration

New user registration is handled by Supabase Auth via the `supabase.auth.signUp()` method. On successful registration:
1. Supabase Auth creates a user record in the `auth.users` table.
2. A database trigger fires, creating a corresponding record in the `public.users` table with default values.
3. An email verification link is dispatched via the configured email provider.
4. The client receives a session token and is redirected to `/onboarding`.
5. The onboarding route's middleware verifies the `onboarding_status` flag and holds the user in the onboarding flow until completion.

Unverified email addresses are allowed to begin onboarding. Verification is required before plan generation is triggered (the final onboarding step).

### 8.2 Login

Login flows through Supabase Auth via `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOAuth()` for Google. On success:
1. A JWT access token (15-minute expiry) and a refresh token (7-day expiry) are issued.
2. Tokens are stored in `httpOnly` cookies managed by the Supabase SSR client — not in `localStorage`.
3. The middleware reads the session from the cookie on every request to the `(auth)/` route group.
4. Verified user with completed onboarding: redirect to `/dashboard`.
5. Verified user with incomplete onboarding: redirect to `/onboarding` at the last incomplete step.
6. Unverified user: redirect to a verification prompt page.

### 8.3 Session Management

- Access tokens are automatically refreshed by the Supabase client when they approach expiry.
- Refresh token rotation is enabled. Each use of a refresh token issues a new refresh token and invalidates the old one.
- Concurrent session detection: If a refresh token is used from two different clients simultaneously, both sessions are invalidated and the user is required to re-authenticate. This is a security posture against token theft.
- On password change: all active sessions for the user are invalidated immediately via `supabase.auth.admin.signOut()` with `scope: 'global'`.

### 8.4 Authorization

Authorization is enforced at three levels:

**Level 1 — Middleware (Route Level)**
Next.js middleware checks for a valid session cookie on every request to `(auth)/` routes. Requests without a valid session are redirected to `/login`. This is the outermost defense layer.

**Level 2 — API Layer (Service Level)**
API Routes extract and verify the user ID from the JWT claim. All domain service calls are scoped to the authenticated user ID. Cross-user data access at the service layer is architecturally prevented — service methods accept a `userId` parameter and cannot return data for a different user.

**Level 3 — Database Layer (RLS Policies)**
Supabase Row Level Security policies enforce data isolation at the database level. Every table with user-owned data has an RLS policy requiring `auth.uid() = user_id`. This is the final defense layer — even if a bug in the API layer passed the wrong user ID, the database would reject the query.

Admin authorization adds a fourth layer: JWT claims include a `role` field. Admin routes verify the `admin` role claim before processing any request. Admin-scoped database operations use the service-role key, which bypasses RLS — all admin operations are therefore explicitly audited.

---

## 9. Storage Strategy

### 9.1 Relational Data (PostgreSQL via Supabase)

All structured user data, plans, logs, and memory records are stored in PostgreSQL. Data is organized by domain, with foreign key relationships enforcing referential integrity.

High-read tables (user profile, active plan, daily targets) are cached at the React Query layer with appropriate stale times. Write operations invalidate the relevant cache entries.

### 9.2 Vector Data (pgvector)

Long-term memory records include a vector embedding generated from their content. These embeddings are stored in a `pgvector`-enabled column alongside the record. Semantic retrieval queries use an HNSW (Hierarchical Navigable Small World) index for approximate nearest neighbor search, balancing retrieval accuracy with query speed.

The embedding model is consistent across all records. A change in the embedding model requires re-embedding all existing records — this is tracked as a migration event in the schema version table.

### 9.3 Object Storage (Supabase Storage)

Physique photos and progress photos are stored in Supabase Storage in private buckets organized by user ID.

- Bucket structure: `physique-photos/{user_id}/{photo_set_id}/{view}.webp`
- Access: Row Level Security policies on storage objects restrict access to the owning user. Pre-signed URLs with 10-minute expiry are generated server-side for any client access.
- Images are stored in WebP format after server-side conversion for storage efficiency.
- Metadata (upload timestamp, associated analysis ID, photo set type) is stored in the `physique_photos` database table, not in object metadata.

### 9.4 Session State

Chat session state (the in-progress conversation array) is held in-process within the Edge Function handling the streaming response. It is not persisted to storage. On session completion, a summary is generated and written to the `conversation_summaries` table (short-term memory). The raw conversation is not stored — only the summary.

### 9.5 Analytics Events

Anonymous telemetry events are written to a dedicated `analytics_events` table with a partitioned schema (partitioned by month). This table is append-only. No updates or deletes are applied. The table is excluded from user data export and deletion routines (it contains no PII — user IDs are hashed before insertion).

---

## 10. Security Architecture

### 10.1 Encryption

- All traffic is TLS 1.3. Supabase and Vercel enforce this at the infrastructure level.
- Data at rest: Supabase storage and PostgreSQL are encrypted using AES-256 at the infrastructure layer. This is managed by Supabase/the underlying cloud provider.
- Physique photos: Double-protected via bucket-level encryption (infrastructure) and access-control RLS policies (application).

### 10.2 Authentication Security

- Passwords are hashed using bcrypt with a work factor of 12 by Supabase Auth. The application never handles raw passwords.
- OAuth tokens are never stored — only the resulting Supabase session token is persisted (in `httpOnly` cookies).
- MFA is supported via Supabase Auth's TOTP implementation. Admin accounts require MFA.

### 10.3 Authorization Security

The three-layer authorization model is described in Section 8.4. The critical principle: no single authorization layer is trusted in isolation. All three layers must independently enforce access control.

### 10.4 Rate Limiting

Rate limiting is applied at multiple levels:

| Surface                        | Limit                                        | Enforcement Point     |
|--------------------------------|----------------------------------------------|-----------------------|
| `/login`, `/register`          | 5 requests/minute per IP                     | Middleware + Vercel   |
| `/api/ai/chat`                 | 20 requests/minute per authenticated user    | API Route             |
| `/api/physique/upload`         | 3 uploads/hour per authenticated user        | API Route             |
| All authenticated API routes   | 200 requests/minute per authenticated user   | Middleware            |
| Supabase Edge Functions        | Rate limited at function level via config    | Supabase              |

Rate limit violations return `429 Too Many Requests` with a `Retry-After` header.

### 10.5 Secrets Management

- All secrets (OpenAI API key, Stripe secret key, Supabase service role key, email provider API key) are stored as environment variables in Vercel's encrypted environment configuration and Supabase's Vault.
- Secrets are never logged, never included in error responses, and never committed to source control.
- Secret rotation follows a zero-downtime rotation pattern: new secret is provisioned, both old and new are active simultaneously during a brief window, old secret is revoked.
- A `.env.example` file in the repository documents required environment variables with placeholder values.

### 10.6 Input Validation and Sanitization

- All API Route inputs are validated by Zod schemas before processing.
- String inputs destined for database writes are sanitized to prevent SQL injection. Parameterized queries (via the Supabase client) enforce this at the ORM level.
- AI prompt inputs undergo safety gate screening before model submission.
- File uploads are validated for MIME type, file size, and basic image header integrity before being accepted.
- The AI layer receives user input as a delimited string segment — not interpolated directly into the system message — to prevent prompt injection attacks.

---

## 11. Performance Strategy

### 11.1 Caching Layers

| Layer                   | Tool                  | Applied To                                                     |
|-------------------------|-----------------------|----------------------------------------------------------------|
| Browser (client state)  | React Query           | User profile, active plan, recent logs, nutrition targets      |
| CDN (static assets)     | Vercel Edge Network   | Landing page, JS/CSS bundles, public images, fonts             |
| Next.js Data Cache      | Next.js               | Exercise database lookups, coaching style definitions          |
| Database query cache    | PostgreSQL + PgBouncer| Connection pooling; frequently-executed parameterized queries  |

Cache invalidation on write operations follows a precise scope: writes to a user's profile invalidate only that user's profile cache, not the global cache.

### 11.2 Lazy Loading and Code Splitting

- Next.js App Router enables automatic code splitting at the route level. Each route's JavaScript is loaded only when that route is visited.
- Heavy client-side libraries (charting libraries for progress visualization) are dynamically imported using `next/dynamic` with a loading fallback.
- Below-fold components use the Intersection Observer API to defer rendering until they enter the viewport.

### 11.3 Image Optimization

- Next.js Image component (`<Image>`) is used for all non-user-generated images. It handles: automatic WebP conversion, responsive `srcset` generation, lazy loading, and placeholder blur.
- User-uploaded physique photos are converted to WebP server-side before storage.
- Progress chart thumbnails are pre-generated at upload time to avoid on-demand processing at render time.

### 11.4 Database Optimization

- Index strategy: all foreign key columns, all columns used in `WHERE` clauses on hot paths, and all timestamp columns used for time-range queries are indexed.
- The `workout_logs`, `nutrition_logs`, and `weight_logs` tables are the highest-volume write tables. They use a composite index on `(user_id, logged_at)` to support the 14-day window queries efficiently.
- The `long_term_memory` table's vector column uses an HNSW index with tuned `m` and `ef_construction` parameters.
- Connection pooling via PgBouncer is configured in transaction mode to maximize connection reuse across serverless function invocations.
- Expensive aggregation queries (trend calculations, volume summaries) are pre-computed by background jobs and stored in a `computed_metrics` table. Dashboard reads from the pre-computed table, not from raw log tables.

### 11.5 AI Response Latency

- AI responses are streamed via Server-Sent Events (SSE). The first token reaches the client within approximately 1 second of the API call, providing immediate visual feedback.
- Context assembly is optimized: persistent memory is always available in-request from the user's profile read. Short-term memory uses indexed queries bounded by the 14-day window. Long-term memory retrieval uses an HNSW approximate search, not an exact cosine scan.
- The context payload is bounded in size by a token budget enforced during assembly. Long-term memory records are retrieved in relevance-ranked order and truncated if the budget is exceeded.

---

## 12. Scalability Strategy

### 12.1 Horizontal Scaling

- **Frontend:** Vercel's serverless deployment scales automatically. Each API Route invocation is independent. No shared in-process state.
- **Edge Functions:** Supabase Edge Functions scale on invocation. The AI orchestration pipeline's stateless design allows unlimited horizontal scaling.
- **Database:** Supabase's managed PostgreSQL supports read replicas for read-heavy scaling. In the MVP, a single primary instance is used with connection pooling. Read replicas are introduced when read query load exceeds the primary instance's capacity.

### 12.2 Queue Processing

Background jobs that risk overloading the database under high concurrency (e.g., plan generation triggered for many users simultaneously) are queued via a job table pattern in PostgreSQL, processed by a dedicated Edge Function worker with configurable concurrency limits.

For post-MVP scale, this pattern is designed to migrate to a dedicated queue service (e.g., Upstash QStash) without changes to the producer code — the producer writes to the queue, the consumer implementation is swapped.

### 12.3 AI Workload Management

OpenAI API rate limits are a scaling constraint. The system manages this through:
- Per-user request rate limiting (Section 10.4) to prevent any single user from exhausting the quota.
- Request queuing for non-real-time AI operations (memory summarization, plan generation) with configurable throughput throttles.
- Model tier selection: streaming chat uses the highest-capability model tier. Background tasks (memory summarization) may use a lower-cost model tier without affecting the user-facing experience.

### 12.4 CDN Distribution

Vercel's Edge Network serves frontend assets from geographically distributed PoPs. The AI streaming endpoint uses Vercel's Edge Runtime to minimize server-to-client latency for users distant from the primary database region.

The Supabase project region is selected based on the primary user geography at launch. Multi-region database configurations are a post-MVP consideration.

### 12.5 Future Microservice Decomposition

The domain service architecture is designed with future decomposition in mind. Each domain service (Section 5.2) is a candidate for extraction into an independent microservice when its scale warrants it.

The most likely first extraction candidates, in order:
1. **AI Coach Service** — highest resource consumption, benefits most from independent scaling.
2. **Notification Service** — high volume, time-sensitive, benefits from independent reliability posture.
3. **Memory Service** — growing data complexity, specialized storage needs (vector + relational).

The internal API contract between domain services and the API layer is designed to be location-transparent — service calls do not assume co-location. Extraction requires changing the transport mechanism (function call → HTTP call), not the interface.

---

## 13. Monitoring

### 13.1 Logging

All structured logs from API Routes and Edge Functions are shipped to a centralized log aggregation service. Log retention: 30 days hot storage, 12 months cold storage.

Log levels: `DEBUG` (development only), `INFO` (standard operations), `WARN` (recoverable errors, rate limit hits), `ERROR` (unhandled errors, external service failures).

PII Scrubbing: A log pre-processing filter scrubs known PII fields (email addresses, names, body measurements) before logs are written to external aggregation. User identifiers in logs are hashed.

### 13.2 Metrics

Application-level metrics emitted to a monitoring service (e.g., Grafana Cloud or Datadog):

| Metric                              | Type    | Alert Threshold           |
|-------------------------------------|---------|---------------------------|
| API Route p95 response time         | Gauge   | > 2000ms                  |
| AI streaming first-token latency    | Gauge   | > 3000ms                  |
| AI API error rate                   | Counter | > 2% of calls per 5 min   |
| Check-in completion rate            | Gauge   | < 50% over 7-day window   |
| Database connection pool utilization| Gauge   | > 80%                     |
| Safety gate trigger rate            | Counter | Any spike above baseline  |
| Background job failure rate         | Counter | > 1% per job type         |
| Storage upload failure rate         | Counter | > 1% of upload attempts   |

### 13.3 Health Checks

A `/api/health` endpoint returns the operational status of each system dependency: database connectivity, Supabase Auth, OpenAI API reachability, and Storage. The health check is used by Vercel's uptime monitoring and by external uptime services.

### 13.4 Alerts

Alerts are configured for the thresholds in Section 13.2. Alert routing:
- Critical alerts (AI error rate spike, database connectivity loss, payment webhook failures): PagerDuty or equivalent, immediate on-call notification.
- Warning alerts (elevated latency, high connection pool utilization): Slack notification to engineering channel, no immediate on-call.

### 13.5 Distributed Tracing

A `requestId` UUID is generated at the entry point of each API request and propagated through all downstream service calls (Edge Functions, AI API calls, database queries). This ID appears in all log entries for the request chain, enabling full reconstruction of a request's execution path across services.

---

## 14. Disaster Recovery

### 14.1 Backup

- Supabase provides continuous WAL (Write-Ahead Log) archiving and daily automated snapshots.
- Daily snapshots are retained for 30 days.
- The `pgvector` data (long-term memory embeddings) is included in standard PostgreSQL backups.
- Supabase Storage objects are replicated within the cloud provider's availability zone. Cross-region replication is a post-MVP consideration.

### 14.2 Restore

- Point-in-time recovery (PITR) is available for the PostgreSQL database. Recovery to any point within the WAL retention window (7 days on the Supabase Pro tier) can be executed via the Supabase dashboard.
- Recovery Time Objective (RTO): Under 4 hours for a full database restore. Under 30 minutes for a PITR operation restoring a specific table's state.
- Recovery Point Objective (RPO): Under 1 hour for database data. Up to 24 hours for storage objects (daily snapshot dependency).

### 14.3 Rollback

**Application rollback:** Vercel maintains a deployment history. A rollback to any previous deployment is instantaneous via the Vercel dashboard. The previous build's static assets are already distributed on the CDN — rollback involves only updating the active deployment pointer.

**Database migration rollback:** All database migrations are written with corresponding rollback scripts. Migrations are applied sequentially and numbered. Rolling back a migration applies the rollback script and decrements the schema version.

**Schema breaking change policy:** Any migration that removes a column, changes a column type, or alters an index on a production table requires a multi-step deployment:
1. Deploy code that supports both old and new schema.
2. Apply migration.
3. Verify correctness.
4. Deploy code that removes backward compatibility shim.

This eliminates single-deployment schema breakage.

---

## 15. Requirement IDs

| ID        | Requirement Summary                                                                            |
|-----------|-----------------------------------------------------------------------------------------------|
| ARCH-001  | All user-facing routes in the `(auth)/` group must validate session via middleware before rendering. |
| ARCH-002  | Row Level Security must be enabled on all PostgreSQL tables containing user-owned data.        |
| ARCH-003  | The AI orchestration pipeline must enforce the Safety Gate as the first processing stage before context assembly. |
| ARCH-004  | All AI calls must log context payload hash, model version, token counts, and latency.          |
| ARCH-005  | Physique photos must be stored in private Supabase Storage buckets. No public URL access is permitted. |
| ARCH-006  | Pre-signed photo URLs must expire within 10 minutes of generation.                            |
| ARCH-007  | All API Route inputs must be validated by Zod schemas before reaching domain services.         |
| ARCH-008  | Background jobs must be idempotent. Duplicate execution must not produce duplicate data.       |
| ARCH-009  | AI streaming responses must deliver the first token within 3 seconds under normal load.        |
| ARCH-010  | The dashboard page must load in under 1.5 seconds on a 3G-throttled network.                  |
| ARCH-011  | All secrets must be stored in Vercel environment configuration or Supabase Vault. No secrets in source control. |
| ARCH-012  | Rate limiting must be enforced on all public authentication endpoints (login, register).       |
| ARCH-013  | Database migrations must include rollback scripts. No irreversible migration is deployed without a documented recovery plan. |
| ARCH-014  | The `requestId` must propagate through all service calls within a single request chain.        |
| ARCH-015  | PII scrubbing must be applied to all logs before they are written to external aggregation.     |
| ARCH-016  | The long-term memory vector column must use an HNSW index for semantic retrieval.              |
| ARCH-017  | The computed_metrics table must be refreshed by background jobs so dashboard reads never execute raw log aggregation queries at request time. |
| ARCH-018  | All domain service methods must be scoped to the authenticated user ID. Cross-user data access is architecturally prevented. |
| ARCH-019  | Prompt templates must be versioned. Every AI call must log the template version used.         |
| ARCH-020  | The health check endpoint must report the status of all critical external dependencies.        |

---

## 16. Risks

| Risk                                                       | Likelihood | Impact   | Mitigation                                                                         |
|------------------------------------------------------------|------------|----------|------------------------------------------------------------------------------------|
| OpenAI API outage or rate limit breach                     | Medium     | High     | Graceful degradation messaging; per-user rate limiting; retry with backoff          |
| Supabase PostgreSQL performance degradation at scale       | Medium     | High     | Read replicas; connection pooling tuning; pre-computed metrics; index reviews       |
| Vector search quality degrades as long-term memory grows  | Low        | Medium   | HNSW index tuning; relevance score thresholds; periodic embedding model review     |
| Prompt injection via user chat inputs                      | Medium     | High     | Input delimited from system message; safety gate pre-processing; output monitoring |
| Vercel cold start latency spikes on AI streaming routes    | Medium     | Medium   | Edge Runtime for streaming routes; keep-warm strategies if required                |
| PgBouncer connection exhaustion under concurrent AI calls  | Low        | High     | Connection pool sizing proportional to Edge Function concurrency limits             |
| Stripe webhook delivery failures                           | Low        | High     | Idempotent webhook handlers; event log for manual reconciliation; retry policy      |
| Schema migration applied incorrectly to production         | Low        | Critical | Migration dry-run environment; rollback scripts; staging environment promotion      |

---

## 17. Assumptions

- Supabase's managed PostgreSQL provides sufficient throughput and PITR coverage for the MVP scale without requiring a self-managed database.
- OpenAI's GPT-4o Vision API provides physique analysis accuracy sufficient to meet the AIPHY module requirements (estimated body fat with ±2–3% precision).
- Vercel's Edge Runtime supports the streaming SSE pattern required for AI chat responses without additional configuration.
- The `pgvector` extension's HNSW implementation on Supabase provides adequate semantic retrieval performance for long-term memory at the scale of thousands of users.
- User-uploaded photos are taken with smartphone cameras in reasonably controlled lighting conditions. The pipeline assumes minimum quality equivalent to a modern smartphone camera in daylight.
- The MVP user base is primarily English-speaking. Internationalization (i18n) of AI coaching responses is not architected for the MVP.

---

## 18. Cross References

| Document                | Path                               | Relationship                                                        |
|-------------------------|------------------------------------|---------------------------------------------------------------------|
| Project Vision          | `docs/00-project-vision.md`        | Engineering Principles (Section 2.1 of the Vision) inform all architectural decisions here. |
| Product Requirements    | `docs/01-product-requirements.md`  | Non-Functional Requirements (Section 7) define the performance, security, and reliability targets this architecture must satisfy. |
| AI Coach Specification  | `docs/02-ai-coach-spec.md`         | Memory model, context model, and AI pipeline behavioral spec that this architecture implements. |
| Database Schema         | `docs/04-database-schema.md`       | Defines the tables, relationships, indexes, and RLS policies referenced in this document. |
| API Specification       | `docs/05-api-specification.md`     | Defines the API contracts for all routes and Edge Functions referenced in this document's data flow diagrams. |

---

*This document is version-controlled. Changes to security architecture (Section 10), authentication flow (Section 8), or RLS policy strategy require founding team sign-off. Infrastructure changes require a migration plan documented as an addendum before execution.*
