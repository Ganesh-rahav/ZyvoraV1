'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ImageOff, ArrowRight } from 'lucide-react'
import { fadeIn, scaleIn } from '@/lib/motion'

interface SkipDialogProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
}

export function SkipDialog({ isOpen, onClose, onSkip }: SkipDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skip-dialog-title"
            aria-describedby="skip-dialog-body"
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-[#1E293B] bg-[#1E293B]/95 p-6 shadow-[0_0_80px_0_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-[#475569] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#334155] bg-[#0F172A]">
              <ImageOff className="h-5 w-5 text-[#64748B]" aria-hidden="true" />
            </div>

            {/* Content */}
            <h2
              id="skip-dialog-title"
              className="font-display text-xl font-bold text-white"
            >
              Continue without photos?
            </h2>
            <p
              id="skip-dialog-body"
              className="mt-3 text-sm leading-relaxed text-[#94A3B8]"
            >
              You can continue without uploading photos. Your AI coach will still build
              you a personalised workout and nutrition plan — photos just help unlock
              visual coaching and body composition tracking.
            </p>

            {/* What you keep / what you miss */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/8 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#10B981]">
                  You still get
                </p>
                {['Personalised workouts', 'Nutrition coaching', 'Progress tracking', 'AI guidance'].map((item) => (
                  <p key={item} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <span className="text-[#10B981]">✓</span> {item}
                  </p>
                ))}
              </div>
              <div className="rounded-xl border border-[#334155] bg-[#1E293B]/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
                  Unlocked with photos
                </p>
                {['Visual coaching', 'Body composition', 'Progress photos', 'Form analysis'].map((item) => (
                  <p key={item} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <span className="text-[#334155]">○</span> {item}
                  </p>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-[#475569]">
              You can add photos at any time from your dashboard. No pressure — ever.
            </p>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 items-center justify-center rounded-lg border border-[#334155] px-4 text-sm font-medium text-[#94A3B8] hover:border-[#475569] hover:text-white"
              >
                Go back
              </button>
              <motion.button
                type="button"
                id="skip-confirm"
                onClick={onSkip}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E293B] px-4 text-sm font-semibold text-white ring-1 ring-[#334155] hover:ring-[#475569]"
              >
                Continue without photos
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
