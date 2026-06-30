/**
 * lib/ai/config.ts
 *
 * Centralised AI infrastructure configuration.
 * All tuneable values live here — never hardcoded in components or services.
 *
 * Provider selection is driven by the NEXT_PUBLIC_VISION_PROVIDER env var.
 * Feature flags are driven by NEXT_PUBLIC_FEATURE_* env vars.
 */

import type { StorageProvider } from './types/storage'

// ─── Vision Provider Selection ────────────────────────────────────────────────

export type VisionProviderName = 'mock' | 'openai' | 'gemini' | 'anthropic'

export const AI_CONFIG = {
  vision: {
    /**
     * Active provider — set NEXT_PUBLIC_VISION_PROVIDER in .env.local
     * Defaults to 'mock' so the app works without any API keys.
     */
    provider: (process.env.NEXT_PUBLIC_VISION_PROVIDER ?? 'mock') as VisionProviderName,

    /** Timeout for vision API calls in milliseconds */
    timeoutMs: 30_000,

    /** Maximum retry attempts on transient errors */
    maxRetries: 2,

    /** Minimum acceptable quality score (0–100) to auto-proceed */
    minimumQualityScore: 60,
  },

  storage: {
    /**
     * Active storage provider — set NEXT_PUBLIC_STORAGE_PROVIDER in .env.local
     * Defaults to 'mock' (stores blob: URLs in memory, no persistence).
     */
    provider: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER ?? 'mock') as StorageProvider,

    bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'physique-photos',

    /** Signed URL time-to-live in seconds (1 hour) */
    signedUrlTtlSeconds: 3_600,
  },

  upload: {
    /** 10 MB */
    maxFileSizeBytes: 10 * 1024 * 1024,

    /** 5 KB — below this the file is likely corrupt */
    minFileSizeBytes: 5 * 1024,

    /** JPEG quality 0–1 after compression */
    compressionQuality: 0.85,

    /** Maximum pixel dimension (width or height) after compression */
    maxDimensionPx: 2_048,

    /** Minimum pixel dimension to accept */
    minDimensionPx: 400,

    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ] as const,
  },

  /** Feature flags — all default to false in production until explicitly enabled */
  features: {
    /** Enable real vision provider calls (requires API key) */
    realVisionAnalysis: process.env.NEXT_PUBLIC_FEATURE_REAL_VISION === 'true',

    /** Enable Supabase Storage upload (requires Supabase credentials) */
    realStorage: process.env.NEXT_PUBLIC_FEATURE_REAL_STORAGE === 'true',

    /** Enable face-blur canvas tool (Sprint 3B PRD PHY-003) */
    faceBlur: process.env.NEXT_PUBLIC_FEATURE_FACE_BLUR === 'true',

    /** Enable audit event emission to backend */
    auditLogging: process.env.NEXT_PUBLIC_FEATURE_AUDIT_LOGGING === 'true',
  },
} as const

export type AiConfig = typeof AI_CONFIG
