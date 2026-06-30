'use client'

import { motion } from 'framer-motion'
import { Lock, EyeOff, Trash2, Globe, Bot, FileWarning, CheckCircle2 } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'

interface PrivacyScreenProps {
  onContinue: () => void
  onBack: () => void
}

const cards = [
  {
    icon: Lock,
    color: '#3B82F6',
    title: 'Encrypted Storage',
    body: 'Photos are encrypted using AES-256 before storage. Only you and your AI coach have access.',
    badge: 'AES-256',
  },
  {
    icon: EyeOff,
    color: '#10B981',
    title: 'Private by Default',
    body: 'Your images are never visible to other users, advertisers, or third-party services.',
    badge: 'Zero sharing',
  },
  {
    icon: Trash2,
    color: '#F59E0B',
    title: 'Delete Anytime',
    body: 'Go to Settings → Privacy → Delete Photos at any time. Deletion is immediate and permanent.',
    badge: 'Immediate',
  },
  {
    icon: Globe,
    color: '#8B5CF6',
    title: 'No Public Sharing',
    body: 'Photos are never indexed, published, shared to social platforms, or used in marketing.',
    badge: 'Internal only',
  },
  {
    icon: Bot,
    color: '#60A5FA',
    title: 'Used Only for Coaching',
    body: 'AI analysis extracts body composition estimates only. Raw images are not analysed by humans.',
    badge: 'AI-only',
  },
  {
    icon: FileWarning,
    color: '#F87171',
    title: 'Medical Disclaimer',
    body: 'AI physique assessments are estimates for personalisation purposes only and are not medical diagnoses.',
    badge: 'Not medical advice',
  },
]

export function PrivacyScreen({ onContinue, onBack }: PrivacyScreenProps) {
  return (
    <div>
      {/* Header */}
      <motion.div
        variants={staggerParent(0.07)}
        initial="hidden"
        animate="visible"
        className="mb-8 text-center"
      >
        <motion.div variants={fadeUp}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10">
            <Lock className="h-5 w-5 text-[#3B82F6]" aria-hidden="true" />
          </div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-display text-2xl font-bold text-white"
        >
          Your privacy is non-negotiable.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-2 text-sm leading-relaxed text-[#64748B]"
        >
          Before uploading anything, understand exactly how your data is handled.
        </motion.p>
      </motion.div>

      {/* Privacy cards */}
      <motion.div
        className="grid gap-3 sm:grid-cols-2"
        variants={staggerParent(0.07)}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="group relative rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-4 transition-colors hover:border-[#334155]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.color }} aria-hidden="true" />
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: `${card.color}18`, color: card.color }}
                >
                  {card.badge}
                </span>
              </div>
              <p className="mb-1 text-sm font-semibold text-white">{card.title}</p>
              <p className="text-xs leading-relaxed text-[#64748B]">{card.body}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        className="mt-6 flex items-start gap-3 rounded-xl border border-[#10B981]/20 bg-[#10B981]/8 p-4"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-[#94A3B8]">
          By continuing, you confirm that you have read and understood the above.
          You retain full ownership of your photos and may request deletion at any time.
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="mt-6 flex items-center justify-between gap-4"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-[#1E293B] px-4 text-sm font-medium text-[#64748B] transition-colors hover:border-[#334155] hover:text-white"
        >
          Back
        </button>
        <motion.button
          type="button"
          id="privacy-continue"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.35)]"
        >
          I Understand — Continue
        </motion.button>
      </motion.div>
    </div>
  )
}
