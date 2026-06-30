'use client'

import { motion } from 'framer-motion'

interface ProgressHeaderProps {
  currentStep: number   // 0-based visible step index (excluding welcome)
  totalSteps: number    // total visible steps (excluding welcome & preparation)
  progressLabel: string
}

export function ProgressHeader({ currentStep, totalSteps, progressLabel }: ProgressHeaderProps) {
  const pct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      {/* Top row: label + step count */}
      <div className="mb-3 flex items-center justify-between">
        <motion.p
          key={progressLabel}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xs font-medium text-[#64748B]"
          aria-live="polite"
        >
          {progressLabel}
        </motion.p>
        <span className="font-mono text-xs text-[#475569]">
          {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-[3px] w-full overflow-hidden rounded-full bg-[#1E293B]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Onboarding progress: ${pct}%`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}
