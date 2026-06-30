'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'
import { ReadinessScore } from './ReadinessScore'
import { ValidationChecklist } from './ValidationChecklist'
import { usePhotoAnalysis } from '@/contexts/photo-analysis-context'
import { mockValidatePhoto } from '@/types/photo-analysis'
import type { PhotoViewType, ValidationResult } from '@/types/photo-analysis'

interface ValidationScreenProps {
  onContinue: () => void
  onBack: () => void
  onRetake: () => void
}

const VIEW_LABELS: Record<PhotoViewType, string> = { front: 'Front', side: 'Side', back: 'Back' }

export function ValidationScreen({ onContinue, onBack, onRetake }: ValidationScreenProps) {
  const { state, setPhoto } = usePhotoAnalysis()
  const { data } = state

  const uploadedViews = Object.keys(data.photos) as PhotoViewType[]
  const [activeView, setActiveView] = useState<PhotoViewType>(uploadedViews[0] ?? 'front')
  const [results, setResults] = useState<Partial<Record<PhotoViewType, ValidationResult>>>({})
  const [isValidating, setIsValidating] = useState(true)

  // Run mock validation for all uploaded photos on mount
  useEffect(() => {
    const run = async () => {
      setIsValidating(true)
      const newResults: Partial<Record<PhotoViewType, ValidationResult>> = {}
      for (const view of uploadedViews) {
        const photo = data.photos[view]
        if (photo) {
          await new Promise((r) => setTimeout(r, 600))   // Simulate async quality check
          const result = mockValidatePhoto(photo.objectUrl)
          newResults[view] = result
          // Store result back onto photo object
          setPhoto(view, { ...photo, validation: result })
        }
      }
      setResults(newResults)
      setIsValidating(false)
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeResult = results[activeView]
  const hasAnyGoodResult = Object.values(results).some((r) => r && r.score >= 60)

  return (
    <div>
      {/* Header */}
      <motion.div
        variants={staggerParent(0.07)}
        initial="hidden"
        animate="visible"
        className="mb-6 text-center"
      >
        <motion.h2 variants={fadeUp} className="font-display text-2xl font-bold text-white">
          AI Quality Validation
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-1 text-sm text-[#64748B]">
          Your photos are being checked for optimal AI analysis quality.
        </motion.p>
      </motion.div>

      {/* View selector */}
      {uploadedViews.length > 1 && (
        <div className="mb-6 flex gap-1" role="tablist">
          {uploadedViews.map((view) => (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={activeView === view}
              onClick={() => setActiveView(view)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                activeView === view
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#60A5FA]'
                  : 'border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {VIEW_LABELS[view]}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isValidating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-12"
          >
            {/* Scanning animation */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ border: '2px solid transparent', borderTopColor: '#3B82F6' }}
              />
              <span className="text-2xl" role="img" aria-label="Analysing">🔍</span>
            </div>
            <p className="text-sm font-medium text-white">Analysing photo quality...</p>
            <p className="text-xs text-[#475569]">Checking lighting, resolution, visibility & angles</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            {activeResult && (
              <>
                <ReadinessScore result={activeResult} />
                <ValidationChecklist checks={activeResult.checks} />
                {activeResult.improvementTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/8 p-3"
                  >
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
                    <p className="text-xs leading-relaxed text-[#94A3B8]">
                      <span className="font-semibold text-[#F59E0B]">Tip: </span>
                      {activeResult.improvementTip}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      {!isValidating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-between gap-4"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 items-center px-4 text-sm font-medium text-[#64748B] transition-colors hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#334155] px-4 text-sm font-medium text-[#94A3B8] hover:border-[#475569] hover:text-white"
            >
              Retake Photos
            </button>
          </div>
          <motion.button
            type="button"
            id="validation-continue"
            onClick={onContinue}
            disabled={!hasAnyGoodResult}
            whileHover={hasAnyGoodResult ? { scale: 1.02 } : {}}
            whileTap={hasAnyGoodResult ? { scale: 0.97 } : {}}
            className={`flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all ${
              hasAnyGoodResult
                ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.35)]'
                : 'cursor-not-allowed bg-[#1E293B] text-[#475569]'
            }`}
          >
            Review & Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
