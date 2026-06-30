'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePhotoAnalysis } from '@/contexts/photo-analysis-context'

const STAGES = [
  { text: 'Preparing secure upload...', duration: 800 },
  { text: 'Validating image integrity...', duration: 900 },
  { text: 'Generating analysis request...', duration: 700 },
  { text: 'Packaging physique data...', duration: 800 },
  { text: 'Encrypting before transmission...', duration: 900 },
  { text: 'Ready for AI analysis.', duration: 1400 },
]

interface PreparationScreenProps {
  onDone: () => void
}

export function PreparationScreen({ onDone }: PreparationScreenProps) {
  const { setDone } = usePhotoAnalysis()
  const shouldReduceMotion = useReducedMotion()
  const [activeIdx, setActiveIdx] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveIdx(STAGES.length - 1)
      const t = setTimeout(() => {
        setComplete(true)
        setDone()
        onDone()
      }, 800)
      return () => clearTimeout(t)
    }

    let cancelled = false
    let idx = 0

    const run = async () => {
      for (const stage of STAGES) {
        if (cancelled) return
        setActiveIdx(idx)
        await new Promise((r) => setTimeout(r, stage.duration))
        idx++
      }
      if (!cancelled) {
        setComplete(true)
        setDone()
        onDone()
      }
    }

    void run()
    return () => { cancelled = true }
  }, [shouldReduceMotion, setDone, onDone])

  const progress = ((activeIdx + 1) / STAGES.length) * 100

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* AI orb */}
      <div className="relative mb-10 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 blur-3xl" />

        {!shouldReduceMotion && (
          <>
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                border: '2px solid transparent',
                borderTopColor: '#3B82F6',
                borderRightColor: 'rgba(59,130,246,0.3)',
              }}
            />
            {/* Mid ring counter-clockwise */}
            <motion.div
              className="absolute inset-4 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{
                border: '1.5px solid transparent',
                borderTopColor: '#10B981',
                borderLeftColor: 'rgba(16,185,129,0.3)',
              }}
            />
          </>
        )}

        {/* Inner pulse */}
        <motion.div
          className="absolute inset-7 rounded-full border border-[#3B82F6]/20"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.07, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Core */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#1E293B]">
          <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
            <path d="M8 22L16 10L24 22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="10" r="2" fill="#60A5FA" />
            <circle cx="8"  cy="22" r="2" fill="#3B82F6" />
            <circle cx="24" cy="22" r="2" fill="#3B82F6" />
          </svg>
        </div>
      </div>

      {/* Stage text */}
      <div className="mb-8 h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`text-lg font-semibold ${complete ? 'text-[#10B981]' : 'text-white'}`}
          >
            {STAGES[activeIdx]?.text ?? 'Ready for AI analysis.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-72">
        <div className="h-1 overflow-hidden rounded-full bg-[#1E293B]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          />
        </div>
        <p className="mt-1.5 font-mono text-xs text-[#334155]">{Math.round(progress)}%</p>
      </div>

      {/* Completed stages */}
      <div className="mt-8 flex flex-col gap-1.5" role="log" aria-live="polite">
        {STAGES.slice(0, activeIdx).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs text-[#475569]"
          >
            <span className="text-[#10B981]" aria-hidden="true">✓</span>
            {s.text}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
