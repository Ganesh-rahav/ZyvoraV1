'use client'

import { motion } from 'framer-motion'
import type { FoundationSection, FoundationStrength } from '@/lib/cee/types/session'

interface FoundationSectionProps {
  foundation: FoundationSection
}

const ICON_MAP: Record<FoundationStrength['icon'], string> = {
  muscle:      '💪',
  recovery:    '🌙',
  consistency: '📈',
  nutrition:   '🥗',
  structure:   '⚖️',
  habit:       '✅',
}

export function FoundationSectionBlock({ foundation }: FoundationSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      aria-labelledby="foundation-heading"
    >
      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#1E293B]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
          Current Foundation
        </span>
        <div className="h-px flex-1 bg-[#1E293B]" />
      </div>

      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A]/60 p-6">
        <h2
          id="foundation-heading"
          className="mb-5 text-base font-semibold text-[#E2E8F0]"
        >
          {foundation.headline}
        </h2>

        {foundation.noStrengthsFound ? (
          <p className="text-[14px] leading-relaxed text-[#64748B]">
            {foundation.honestAcknowledgement}
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Identified strengths">
            {foundation.strengths.map((strength, i) => (
              <motion.li
                key={strength.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-3 rounded-xl border border-[#1E293B]/60 bg-[#10B981]/5 px-4 py-3"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10 text-sm"
                  aria-hidden="true"
                >
                  {ICON_MAP[strength.icon]}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#10B981]">{strength.label}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[#64748B]">
                    {strength.evidenceStatement}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.section>
  )
}
