'use client'

import { motion } from 'framer-motion'
import type { BaselineSection } from '@/lib/cee/types/session'

interface BaselineSectionProps {
  baseline: BaselineSection
}

const SOURCE_LABEL: Record<string, string> = {
  pie:         'Photo analysis',
  self_report: 'Self-reported',
  derived:     'Calculated',
}

export function BaselineSectionBlock({ baseline }: BaselineSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.45 }}
      aria-labelledby="baseline-heading"
    >
      {/* Section label */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#1E293B]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
          Baseline
        </span>
        <div className="h-px flex-1 bg-[#1E293B]" />
      </div>

      <div className="rounded-2xl border border-[#1E293B] bg-[#0F172A]/60 p-6">
        {/* Headline + anchor */}
        <h2 id="baseline-heading" className="mb-1 text-base font-semibold text-[#E2E8F0]">
          {baseline.headline}
        </h2>
        <p className="mb-6 text-[13px] text-[#64748B]">{baseline.anchorStatement}</p>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {baseline.metrics.map((metric, i) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              className="rounded-xl border border-[#1E293B]/60 bg-[#1E293B]/30 px-4 py-3"
            >
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#475569]">
                {metric.label}
              </p>
              <p className="text-xl font-bold tabular-nums text-[#E2E8F0]">
                {metric.displayValue}
              </p>
              {metric.context && (
                <p className="mt-1 text-[11px] leading-relaxed text-[#475569]">
                  {metric.context}
                </p>
              )}
              <span className="mt-2 inline-block rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#475569]">
                {SOURCE_LABEL[metric.source]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Forward statement */}
        <p className="mt-5 text-[13px] leading-relaxed text-[#64748B]">
          {baseline.forwardStatement}
        </p>

        {/* Measurement disclaimer */}
        {baseline.measurementDisclaimer && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#1E293B]/40 px-3 py-2">
            <span className="text-[#475569]" aria-hidden="true">ℹ</span>
            <p className="text-[11px] leading-relaxed text-[#475569]">
              {baseline.measurementDisclaimer}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
