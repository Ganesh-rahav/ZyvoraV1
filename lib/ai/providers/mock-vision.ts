/**
 * lib/ai/providers/mock-vision.ts
 *
 * Realistic mock vision provider.
 * Returns structured PhysiqueAnalysis JSON with randomised but plausible values.
 * The rest of the application behaves exactly as if a real AI responded.
 *
 * Used when NEXT_PUBLIC_VISION_PROVIDER=mock (the default).
 */

import type {
  IVisionProvider,
  VisionAnalysisInput,
  PhysiqueAnalysis,
  ImageQualityMetrics,
  VisionHealthStatus,
  BodyLandmark,
  MuscleGroup,
} from '../types/vision'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function mockLandmarks(viewType: 'front' | 'side' | 'back'): BodyLandmark[] {
  const base: BodyLandmark[] = [
    { id: 'head_top',      label: 'Head Top',       x: 0.50, y: 0.04, confidence: rand(0.90, 0.99) },
    { id: 'chin',          label: 'Chin',            x: 0.50, y: 0.12, confidence: rand(0.88, 0.98) },
    { id: 'left_shoulder', label: 'Left Shoulder',   x: 0.35, y: 0.22, confidence: rand(0.85, 0.97) },
    { id: 'right_shoulder',label: 'Right Shoulder',  x: 0.65, y: 0.22, confidence: rand(0.85, 0.97) },
    { id: 'left_hip',      label: 'Left Hip',        x: 0.40, y: 0.52, confidence: rand(0.82, 0.95) },
    { id: 'right_hip',     label: 'Right Hip',       x: 0.60, y: 0.52, confidence: rand(0.82, 0.95) },
    { id: 'left_knee',     label: 'Left Knee',       x: 0.42, y: 0.72, confidence: rand(0.78, 0.94) },
    { id: 'right_knee',    label: 'Right Knee',      x: 0.58, y: 0.72, confidence: rand(0.78, 0.94) },
    { id: 'left_ankle',    label: 'Left Ankle',      x: 0.43, y: 0.93, confidence: rand(0.75, 0.92) },
    { id: 'right_ankle',   label: 'Right Ankle',     x: 0.57, y: 0.93, confidence: rand(0.75, 0.92) },
  ]

  // For side view, collapse left/right to single midline point
  if (viewType === 'side') {
    return base.map((lm) => ({ ...lm, x: 0.5, confidence: lm.confidence - 0.05 }))
  }
  return base
}

function mockMuscleGroups(): MuscleGroup[] {
  return [
    { id: 'chest',      label: 'Chest',           developmentScore: rand(4, 9, 1), confidence: rand(0.75, 0.95) },
    { id: 'shoulders',  label: 'Shoulders',        developmentScore: rand(4, 9, 1), confidence: rand(0.75, 0.95) },
    { id: 'biceps',     label: 'Biceps',           developmentScore: rand(3, 8, 1), confidence: rand(0.70, 0.92) },
    { id: 'triceps',    label: 'Triceps',          developmentScore: rand(3, 8, 1), confidence: rand(0.70, 0.92) },
    { id: 'forearms',   label: 'Forearms',         developmentScore: rand(3, 7, 1), confidence: rand(0.65, 0.90) },
    { id: 'abs',        label: 'Abdominals',       developmentScore: rand(3, 9, 1), confidence: rand(0.72, 0.93) },
    { id: 'obliques',   label: 'Obliques',         developmentScore: rand(3, 8, 1), confidence: rand(0.68, 0.90) },
    { id: 'quads',      label: 'Quadriceps',       developmentScore: rand(4, 9, 1), confidence: rand(0.75, 0.95) },
    { id: 'hamstrings', label: 'Hamstrings',       developmentScore: rand(3, 8, 1), confidence: rand(0.70, 0.92) },
    { id: 'calves',     label: 'Calves',           developmentScore: rand(3, 8, 1), confidence: rand(0.72, 0.93) },
  ]
}

function mockQuality(): ImageQualityMetrics {
  const base = rand(78, 97, 0)
  return {
    overallScore:     base,
    lightingScore:    rand(70, 100, 0),
    sharpnessScore:   rand(75, 100, 0),
    resolutionScore:  rand(80, 100, 0),
    backgroundScore:  rand(60, 100, 0),
    poseScore:        rand(70, 100, 0),
    warnings:         base < 85 ? ['Consider improving background contrast'] : [],
  }
}

// ─── Provider implementation ─────────────────────────────────────────────────

export class MockVisionProvider implements IVisionProvider {
  readonly name = 'mock'
  readonly version = '1.0.0-mock'

  async analyze(input: VisionAnalysisInput): Promise<PhysiqueAnalysis> {
    // Simulate realistic network latency
    await new Promise((r) => setTimeout(r, rand(800, 2200, 0)))

    const quality = mockQuality()
    const bodyFatMin = rand(8, 25, 1)

    return {
      analysedAt:   new Date().toISOString(),
      viewType:     input.viewType,
      provider:     this.name,
      modelVersion: this.version,
      imageQuality: quality,
      landmarks:    mockLandmarks(input.viewType),
      muscleGroups: mockMuscleGroups(),
      posture: {
        primaryPattern: 'neutral',
        labels: ['neutral_spine', 'balanced_hips'],
        confidence: rand(0.72, 0.94),
        notes: 'Posture appears balanced. No significant deviations detected.',
      },
      symmetry: {
        score: rand(0.78, 0.98),
        leftDominant: Math.random() > 0.5,
        flaggedAreas: quality.overallScore < 85 ? ['minor_shoulder_asymmetry'] : [],
      },
      bodyComposition: {
        bodyFatMin,
        bodyFatMax: bodyFatMin + rand(3, 6, 1),
        confidence: rand(0.55, 0.80),
        category: bodyFatMin < 15 ? 'lean' : bodyFatMin < 22 ? 'average' : 'above_average',
        disclaimer:
          'Body fat estimates from photos are approximations only. ' +
          'For medical-grade measurements, consult a healthcare professional.',
      },
      safetyWarnings: [],
      processingMs: rand(800, 2200, 0),
    }
  }

  async validate(imageBase64: string, _mimeType: string): Promise<ImageQualityMetrics> {
    await new Promise((r) => setTimeout(r, rand(200, 600, 0)))
    void imageBase64  // unused in mock
    return mockQuality()
  }

  async health(): Promise<VisionHealthStatus> {
    return { available: true, latencyMs: rand(10, 50, 0) }
  }
}
