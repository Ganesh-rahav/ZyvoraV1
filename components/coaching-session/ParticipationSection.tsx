'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, SlidersHorizontal, MessageSquare } from 'lucide-react'
import type { ParticipationSection, ParticipationResponse } from '@/lib/cee/types/session'

interface ParticipationSectionProps {
  participation: ParticipationSection
  onRespond: (response: ParticipationResponse, notes?: string) => void
}

export function ParticipationSectionBlock({ participation, onRespond }: ParticipationSectionProps) {
  const [selected, setSelected] = useState<ParticipationResponse>(null)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (response: Exclude<ParticipationResponse, null>) => {
    setSelected(response)
    if (response === 'agree') {
      // Immediate proceed
      setTimeout(() => {
        setSubmitted(true)
        onRespond('agree')
      }, 400)
    }
  }

  const handleSubmitNotes = () => {
    setSubmitted(true)
    onRespond(selected, notes.trim() || undefined)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.45 }}
      aria-labelledby="participation-heading"
      className="rounded-2xl border border-[#1E293B] bg-gradient-to-b from-[#0F172A] to-[#1E293B]/20 p-6"
    >
      {/* Question */}
      <h2
        id="participation-heading"
        className="mb-2 text-[16px] font-semibold text-[#E2E8F0]"
      >
        {participation.question}
      </h2>
      <p className="mb-6 text-[13px] leading-relaxed text-[#64748B]">
        {participation.subtext}
      </p>

      {/* Options */}
      {!submitted && (
        <div className="space-y-2.5">
          {/* Agree */}
          <button
            type="button"
            id="participation-agree"
            onClick={() => handleSelect('agree')}
            className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
              selected === 'agree'
                ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]'
                : 'border-[#1E293B] bg-transparent text-[#94A3B8] hover:border-[#10B981]/30 hover:bg-[#10B981]/5 hover:text-[#10B981]'
            }`}
            aria-pressed={selected === 'agree'}
          >
            <CheckCircle2 size={18} className="flex-shrink-0" />
            <span className="text-[14px] font-medium">{participation.options.agree}</span>
          </button>

          {/* Adjust */}
          <button
            type="button"
            id="participation-adjust"
            onClick={() => handleSelect('adjust')}
            className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
              selected === 'adjust'
                ? 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#60A5FA]'
                : 'border-[#1E293B] bg-transparent text-[#94A3B8] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 hover:text-[#60A5FA]'
            }`}
            aria-pressed={selected === 'adjust'}
          >
            <SlidersHorizontal size={18} className="flex-shrink-0" />
            <span className="text-[14px] font-medium">{participation.options.adjust}</span>
          </button>

          {/* Add context */}
          <button
            type="button"
            id="participation-add-context"
            onClick={() => handleSelect('add_context')}
            className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
              selected === 'add_context'
                ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/10 text-[#A78BFA]'
                : 'border-[#1E293B] bg-transparent text-[#94A3B8] hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#A78BFA]'
            }`}
            aria-pressed={selected === 'add_context'}
          >
            <MessageSquare size={18} className="flex-shrink-0" />
            <span className="text-[14px] font-medium">{participation.options.addContext}</span>
          </button>
        </div>
      )}

      {/* Notes input — shown for adjust or add_context */}
      <AnimatePresence>
        {(selected === 'adjust' || selected === 'add_context') && !submitted && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <label htmlFor="participation-notes" className="mb-2 block text-[12px] font-medium text-[#475569]">
              {selected === 'adjust'
                ? 'What feels different from what was presented?'
                : 'What additional context would be helpful for your coach?'}
            </label>
            <textarea
              id="participation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={
                selected === 'adjust'
                  ? 'e.g. My main struggle is actually sleep, not training...'
                  : 'e.g. I have a competition in 8 weeks which changes my priorities...'
              }
              className="w-full resize-none rounded-xl border border-[#1E293B] bg-[#0F172A] px-4 py-3 text-[14px] text-[#E2E8F0] placeholder:text-[#475569] focus:border-[#3B82F6]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
            />
            <motion.button
              type="button"
              id="participation-submit"
              onClick={handleSubmitNotes}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-3 w-full rounded-xl bg-[#3B82F6] px-4 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#3B82F6]/20 transition-colors hover:bg-[#2563EB]"
            >
              Continue to dashboard
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submitted state */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-[#10B981]/30 bg-[#10B981]/8 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} className="flex-shrink-0 text-[#10B981]" />
            <p className="text-[13px] text-[#34D399]">
              Noted. Heading to your dashboard…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
