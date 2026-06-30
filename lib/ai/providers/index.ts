/**
 * lib/ai/providers/index.ts
 *
 * Vision provider factory + barrel export.
 * Provider is selected from AI_CONFIG.vision.provider.
 */

import type { IVisionProvider } from '../types/vision'
import { AI_CONFIG } from '../config'
import { MockVisionProvider }   from './mock-vision'
import { OpenAIVisionProvider } from './openai-vision'

export type { IVisionProvider }   from '../types/vision'
export { MockVisionProvider }     from './mock-vision'
export { OpenAIVisionProvider }   from './openai-vision'

let _instance: IVisionProvider | null = null

/**
 * Returns a singleton vision provider instance.
 * Switching providers requires only changing NEXT_PUBLIC_VISION_PROVIDER — no code changes.
 */
export function getVisionProvider(): IVisionProvider {
  if (_instance) return _instance

  switch (AI_CONFIG.vision.provider) {
    case 'openai':
      _instance = new OpenAIVisionProvider()
      break
    case 'mock':
    default:
      _instance = new MockVisionProvider()
  }

  return _instance
}

/** Reset the singleton (used in tests) */
export function resetVisionProvider(): void {
  _instance = null
}
