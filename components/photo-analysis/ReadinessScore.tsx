'use client'

import { motion } from 'framer-motion'
import type { ValidationResult } from '@/types/photo-analysis'

interface ReadinessScoreProps {
  result: ValidationResult
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#3B82F6'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export function ReadinessScore({ result }: ReadinessScoreProps) {
  const color = getScoreColor(result.score)
  const circumference = 2 * Math.PI * 44  // r=44

  return (
    <div className="flex flex-col items-center">
      {/* Circular score */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: `${color}20` }}
        />
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          {/* Track */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#1E293B"
            strokeWidth="8"
          />
          {/* Progress */}
          <motion.circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (result.score / 100) * circumference }}
            transition={{ duration: 1.2, ease: [0, 0, 0.2, 1], delay: 0.2 }}
          />
        </svg>

        {/* Score text */}
        <div className="relative text-center">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl font-bold"
            style={{ color }}
          >
            {result.score}
          </motion.p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#475569]">AI Ready</p>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-sm font-semibold" style={{ color }}>
          {result.score >= 90 ? 'Excellent quality' : result.score >= 75 ? 'Good quality' : result.score >= 60 ? 'Acceptable — could be better' : 'Photo needs improvement'}
        </p>
        {result.improvementTip && (
          <p className="mt-1 text-xs text-[#64748B]">{result.improvementTip}</p>
        )}
      </motion.div>
    </div>
  )
}
