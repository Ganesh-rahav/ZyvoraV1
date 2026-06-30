'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'
import { UploadDropzone } from './UploadDropzone'
import { UploadProgress } from './UploadProgress'
import { usePhotoAnalysis } from '@/contexts/photo-analysis-context'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import type { PhotoViewType, PhotoFile } from '@/types/photo-analysis'

interface UploadScreenProps {
  onContinue: () => void
  onBack: () => void
}

const VIEW_ORDER: PhotoViewType[] = ['front', 'side', 'back']
const VIEW_LABELS: Record<PhotoViewType, string> = { front: 'Front', side: 'Side', back: 'Back' }

export function UploadScreen({ onContinue, onBack }: UploadScreenProps) {
  const { state, setPhoto, setActiveView } = usePhotoAnalysis()
  const { data } = state
  // Per-view upload state tracked locally so tabs are independent
  const [perViewStatus, setPerViewStatus] = useState<Partial<Record<PhotoViewType, { progress: number; label: string; complete: boolean }>>>({})
  const { upload } = usePhotoUpload()

  const handleFileSelected = useCallback(async (viewType: PhotoViewType, file: File) => {
    if (!file.name) return   // guard against empty File from Replace button

    setPerViewStatus((prev) => ({ ...prev, [viewType]: { progress: 0, label: 'Preparing...', complete: false } }))

    const result = await upload(file, viewType, (event) => {
      setPerViewStatus((prev) => ({
        ...prev,
        [viewType]: { progress: event.progress, label: event.label, complete: event.status === 'complete' },
      }))
    })

    if (result) {
      const objectUrl = URL.createObjectURL(file)
      const photo: PhotoFile = {
        viewType,
        objectUrl,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024),
        uploadResult: result,
      }
      setPhoto(viewType, photo)
    }
  }, [upload, setPhoto])

  const uploadedCount = Object.keys(data.photos).length
  const canContinue = uploadedCount >= 1  // At least 1 photo required; all 3 ideal

  return (
    <div>
      {/* Header */}
      <motion.div
        variants={staggerParent(0.07)}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <motion.h2 variants={fadeUp} className="font-display text-2xl font-bold text-white">
          Upload your physique photos.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-[#64748B]">
          Upload 1–3 photos: front, side, and back. More angles = higher AI accuracy.
        </motion.p>
      </motion.div>

      {/* View tabs */}
      <div className="mb-4 flex gap-1" role="tablist" aria-label="Photo views">
        {VIEW_ORDER.map((view) => {
          const hasPhoto = Boolean(data.photos[view])
          const isActive = data.activeView === view
          return (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`upload-panel-${view}`}
              onClick={() => setActiveView(view)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#60A5FA]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {hasPhoto && <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />}
              {VIEW_LABELS[view]}
            </button>
          )
        })}
      </div>

      {/* Upload panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={data.activeView}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          id={`upload-panel-${data.activeView}`}
          role="tabpanel"
        >
          {data.photos[data.activeView] ? (
            // Photo already uploaded — thumbnail + replace
            <div className="w-full">
              <div className="relative overflow-hidden rounded-xl border border-[#1E293B] bg-[#1E293B]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.photos[data.activeView]!.objectUrl}
                  alt={`${VIEW_LABELS[data.activeView]} view photo`}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#10B981]/20 px-2 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                    <span className="text-xs font-semibold text-[#10B981]">Uploaded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileSelected(data.activeView, new File([], ''))}
                    className="flex items-center gap-1 rounded-full border border-[#334155] bg-[#0F172A]/80 px-2 py-1 text-xs text-[#94A3B8] hover:text-white"
                    aria-label={`Replace ${VIEW_LABELS[data.activeView]} photo`}
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" /> Replace
                  </button>
                </div>
              </div>
            </div>
          ) : perViewStatus[data.activeView] ? (
            <div className="py-4">
              <UploadProgress
                progress={perViewStatus[data.activeView]!.progress}
                fileName={perViewStatus[data.activeView]!.label || `${VIEW_LABELS[data.activeView]}_view_photo`}
                isComplete={perViewStatus[data.activeView]!.complete}
              />
            </div>
          ) : (
            <UploadDropzone
              viewType={data.activeView}
              onFileSelected={(file) => handleFileSelected(data.activeView, file)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress summary */}
      <div className="mt-4 flex items-center gap-2">
        {VIEW_ORDER.map((view) => (
          <div
            key={view}
            className={`flex-1 rounded-full h-1 transition-colors ${
              data.photos[view] ? 'bg-[#10B981]' : 'bg-[#1E293B]'
            }`}
            aria-label={`${VIEW_LABELS[view]}: ${data.photos[view] ? 'uploaded' : 'pending'}`}
          />
        ))}
        <span className="ml-1 text-xs text-[#475569]">{uploadedCount}/3</span>
      </div>

      {uploadedCount < 3 && (
        <p className="mt-1.5 text-xs text-[#475569]">
          {uploadedCount === 0
            ? 'Upload at least one photo to continue.'
            : `${3 - uploadedCount} more angle${3 - uploadedCount > 1 ? 's' : ''} will improve accuracy. You can add them later.`}
        </p>
      )}

      {/* Nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex items-center justify-between gap-4"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-[#1E293B] px-4 text-sm font-medium text-[#64748B] transition-colors hover:border-[#334155] hover:text-white"
        >
          Back
        </button>
        <motion.button
          type="button"
          id="upload-continue"
          onClick={onContinue}
          disabled={!canContinue}
          whileHover={canContinue ? { scale: 1.02 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          className={`flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all ${
            canContinue
              ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.35)]'
              : 'cursor-not-allowed bg-[#1E293B] text-[#475569]'
          }`}
        >
          Analyse Photos
        </motion.button>
      </motion.div>
    </div>
  )
}
