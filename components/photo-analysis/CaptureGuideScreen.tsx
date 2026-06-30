'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'

interface CaptureGuideScreenProps {
  onContinue: () => void
  onBack: () => void
}

interface GuideItem {
  id: string
  icon: string
  label: string
  why: string
  confidence: number   // AI confidence improvement estimate
}

const guideItems: GuideItem[] = [
  {
    id: 'natural',
    icon: '🧍',
    label: 'Stand naturally',
    why: 'A natural, relaxed posture gives the AI the most representative view of your actual body structure — not a forced stance that distorts proportions.',
    confidence: 12,
  },
  {
    id: 'fullbody',
    icon: '📐',
    label: 'Full body visible',
    why: 'The model needs head-to-toe coverage to accurately estimate body composition ratios. Cropped images reduce accuracy by up to 40%.',
    confidence: 22,
  },
  {
    id: 'lighting',
    icon: '💡',
    label: 'Good, even lighting',
    why: 'Harsh shadows or dim lighting obscure muscle definition and body contour. Face a window or use even overhead light.',
    confidence: 18,
  },
  {
    id: 'background',
    icon: '🏠',
    label: 'Neutral background',
    why: 'A plain wall or neutral surface allows the AI to cleanly separate your silhouette from the background.',
    confidence: 8,
  },
  {
    id: 'relaxed',
    icon: '😌',
    label: 'Relaxed pose',
    why: 'Flexed or tense muscles misrepresent your baseline. Relaxed posture gives your coach accurate starting data for tracking real progress.',
    confidence: 10,
  },
  {
    id: 'mirrors',
    icon: '🪞',
    label: 'Avoid mirrors if possible',
    why: 'Mirrors can create lens distortion and confuse the AI\'s body segmentation model. Direct photos are always higher quality.',
    confidence: 6,
  },
]

function GuideItemRow({ item }: { item: GuideItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-xl border border-[#1E293B] bg-[#1E293B]/40 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#1E293B]/60"
        aria-expanded={expanded}
        aria-controls={`guide-item-${item.id}`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10">
          <span className="text-sm" role="img" aria-hidden="true">{item.icon}</span>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" aria-hidden="true" />
          <span className="text-sm font-medium text-white">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] font-semibold text-[#10B981] sm:block">
            +{item.confidence}% AI confidence
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-[#475569]" aria-hidden="true" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`guide-item-${item.id}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#1E293B] px-4 py-3">
              <p className="text-xs leading-relaxed text-[#94A3B8]">{item.why}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#0F172A]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.confidence * 4}%` }}
                    transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay: 0.1 }}
                  />
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#10B981]">+{item.confidence}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function CaptureGuideScreen({ onContinue, onBack }: CaptureGuideScreenProps) {
  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-6 text-center"
        variants={staggerParent(0.07)}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp}>
          {/* Body silhouette illustration */}
          <div className="relative mx-auto mb-4 flex h-20 w-16 items-end justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full rounded-3xl bg-[#1E293B]/60 border border-[#334155]/50" />
            </div>
            <svg viewBox="0 0 40 72" fill="none" className="relative z-10 h-16 w-10" aria-label="Body silhouette">
              <circle cx="20" cy="8" r="6.5" stroke="#60A5FA" strokeWidth="1.5" />
              <path
                d="M10 20C10 16.7 12.7 14 16 14H24C27.3 14 30 16.7 30 20V38H26V64H14V38H10V20Z"
                stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(59,130,246,0.08)"
              />
              {/* Measurement lines */}
              <line x1="6" y1="22" x2="34" y2="22" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
              <line x1="6" y1="34" x2="34" y2="34" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
              <line x1="6" y1="50" x2="34" y2="50" stroke="#10B981" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        <motion.h2 variants={fadeUp} className="font-display text-2xl font-bold text-white">
          How to take the perfect photo.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-[#64748B]">
          Each recommendation directly improves AI accuracy. Tap any item to learn why.
        </motion.p>
      </motion.div>

      {/* Guide checklist */}
      <motion.div
        className="flex flex-col gap-2"
        variants={staggerParent(0.06)}
        initial="hidden"
        animate="visible"
      >
        {guideItems.map((item) => (
          <GuideItemRow key={item.id} item={item} />
        ))}
      </motion.div>

      {/* Nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
          id="guide-continue"
          onClick={onContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-10 items-center gap-2 rounded-lg bg-[#3B82F6] px-6 text-sm font-semibold text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.35)]"
        >
          I&apos;m Ready — Upload Photos
        </motion.button>
      </motion.div>
    </div>
  )
}
