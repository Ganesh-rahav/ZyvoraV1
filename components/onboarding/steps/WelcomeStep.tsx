'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Clock, Sparkles } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'

interface WelcomeStepProps {
  onBegin: () => void
}

const pillars = [
  { icon: Sparkles, label: 'Intelligent', text: 'Every question builds a coaching profile unlike anything you\'ve had before.' },
  { icon: Clock,    label: '8 minutes',  text: 'That\'s all it takes. Focused, purposeful questions. No filler.' },
  { icon: Shield,   label: 'Private',    text: 'Your answers are never shared, sold, or used outside your coaching relationship.' },
]

export function WelcomeStep({ onBegin }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated AI core */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        className="relative mb-8 flex h-20 w-20 items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 blur-xl" />
        <motion.div
          className="absolute inset-0 rounded-full border border-[#3B82F6]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: '#3B82F6', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderWidth: '1.5px' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#3B82F6]/50 bg-[#1E293B]">
          <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
            <path d="M8 22L16 10L24 22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="10" r="2" fill="#60A5FA" />
            <circle cx="8"  cy="22" r="2" fill="#3B82F6" />
            <circle cx="24" cy="22" r="2" fill="#3B82F6" />
          </svg>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        variants={staggerParent(0.1)}
        initial="hidden"
        animate="visible"
        className="max-w-lg"
      >
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">
            <motion.span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            Your AI coach is ready
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Let&apos;s build your coaching profile.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-4 text-base leading-relaxed text-[#94A3B8]"
        >
          Before your first plan is generated, your AI coach needs to understand you — your body,
          your goals, your lifestyle, and what drives you. This isn&apos;t a questionnaire. It&apos;s the beginning of your coaching relationship.
        </motion.p>

        {/* Pillars */}
        <motion.div variants={fadeUp} className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.label} className="rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6]/10">
                  <Icon className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{p.text}</p>
              </div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="mt-8">
          <motion.button
            type="button"
            id="begin-journey-btn"
            onClick={onBegin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-8 text-base font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-[0_0_24px_0_rgba(59,130,246,0.4)] sm:w-auto"
          >
            Begin My Journey
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.button>
          <p className="mt-3 text-xs text-[#475569]">Takes about 8 minutes · All answers can be edited later</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
