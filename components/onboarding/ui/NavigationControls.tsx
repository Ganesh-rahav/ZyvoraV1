'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface NavigationControlsProps {
  onBack?: () => void
  onNext: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  canProceed: boolean
  nextLabel?: string
  isLoading?: boolean
}

export function NavigationControls({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  canProceed,
  nextLabel,
  isLoading = false,
}: NavigationControlsProps) {
  const label = nextLabel ?? (isLastStep ? 'Complete Profile' : 'Continue')

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Back button */}
      {!isFirstStep ? (
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-11 items-center gap-2 rounded-lg border border-[#1E293B] px-5 text-sm font-medium text-[#64748B] transition-colors duration-150 hover:border-[#334155] hover:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </motion.button>
      ) : (
        <div /> // spacer to keep Continue right-aligned
      )}

      {/* Continue / Submit button */}
      <motion.button
        type="button"
        id="onboarding-continue"
        onClick={onNext}
        disabled={!canProceed || isLoading}
        whileHover={canProceed && !isLoading ? { scale: 1.02 } : {}}
        whileTap={canProceed && !isLoading ? { scale: 0.97 } : {}}
        className={`flex h-11 items-center gap-2 rounded-lg px-7 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${
          canProceed && !isLoading
            ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.4)]'
            : 'cursor-not-allowed bg-[#1E293B] text-[#475569]'
        }`}
        aria-disabled={!canProceed || isLoading}
      >
        {isLoading ? (
          <>
            <motion.span
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span>Preparing...</span>
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </motion.button>
    </div>
  )
}
