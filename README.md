# Zyvora: From Potential to Physique

> The world's most trusted AI fitness coach — built for everyone.

---

## Project Overview

Zyvora is an AI-powered fitness coaching platform that delivers elite, personalized physique coaching at scale. It combines:

- **Visual Physique Analysis** — AI computer vision estimates body composition from photos
- **Adaptive Workout Programming** — Periodized plans that adjust weekly based on performance
- **Precision Nutrition Planning** — Science-backed macro targets recalculated on check-in
- **Conversational AI Coach** — Long-term memory that knows your history, adapts over time

**Tech Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · OpenAI

---

## Documentation

The `/docs` folder is the single source of truth for every engineering decision:

| Document | Description |
|----------|-------------|
| [00-project-vision.md](docs/00-project-vision.md) | Product philosophy, principles, and 5-10 year roadmap |
| [01-product-requirements.md](docs/01-product-requirements.md) | MVP functional modules, user stories, and NFR targets |
| [02-ai-coach-spec.md](docs/02-ai-coach-spec.md) | AI memory architecture, safety gates, and reasoning logic |
| [03-system-architecture.md](docs/03-system-architecture.md) | Service topology, data flows, and infrastructure design |
| [04-database-schema.md](docs/04-database-schema.md) | PostgreSQL schema, RLS policies, and pgvector setup |
| [05-api-specification.md](docs/05-api-specification.md) | REST API contracts, SSE streaming, and error codes |

Read the docs in order before making any code changes.

---

## Getting Started

### Prerequisites

- Node.js 20+ (installed via `winget install OpenJS.NodeJS.LTS`)
- npm 10+
- Supabase CLI (`npm install -g supabase`)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/your-org/zyvora.git
cd zyvora
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

### 3. Initialize Local Database

```bash
npx supabase start
npx supabase db reset
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run type-check` | TypeScript type check without emitting |

---

## Folder Structure

```
zyvora/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/            # Authenticated app pages
│   ├── api/                    # API Route Handlers
│   │   ├── health/             # Health check endpoint
│   │   └── v1/                 # Versioned API routes (Sprint 2+)
│   └── auth/callback/          # Supabase OAuth callback handler
├── components/
│   ├── ui/                     # shadcn/ui base components
│   └── shared/                 # Shared composite components
├── config/                     # Environment & feature flag configuration
├── constants/                  # Application-wide constants
├── contexts/                   # React context providers
├── docs/                       # Architecture & specification documents
├── features/                   # Domain-specific feature modules
├── hooks/                      # Shared React hooks
├── lib/
│   ├── supabase/               # Supabase client factories (browser, server, middleware)
│   ├── validations/            # Shared Zod schemas
│   └── utils.ts                # cn() class merge utility
├── providers/                  # Root app providers (theme, query, toasts)
├── public/                     # Static assets
├── services/                   # External service integrations
├── styles/                     # Additional style files
├── supabase/
│   ├── migrations/             # Numbered SQL migration files
│   └── seed.sql                # Development seed data
├── types/
│   ├── database.ts             # Supabase-generated database types
│   └── index.ts                # Shared domain types
└── utils/                      # Pure utility functions
```

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Server Components reduce client bundle; route groups cleanly separate auth/dashboard/public |
| `@supabase/ssr` | Handles auth cookies correctly for SSR — prevents session loss on navigation |
| Zustand | Minimal global state (UI only). Server state in React Query |
| Sonner | Modern, accessible toast library; replaces react-hot-toast |
| Zod schemas shared client/server | Single source of truth for input validation shapes |
| `cn()` utility | Prevents Tailwind class conflicts via tailwind-merge |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

Vercel automatically detects Next.js and configures the build.

### Environment Variables for Production

Copy all values from `.env.example` into Vercel's environment variable settings. Never commit secrets to source control.

---

## Development Conventions

- **Branch naming:** `feature/`, `fix/`, `chore/`
- **Commit format:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **TypeScript:** Strict mode on. No `any` without justification.
- **Imports:** Use path aliases (`@/lib/...`, `@/components/...`) — never relative `../../`
- **Styles:** Tailwind CSS only. No inline styles or separate CSS files outside `globals.css`.

---

## Sprint Roadmap

| Sprint | Focus |
|--------|-------|
| **Sprint 1** ✅ | Foundation — project setup, auth scaffold, Supabase config |
| **Sprint 2** | Authentication UI — login, register, forgot-password flows |
| **Sprint 3** | Onboarding wizard + physique photo upload |
| **Sprint 4** | Workout planner engine |
| **Sprint 5** | Dashboard + progress tracking |
| **Sprint 6** | AI Coach integration + memory engine |
| **Sprint 7** | Billing (Stripe) + admin panel |

---

*Built with precision. Every decision is documented in `/docs`.*
# ZyvoraV1  
