'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { ReadinessCheck, ValidationStatus } from '@/types/photo-analysis'
import { staggerParent, fadeUp } from '@/lib/motion'

interface ValidationChecklistProps {
  checks: ReadinessCheck[]
}

const STATUS_META: Record<ValidationStatus, {
  icon: typeof CheckCircle2
  color: string
  bg: string
}> = {
  pass: { icon: CheckCircle2,   color: '#10B981', bg: '#10B98118' },
  warn: { icon: AlertTriangle,  color: '#F59E0B', bg: '#F59E0B18' },
  fail: { icon: XCircle,        color: '#EF4444', bg: '#EF444418' },
}

export function ValidationChecklist({ checks }: ValidationChecklistProps) {
  return (
    <motion.ul
      className="flex flex-col gap-2"
      variants={staggerParent(0.07)}
      initial="hidden"
      animate="visible"
      role="list"
      aria-label="Validation results"
    >
      {checks.map((check) => {
        const meta = STATUS_META[check.status]
        const Icon = meta.icon
        return (
          <motion.li
            key={check.id}
            variants={fadeUp}
            className="flex items-start gap-3 rounded-lg border border-[#1E293B] bg-[#1E293B]/40 px-3 py-2.5"
          >
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{ background: meta.bg }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{check.label}</p>
              {check.detail && (
                <p className="mt-0.5 text-xs text-[#64748B]">{check.detail}</p>
              )}
            </div>
            <span
              className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: meta.bg, color: meta.color }}
            >
              {check.status}
            </span>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
