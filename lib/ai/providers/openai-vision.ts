/**
 * lib/ai/providers/openai-vision.ts
 *
 * OpenAI GPT-4o Vision provider stub.
 * TODO(sprint-4b): Implement when OPENAI_API_KEY is available.
 */

import type {
  IVisionProvider,
  VisionAnalysisInput,
  PhysiqueAnalysis,
  ImageQualityMetrics,
  VisionHealthStatus,
} from '../types/vision'
import { VisionProviderError } from '../errors'

export class OpenAIVisionProvider implements IVisionProvider {
  readonly name = 'openai'
  readonly version = 'gpt-4o'

  // TODO(sprint-4b): inject OpenAI client
  // constructor(private readonly apiKey: string) {}

  async analyze(_input: VisionAnalysisInput): Promise<PhysiqueAnalysis> {
    // TODO(sprint-4b): Implement
    // 1. Convert imageBase64 to the format GPT-4o Vision expects
    // 2. POST to https://api.openai.com/v1/chat/completions with vision payload
    // 3. Parse structured JSON from the assistant response
    // 4. Map to PhysiqueAnalysis type
    throw new VisionProviderError(this.name, 'OpenAI Vision provider is not yet configured.', 'NOT_CONFIGURED', false)
  }

  async validate(_imageBase64: string, _mimeType: string): Promise<ImageQualityMetrics> {
    throw new VisionProviderError(this.name, 'OpenAI Vision provider is not yet configured.', 'NOT_CONFIGURED', false)
  }

  async health(): Promise<VisionHealthStatus> {
    // TODO(sprint-4b): Ping https://api.openai.com/v1/models
    return { available: false, error: 'Provider not configured.' }
  }
}
