'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Eye, Trash2 } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'

interface WelcomeScreenProps {
  onContinue: () => void
  onLearnPrivacy: () => void
}

const pillars = [
  {
    icon: Shield,
    color: '#3B82F6',
    bg: '#3B82F6',
    label: 'Photos remain private',
    text: 'Your images are encrypted at rest. They are never shared, sold, or used outside your coaching relationship.',
  },
  {
    icon: Eye,
    color: '#10B981',
    bg: '#10B981',
    label: 'Estimates only',
    text: 'AI assessments are estimations — not medical diagnoses. They improve personalization, not replace professional advice.',
  },
  {
    icon: Trash2,
    color: '#F59E0B',
    bg: '#F59E0B',
    label: 'Delete anytime',
    text: 'You can remove your photos from Zyvora at any time from your account settings.',
  },
]

export function WelcomeScreen({ onContinue, onLearnPrivacy }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated physique AI icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
        className="relative mb-8 flex h-24 w-24 items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-[#3B82F6]/15 blur-2xl" />
        {/* Outer slow spin */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{
            border: '1.5px solid transparent',
            borderTopColor: '#3B82F6',
            borderRightColor: 'rgba(59,130,246,0.2)',
          }}
        />
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full border border-[#10B981]/20"
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#1E293B]">
          {/* Human silhouette SVG */}
          <svg viewBox="0 0 28 40" fill="none" className="h-8 w-8" aria-hidden="true">
            <circle cx="14" cy="6" r="4.5" stroke="#60A5FA" strokeWidth="1.5" />
            <path d="M7 14C7 11.8 8.8 10 11 10H17C19.2 10 21 11.8 21 14V24H18V36H10V24H7V14Z"
              stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        variants={staggerParent(0.09)}
        initial="hidden"
        animate="visible"
        className="max-w-lg"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            AI Physique Analysis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Let&apos;s understand your physique.
        </motion.h1>

        {/* Body */}
        <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-[#94A3B8]">
          Zyvora uses visible body characteristics from your photos to personalise your training
          and nutrition coaching. This is optional — but it significantly improves your results.
        </motion.p>

        {/* Pillars */}
        <motion.div variants={fadeUp} className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.label}
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-4"
              >
                <div
                  className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${p.bg}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: p.color }} aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-white">{p.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{p.text}</p>
              </div>
            )
          })}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3">
          <motion.button
            type="button"
            id="photo-welcome-continue"
            onClick={onContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-8 text-base font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-[0_0_24px_0_rgba(59,130,246,0.4)] sm:w-auto"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.button>
          <button
            type="button"
            id="photo-welcome-privacy"
            onClick={onLearnPrivacy}
            className="text-sm text-[#60A5FA] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          >
            Learn about privacy →
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
