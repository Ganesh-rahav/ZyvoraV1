/**
 * lib/ai/services/index.ts — barrel export
 */
export { uploadPhoto }         from './upload-service'
export type { UploadServiceInput } from './upload-service'

export { analysePhoto, validatePhotoQuality } from './analysis-service'
export type { AnalysisServiceInput }          from './analysis-service'
