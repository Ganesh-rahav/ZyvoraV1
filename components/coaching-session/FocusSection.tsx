'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FocusSection, FocusArea, ReasoningSection } from '@/lib/cee/types/session'

interface FocusSectionProps {
  focus: FocusSection
  reasoning: ReasoningSection
}

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  physique_transformation: { bg: 'bg-[#3B82F6]/8',   text: 'text-[#60A5FA]', border: 'border-[#3B82F6]/20' },
  strength_performance:    { bg: 'bg-[#8B5CF6]/8',   text: 'text-[#A78BFA]', border: 'border-[#8B5CF6]/20' },
  nutrition_metabolism:    { bg: 'bg-[#F59E0B]/8',   text: 'text-[#FCD34D]', border: 'border-[#F59E0B]/20' },
  recovery_health:         { bg: 'bg-[#10B981]/8',   text: 'text-[#34D399]', border: 'border-[#10B981]/20' },
  adherence_behaviour:     { bg: 'bg-[#EC4899]/8',   text: 'text-[#F472B6]', border: 'border-[#EC4899]/20' },
  injury_prevention:       { bg: 'bg-[#EF4444]/8',   text: 'text-[#F87171]', border: 'border-[#EF4444]/20' },
  lifestyle_integration:   { bg: 'bg-[#06B6D4]/8',   text: 'text-[#22D3EE]', border: 'border-[#06B6D4]/20' },
}

function getDomainStyle(domain: string) {
  return DOMAIN_COLORS[domain] ?? { bg: 'bg-[#1E293B]', text: 'text-[#94A3B8]', border: 'border-[#1E293B]' }
}

const CONFIDENCE_BADGE: Record<string, string> = {
  high:     'bg-[#10B981]/10 text-[#10B981]',
  moderate: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  low:      'bg-[#EF4444]/10 text-[#EF4444]',
}

interface FocusCardProps {
  area: FocusArea
  reasoningItem: ReasoningSection['items'][number] | undefined
  animDelay: number
}

function FocusCard({ area, reasoningItem, animDelay }: FocusCardProps) {
  const [expanded, setExpanded] = useState(area.priorityNumber === 1)
  const style = getDomainStyle(area.domain)
  const badgeClass = CONFIDENCE_BADGE[area.confidence] ?? CONFIDENCE_BADGE['moderate']!

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.45 }}
      className={`overflow-hidden rounded-2xl border ${style.border} ${style.bg}`}
      id={`focus-area-${area.priorityNumber}`}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
        aria-controls={`focus-reasoning-${area.id}`}
      >
        {/* Priority badge */}
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0F172A]/60 text-xs font-bold text-white">
          {area.priorityNumber}
        </div>

        <div className="flex-1 min-w-0">
          {/* Domain tag */}
          <span className={`mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-widest ${style.text}`}>
            {area.domain.replace(/_/g, ' ')}
          </span>
          {/* Label */}
          <p className="text-[15px] font-semibold leading-snug text-[#E2E8F0]">
            {area.label}
          </p>
          {/* Coaching statement */}
          <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">
            {area.coachingStatement}
          </p>
        </div>

        {/* Right side: confidence + chevron */}
        <div className="ml-2 flex flex-col items-end gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}>
            {area.confidence}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[#475569]"
            aria-hidden="true"
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </button>

      {/* Reasoning — expandable */}
      <AnimatePresence initial={false}>
        {expanded && reasoningItem && (
          <motion.div
            id={`focus-reasoning-${area.id}`}
            key="reasoning"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
            aria-label={`Reasoning for ${area.label}`}
          >
            <div className="border-t border-[#1E293B]/40 px-5 pb-5 pt-4 space-y-4">
              {/* Why this */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                  Why this priority
                </p>
                <p className="text-[13px] leading-relaxed text-[#94A3B8]">
                  {reasoningItem.whyThis}
                </p>
              </div>

              {/* Why now */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                  Why now
                </p>
                <p className="text-[13px] leading-relaxed text-[#94A3B8]">
                  {reasoningItem.whyNow}
                </p>
              </div>

              {/* Why first */}
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
                  Why before the others
                </p>
                <p className="text-[13px] leading-relaxed text-[#94A3B8]">
                  {reasoningItem.whyFirst}
                </p>
              </div>

              {/* Confidence caveat */}
              {area.caveat && (
                <div className="flex items-start gap-2 rounded-lg bg-[#1E293B]/40 px-3 py-2">
                  <span className="text-[#F59E0B]" aria-hidden="true">⚠</span>
                  <p className="text-[12px] leading-relaxed text-[#94A3B8]">
                    {area.caveat.text}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export function FocusSectionBlock({ focus, reasoning }: FocusSectionProps) {
  return (
    <section aria-labelledby="focus-heading">
      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#1E293B]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
          Current Focus
        </span>
        <div className="h-px flex-1 bg-[#1E293B]" />
      </div>

      <p id="focus-heading" className="mb-5 text-[14px] leading-relaxed text-[#94A3B8]">
        {focus.introLine}
      </p>

      <div className="space-y-3">
        {focus.areas.map((area, i) => {
          const reasoningItem = reasoning.items.find((r) => r.focusId === area.id)
          return (
            <FocusCard
              key={area.id}
              area={area}
              reasoningItem={reasoningItem}
              animDelay={0.1 + i * 0.12}
            />
          )
        })}
      </div>
    </section>
  )
}
