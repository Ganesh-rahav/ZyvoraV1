'use client'

import { motion } from 'framer-motion'
import type { GreetingSection } from '@/lib/cee/types/session'

interface CoachGreetingProps {
  greeting: GreetingSection
  firstName: string
}

export function CoachGreeting({ greeting }: CoachGreetingProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-[#1E293B] p-8"
      aria-label="Coach greeting"
    >
      {/* Subtle AI glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#3B82F6]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#10B981]/8 blur-2xl" />

      {/* Coach avatar mark */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg shadow-[#3B82F6]/20">
          <span className="text-sm font-bold text-white">Z</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6]">Zyvora Coach</p>
          <p className="text-xs text-[#475569]">First session</p>
        </div>
      </div>

      {/* Opening line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-3 text-xl font-semibold leading-snug text-white"
        id="coach-greeting-opening"
      >
        {greeting.openingLine}
      </motion.p>

      {/* Context setter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-3 text-[15px] leading-relaxed text-[#94A3B8]"
      >
        {greeting.contextSetter}
      </motion.p>

      {/* Session intent */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="text-[15px] leading-relaxed text-[#64748B]"
      >
        {greeting.sessionIntent}
      </motion.p>
    </motion.section>
  )
}
