'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'

const PREPARATION_STEPS = [
  { text: 'Analyzing your goals...', duration: 800 },
  { text: 'Understanding your lifestyle...', duration: 900 },
  { text: 'Mapping your training environment...', duration: 700 },
  { text: 'Calibrating your experience level...', duration: 800 },
  { text: 'Preparing personalized coaching...', duration: 1000 },
  { text: 'Generating your athlete profile...', duration: 900 },
  { text: 'Configuring your coaching style...', duration: 700 },
  { text: 'Your AI coach is ready.', duration: 1500 },
]

export function PreparationStep() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [activeIdx, setActiveIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveIdx(PREPARATION_STEPS.length - 1)
      const t = setTimeout(() => { setDone(true); router.push('/dashboard') }, 1200)
      return () => clearTimeout(t)
    }

    let current = 0
    let cancelled = false

    const run = async () => {
      for (const step of PREPARATION_STEPS) {
        if (cancelled) return
        setActiveIdx(current)
        await new Promise((r) => setTimeout(r, step.duration))
        current++
      }
      if (!cancelled) {
        setDone(true)
        setTimeout(() => router.push('/dashboard'), 600)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [router, shouldReduceMotion])

  const progress = ((activeIdx + 1) / PREPARATION_STEPS.length) * 100

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Animated AI orb */}
      <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#3B82F6]/25 blur-2xl" />

        {/* Outer spin ring */}
        {!shouldReduceMotion && (
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
        )}

        {/* Inner pulse */}
        <motion.div
          className="absolute inset-3 rounded-full border border-[#10B981]/30"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Core icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#1E293B]">
          <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
            <path d="M8 22L16 10L24 22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="10" r="2" fill="#60A5FA" />
            <circle cx="8"  cy="22" r="2" fill="#3B82F6" />
            <circle cx="24" cy="22" r="2" fill="#3B82F6" />
          </svg>
        </div>
      </div>

      {/* Step text */}
      <div className="mb-8 h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`text-lg font-semibold ${
              done ? 'text-[#10B981]' : 'text-white'
            }`}
          >
            {PREPARATION_STEPS[activeIdx]?.text ?? 'Your AI coach is ready.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-64">
        <div className="h-1 overflow-hidden rounded-full bg-[#1E293B]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-[#334155]">{Math.round(progress)}%</p>
      </div>

      {/* Past steps */}
      <div className="mt-8 flex flex-col gap-1.5">
        {PREPARATION_STEPS.slice(0, activeIdx).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs text-[#475569]"
          >
            <span className="text-[#10B981]">✓</span>
            {s.text}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
