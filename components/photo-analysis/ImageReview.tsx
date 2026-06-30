'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Upload, ArrowRight, CheckCircle2 } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'
import { usePhotoAnalysis } from '@/contexts/photo-analysis-context'
import type { PhotoViewType } from '@/types/photo-analysis'

interface ImageReviewProps {
  onContinue: () => void
  onRetake: () => void
  onReplace: () => void
}

const VIEW_LABELS: Record<PhotoViewType, string> = { front: 'Front', side: 'Side', back: 'Back' }
const VIEW_ORDER: PhotoViewType[] = ['front', 'side', 'back']

export function ImageReview({ onContinue, onRetake, onReplace }: ImageReviewProps) {
  const { state } = usePhotoAnalysis()
  const { data } = state

  const uploadedPhotos = VIEW_ORDER.filter((v) => data.photos[v])

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
          Review your photos.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-[#64748B]">
          You&apos;re in full control. Retake, replace, or continue to analysis.
        </motion.p>
      </motion.div>

      {/* Photo grid */}
      <motion.div
        className={`grid gap-3 ${uploadedPhotos.length === 1 ? 'grid-cols-1' : uploadedPhotos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
        variants={staggerParent(0.1)}
        initial="hidden"
        animate="visible"
      >
        {uploadedPhotos.map((view) => {
          const photo = data.photos[view]!
          const score = photo.validation?.score
          return (
            <motion.div key={view} variants={fadeUp} className="relative">
              <div className="overflow-hidden rounded-xl border border-[#1E293B] bg-[#1E293B]/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.objectUrl}
                  alt={`${VIEW_LABELS[view]} view`}
                  className="aspect-[3/4] w-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#0F172A]/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {VIEW_LABELS[view]}
                    </span>
                    {score !== undefined && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: score >= 90 ? '#10B98130' : score >= 75 ? '#3B82F630' : '#F59E0B30',
                          color: score >= 90 ? '#10B981' : score >= 75 ? '#60A5FA' : '#F59E0B',
                        }}
                      >
                        {score}%
                      </span>
                    )}
                  </div>
                  {photo.validation && (
                    <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${score}%`,
                          background: score && score >= 90 ? '#10B981' : score && score >= 75 ? '#3B82F6' : '#F59E0B',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Empty placeholders for missing views */}
        {uploadedPhotos.length < 3 && VIEW_ORDER.filter((v) => !data.photos[v]).slice(0, Math.min(1, 3 - uploadedPhotos.length)).map((view) => (
          <motion.div
            key={`missing-${view}`}
            variants={fadeUp}
            className="aspect-[3/4] rounded-xl border border-dashed border-[#334155] bg-[#1E293B]/20 flex flex-col items-center justify-center gap-1 text-center p-2"
          >
            <Upload className="h-4 w-4 text-[#475569]" aria-hidden="true" />
            <p className="text-[10px] text-[#475569]">{VIEW_LABELS[view]}</p>
            <p className="text-[9px] text-[#334155]">Optional</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quality summary */}
      {uploadedPhotos.some((v) => data.photos[v]?.validation) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-2 rounded-xl border border-[#10B981]/20 bg-[#10B981]/8 p-3"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" aria-hidden="true" />
          <p className="text-xs text-[#94A3B8]">
            Your photos passed AI quality validation and are ready for analysis.
          </p>
        </motion.div>
      )}

      {/* Nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-center justify-between gap-3"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRetake}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-[#334155] px-3 text-sm font-medium text-[#94A3B8] hover:border-[#475569] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retake
          </button>
          <button
            type="button"
            onClick={onReplace}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-[#334155] px-3 text-sm font-medium text-[#94A3B8] hover:border-[#475569] hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Replace
          </button>
        </div>
        <motion.button
          type="button"
          id="review-continue"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.35)]"
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </motion.div>
    </div>
  )
}
