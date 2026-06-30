/**
 * lib/ai/types/vision.ts
 *
 * Core interfaces for the Zyvora Vision Provider system.
 * Designed for provider-independence — switching from OpenAI to Gemini
 * or any other provider requires only a new IVisionProvider implementation.
 */

// ─── Body Analysis ────────────────────────────────────────────────────────────

export interface BodyLandmark {
  /** Anatomical landmark identifier e.g. 'left_shoulder', 'navel' */
  id: string
  label: string
  /** Relative coordinates (0–1) within the image */
  x: number
  y: number
  /** How confident the model is in this landmark position (0–1) */
  confidence: number
}

export interface MuscleGroup {
  id: string
  label: string
  /** Estimated visibility / development score 1–10 */
  developmentScore: number
  confidence: number
}

export interface PostureAssessment {
  /** e.g. 'neutral', 'anterior_pelvic_tilt', 'forward_head' */
  primaryPattern: string
  labels: string[]
  confidence: number
  notes?: string
}

export interface SymmetryAssessment {
  /** 0 = perfect asymmetry, 1 = perfect symmetry */
  score: number
  leftDominant: boolean
  flaggedAreas: string[]
}

export interface BodyCompositionEstimate {
  /** Estimated body fat percentage range */
  bodyFatMin: number
  bodyFatMax: number
  /** Model confidence in the estimate (0–1) */
  confidence: number
  /** Ponderal-type classification e.g. 'lean', 'average', 'above_average' */
  category: string
  disclaimer: string
}

export interface ImageQualityMetrics {
  /** 0–100 overall quality score */
  overallScore: number
  lightingScore: number
  sharpnessScore: number
  resolutionScore: number
  backgroundScore: number
  poseScore: number
  warnings: string[]
}

// ─── Structured Analysis Result ───────────────────────────────────────────────

export interface PhysiqueAnalysis {
  /** ISO timestamp of when analysis was generated */
  analysedAt: string
  /** Which view was analysed */
  viewType: 'front' | 'side' | 'back'
  /** Which vision provider produced this result */
  provider: string
  /** Provider model version */
  modelVersion: string
  imageQuality: ImageQualityMetrics
  landmarks: BodyLandmark[]
  muscleGroups: MuscleGroup[]
  posture: PostureAssessment
  symmetry: SymmetryAssessment
  bodyComposition: BodyCompositionEstimate
  /** Any safety/content warnings from the provider */
  safetyWarnings: string[]
  /** Processing time in milliseconds */
  processingMs: number
}

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface VisionAnalysisInput {
  /** base64-encoded image data */
  imageBase64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  viewType: 'front' | 'side' | 'back'
  /** User-provided context (height, weight, goal) to improve estimates */
  userContext?: {
    heightCm?: number
    weightKg?: number
    primaryGoal?: string
  }
}

export interface VisionHealthStatus {
  available: boolean
  latencyMs?: number
  error?: string
}

/**
 * IVisionProvider — implemented by every AI vision backend.
 *
 * Implementations:
 *   MockVisionProvider    — realistic fake data, no API calls
 *   OpenAIVisionProvider  — GPT-4o Vision (future)
 *   GeminiVisionProvider  — Gemini 1.5 Pro Vision (future)
 */
export interface IVisionProvider {
  readonly name: string
  readonly version: string

  /**
   * Analyse a physique photo and return a structured PhysiqueAnalysis.
   */
  analyze(input: VisionAnalysisInput): Promise<PhysiqueAnalysis>

  /**
   * Perform a lightweight image quality check without full analysis.
   */
  validate(imageBase64: string, mimeType: string): Promise<ImageQualityMetrics>

  /**
   * Check if the provider backend is reachable and healthy.
   */
  health(): Promise<VisionHealthStatus>
}
