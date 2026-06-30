-- Migration 001: Initialize extensions and base schema
-- Sprint: 1 — Foundation
-- Description: Enable required PostgreSQL extensions.
--              Concrete table migrations are in Sprint 2 (002_users_and_auth.sql)

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vector similarity search (pgvector)
-- Required for AI coach long-term memory (docs/04-database-schema.md §4.15)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Scheduled jobs (for background tasks)
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─── Utility function: updated_at auto-updater trigger ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Utility function: auto-create user record on auth signup ──────────────
-- This trigger fires after a new entry is created in auth.users
-- and inserts a corresponding record in public.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, onboarding_status)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    'incomplete'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
