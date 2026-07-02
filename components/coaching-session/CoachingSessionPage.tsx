'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CoachGreeting }             from './CoachGreeting'
import { FoundationSectionBlock }    from './FoundationSection'
import { FocusSectionBlock }         from './FocusSection'
import { BaselineSectionBlock }      from './BaselineSection'
import { ParticipationSectionBlock } from './ParticipationSection'
import type { CoachingSession, ParticipationResponse } from '@/lib/cee/types/session'

interface CoachingSessionPageProps {
  session: CoachingSession
}

/** Smooth page-level scroll to a section */
function useScrollRef() {
  const ref = useRef<HTMLDivElement>(null)
  const scrollTo = () => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return { ref, scrollTo }
}

// Framer Motion Variants — ease must be a named string or EasingFunction, not raw number[]
const FADE_UP: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

export function CoachingSessionPage({ session }: CoachingSessionPageProps) {
  const router = useRouter()
  const [visibleSections, setVisibleSections] = useState<number>(1)
  const baselineRef = useScrollRef()
  const participationRef = useScrollRef()

  // Auto-reveal sections progressively after mount
  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSections(2), 700),
      setTimeout(() => setVisibleSections(3), 1400),
      setTimeout(() => setVisibleSections(4), 2100),
      setTimeout(() => setVisibleSections(5), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Scroll to baseline when it reveals
  useEffect(() => {
    if (visibleSections >= 4) {
      setTimeout(() => baselineRef.scrollTo(), 300)
    }
  }, [visibleSections]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to participation when it reveals
  useEffect(() => {
    if (visibleSections >= 5) {
      setTimeout(() => participationRef.scrollTo(), 300)
    }
  }, [visibleSections]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleParticipation = useCallback(
    (response: ParticipationResponse, notes?: string) => {
      // Persist to sessionStorage for future coach memory integration
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(
            'zyvora_participation',
            JSON.stringify({ response, notes, sessionId: session.id, ts: new Date().toISOString() })
          )
        } catch { /* quota */ }
      }
      // Navigate to dashboard
      setTimeout(() => router.push('/dashboard'), 1200)
    },
    [router, session.id]
  )

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[#1E293B]/60 bg-[#0F172A]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <span className="font-display text-sm font-bold text-white">Zyvora</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10B981]" />
            <span className="text-xs text-[#475569]">First session</span>
          </div>
        </div>
      </header>

      {/* ── Safety notices (non-blocking) ─────────────────────────────── */}
      {session.safetyNotices.length > 0 && (
        <div className="border-b border-[#F59E0B]/20 bg-[#F59E0B]/5 px-4 py-2.5">
          <div className="mx-auto max-w-2xl">
            {session.safetyNotices.map((notice, i) => (
              <p key={i} className="text-[12px] text-[#F59E0B]">⚠ {notice}</p>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main
        className="mx-auto max-w-2xl space-y-6 px-4 py-8 pb-24"
        id="coaching-session-main"
        aria-label="Your first coaching session"
      >
        {/* Section 1 — Greeting: always visible immediately */}
        <CoachGreeting greeting={session.greeting} firstName={session.firstName} />

        {/* Section 2 — Current Foundation */}
        <AnimatePresence>
          {visibleSections >= 2 && (
            <motion.div key="foundation" variants={FADE_UP} initial="hidden" animate="visible">
              <FoundationSectionBlock foundation={session.foundation} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sections 3+4 — Focus Areas + Reasoning (combined card) */}
        <AnimatePresence>
          {visibleSections >= 3 && (
            <motion.div key="focus" variants={FADE_UP} initial="hidden" animate="visible">
              <FocusSectionBlock focus={session.focus} reasoning={session.reasoning} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 5 — Baseline */}
        <AnimatePresence>
          {visibleSections >= 4 && (
            <motion.div
              key="baseline"
              ref={baselineRef.ref}
              variants={FADE_UP}
              initial="hidden"
              animate="visible"
            >
              <BaselineSectionBlock baseline={session.baseline} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 6 — User Participation */}
        <AnimatePresence>
          {visibleSections >= 5 && (
            <motion.div
              key="participation"
              ref={participationRef.ref}
              variants={FADE_UP}
              initial="hidden"
              animate="visible"
            >
              <ParticipationSectionBlock
                participation={session.participation}
                onRespond={handleParticipation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom progress bar ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-10 h-0.5 bg-[#1E293B]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
          animate={{ width: `${(visibleSections / 5) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}
