'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface StepQuestionProps {
  question: string
  helper?: string   // "Why we ask this" explanation
  subtitle?: string // Optional second line under the question
}

export function StepQuestion({ question, helper, subtitle }: StepQuestionProps) {
  const [helperOpen, setHelperOpen] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-2xl">
            {question}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
          )}
        </div>

        {helper && (
          <button
            type="button"
            onClick={() => setHelperOpen((p) => !p)}
            aria-expanded={helperOpen}
            aria-label="Why we ask this"
            className="mt-1 shrink-0 rounded-full p-1 text-[#475569] transition-colors hover:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Why we ask — expandable */}
      {helper && helperOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 overflow-hidden"
        >
          <div className="rounded-lg border border-[#10B981]/20 bg-[#064E3B]/30 px-4 py-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-[#6EE7B7]">
              <span className="mt-0.5 font-semibold text-[#10B981]">Why we ask:</span>
              {helper}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
