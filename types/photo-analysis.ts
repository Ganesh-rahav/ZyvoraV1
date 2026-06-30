// ─── Photo Analysis Types ──────────────────────────────────────────────────────
// Sprint 4A: extended with production upload and analysis result types.

import type { UploadResult } from '@/lib/ai/types/upload'
import type { PhysiqueAnalysis, ImageQualityMetrics } from '@/lib/ai/types/vision'

// Re-export for convenience
export type { UploadResult } from '@/lib/ai/types/upload'
export type { PhysiqueAnalysis, ImageQualityMetrics } from '@/lib/ai/types/vision'

export type PhotoViewType = 'front' | 'side' | 'back'

export type ValidationStatus = 'pass' | 'warn' | 'fail'

export interface ReadinessCheck {
  id: string
  label: string
  status: ValidationStatus
  detail?: string
}

export interface ValidationResult {
  score: number                  // 0–100
  checks: ReadinessCheck[]
  overallStatus: ValidationStatus
  improvementTip?: string
}

export interface PhotoFile {
  viewType: PhotoViewType
  /** blob: URL for display — created by URL.createObjectURL */
  objectUrl: string
  fileName: string
  fileSizeKb: number
  /** Populated after client-side image validation (Sprint 3B) */
  validation?: ValidationResult
  /** Populated after production upload pipeline completes (Sprint 4A) */
  uploadResult?: UploadResult
  /** Populated after vision analysis completes (Sprint 4A) */
  analysis?: PhysiqueAnalysis
  /** Populated after quality validation via vision provider (Sprint 4A) */
  qualityMetrics?: ImageQualityMetrics
}

export type PhotoAnalysisStep =
  | 'welcome'
  | 'privacy'
  | 'guide'
  | 'upload'
  | 'validation'
  | 'review'
  | 'preparation'

export const PHOTO_ANALYSIS_STEPS: PhotoAnalysisStep[] = [
  'welcome',
  'privacy',
  'guide',
  'upload',
  'validation',
  'review',
  'preparation',
]

export interface PhotoAnalysisData {
  photos: Partial<Record<PhotoViewType, PhotoFile>>
  activeView: PhotoViewType
  skipped: boolean
  preparationComplete: boolean
  /** Sprint 4A: keyed by viewType — populated as each photo is analysed */
  analysisResults: Partial<Record<PhotoViewType, PhysiqueAnalysis>>
}

export interface PhotoAnalysisState {
  currentStep: PhotoAnalysisStep
  data: PhotoAnalysisData
  isProcessing: boolean
  isDone: boolean
}

// ─── Mock validation engine ───────────────────────────────────────────────────
// Future: replace with real AI Image Quality Service call.

export function mockValidatePhoto(_objectUrl: string): ValidationResult {
  // Randomise a realistic-looking result for demo purposes.
  // Sprint 4 wires this to a real endpoint.
  const baseScore = Math.floor(Math.random() * 18) + 80  // 80–97
  const bgWarn = Math.random() > 0.6

  const checks: ReadinessCheck[] = [
    { id: 'lighting',    label: 'Lighting',       status: 'pass' },
    { id: 'resolution',  label: 'Resolution',      status: 'pass' },
    { id: 'visibility',  label: 'Full body visible', status: 'pass' },
    { id: 'orientation', label: 'Camera angle',    status: 'pass' },
    { id: 'blur',        label: 'Image sharpness', status: 'pass' },
    { id: 'background',  label: 'Background',      status: bgWarn ? 'warn' : 'pass',
      detail: bgWarn ? 'A plain wall works best' : undefined },
  ]

  return {
    score: bgWarn ? baseScore - 5 : baseScore,
    checks,
    overallStatus: baseScore >= 85 ? 'pass' : 'warn',
    improvementTip: bgWarn
      ? 'Try standing in front of a plain wall for a cleaner background.'
      : undefined,
  }
}
