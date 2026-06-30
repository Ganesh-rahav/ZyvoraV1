'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ScanFace, Dumbbell, Utensils, TrendingUp, Bot } from 'lucide-react'
import { fadeUp, staggerParent } from '@/lib/motion'

// ─── AI Coach chat simulation ─────────────────────────────────────────────────
const CONVERSATION = [
  { role: 'user' as const,  text: "My shoulders aren't growing. I've been doing the same routine for 8 weeks." },
  { role: 'coach' as const, text: "That's a plateau signal — and eight weeks is exactly when it surfaces. Your current upper day is lateral-dominant but lacking enough rear delt and overhead pressing volume. I'm also seeing your weekly shoulder volume is below the 10-set minimum threshold for hypertrophy. Let me fix this." },
  { role: 'coach' as const, text: "I've updated your Upper A session: added Overhead Press (3×8) as the primary movement, replaced the front raises with Rear Delt Flyes (3×15), and increased lateral raises from 2 to 3 sets. Your plan refreshes tonight." },
  { role: 'user' as const,  text: "Should I add face pulls too?" },
  { role: 'coach' as const, text: "Yes — add 2 sets of Cable Face Pulls at the end of your push days. They reinforce rear delt and rotator cuff health, which protects your shoulder press strength long-term. I've added them to your template." },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Coach is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function CoachChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisibleCount(CONVERSATION.length)
      return
    }

    let cancelled = false

    const advance = async () => {
      for (let i = 0; i < CONVERSATION.length; i++) {
        if (cancelled) return
        const msg = CONVERSATION[i]

        if (msg.role === 'coach') {
          setShowTyping(true)
          await new Promise((r) => setTimeout(r, 900 + msg.text.length * 6))
          setShowTyping(false)
          await new Promise((r) => setTimeout(r, 80))
        }

        if (cancelled) return
        setVisibleCount(i + 1)

        // Pause before next message
        await new Promise((r) => setTimeout(r, i < CONVERSATION.length - 1 ? 1400 : 0))
      }
    }

    // Small initial delay
    const timer = setTimeout(() => { void advance() }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [shouldReduceMotion])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [visibleCount, showTyping])

  return (
    <div
      className="flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1"
      role="log"
      aria-label="AI Coach conversation demonstration"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {CONVERSATION.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'coach' && (
              <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20">
                <Bot className="h-3 w-3 text-[#10B981]" aria-hidden="true" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'coach'
                  ? 'rounded-tl-sm border border-[#10B981]/20 bg-[#064E3B]/40 text-[#A7F3D0]'
                  : 'rounded-tr-sm bg-[#1E293B] text-[#CBD5E1]'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20">
              <Bot className="h-3 w-3 text-[#10B981]" aria-hidden="true" />
            </div>
            <div className="rounded-xl rounded-tl-sm border border-[#10B981]/20 bg-[#064E3B]/40 px-4 py-2.5">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}

// ─── Feature data ─────────────────────────────────────────────────────────────
const features = [
  {
    id: 'physique',
    icon: ScanFace,
    title: 'AI Physique Analysis',
    tagline: 'Know your baseline precisely.',
    description:
      'Upload front, side, and back photos. Our AI estimates body fat percentage (±2% confidence interval), waist-to-hip ratio, muscle balance, and postural notes — giving your plan a scientifically grounded starting point.',
    bullets: [
      'Body fat % with confidence interval',
      'Frame structure & symmetry analysis',
      'Physique synthesis narrative',
      'Override with DEXA or caliper data',
    ],
    accent: '#3B82F6',
    isCoach: false,
  },
  {
    id: 'workout',
    icon: Dumbbell,
    title: 'Workout Generator',
    tagline: 'Built for your body, schedule, and goals.',
    description:
      'Receive a periodized training block tailored to your equipment, training frequency, experience level, and injury history — not a preset template with your name stamped on it.',
    bullets: [
      'Periodized 4–8 week blocks',
      'Equipment-adaptive exercise selection',
      'Exercise substitution on demand',
      'Progressive overload built in',
    ],
    accent: '#3B82F6',
    isCoach: false,
  },
  {
    id: 'nutrition',
    icon: Utensils,
    title: 'Nutrition Planner',
    tagline: 'Precision macros. Explained clearly.',
    description:
      'TDEE calculated from your actual physique data using Katch-McArdle. Macronutrient splits set for your goal. Adjusts automatically every week based on your real-world weight trend.',
    bullets: [
      'Katch-McArdle TDEE calculation',
      'Goal-adjusted macro splits',
      'Dietary restriction support',
      'Hydration guidance included',
    ],
    accent: '#10B981',
    isCoach: false,
  },
  {
    id: 'progress',
    icon: TrendingUp,
    title: 'Progress Tracking',
    tagline: 'Measure what actually matters.',
    description:
      'Log workouts, body weight, measurements, and nutrition. Visualize trends across 7, 30, 90, and 365-day windows. Progress is multi-dimensional — not just the number on a scale.',
    bullets: [
      'Strength & volume trends',
      'Body composition timeline',
      'Macro adherence tracking',
      'Photo comparison archive',
    ],
    accent: '#3B82F6',
    isCoach: false,
  },
  {
    id: 'coach',
    icon: Bot,
    title: 'AI Coach',
    tagline: 'A coach with infinite memory.',
    description:
      'Ask questions, report issues, or request changes at any time. Your coach has access to your full history — goals, logs, plans, and previous conversations — and responds with complete context.',
    bullets: [
      'Long-term memory across sessions',
      'Weekly adaptive check-ins',
      'Plateau detection & resolution',
      'Evidence-informed responses only',
    ],
    accent: '#10B981',
    isCoach: true,
  },
]

// ─── Panel content — left column ──────────────────────────────────────────────
function PanelLeft({ f }: { f: (typeof features)[0] }) {
  const Icon = f.icon
  return (
    <motion.div
      key={`left-${f.id}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${f.accent}18` }}
      >
        <Icon className="h-6 w-6" style={{ color: f.accent }} aria-hidden="true" />
      </div>
      {f.isCoach && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-2.5 py-1 text-xs font-semibold text-[#10B981]"
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          AI Powered
        </motion.span>
      )}
      <h3 className="mt-1 font-display text-2xl font-bold text-white">{f.title}</h3>
      <p className="mt-1 text-sm font-medium" style={{ color: f.accent }}>{f.tagline}</p>
      <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">{f.description}</p>
    </motion.div>
  )
}

// ─── Panel content — right column ─────────────────────────────────────────────
function PanelRight({ f }: { f: (typeof features)[0] }) {
  return (
    <motion.div
      key={`right-${f.id}`}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start"
    >
      {f.isCoach ? (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Live conversation demo
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10B981]">
              <span className="h-1 w-1 rounded-full bg-[#10B981]" />
              Simulated
            </span>
          </div>
          <div className="rounded-xl border border-[#10B981]/15 bg-[#020617]/60 p-4">
            <CoachChatDemo />
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#475569]">
            What&apos;s included
          </p>
          <ul className="flex flex-col gap-3" role="list">
            {f.bullets.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <span
                  className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: `${f.accent}20`, color: f.accent }}
                >
                  ✓
                </span>
                <span className="text-sm text-[#94A3B8]">{b}</span>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  )
}

// ─── Feature Showcase Section ──────────────────────────────────────────────────
export function FeatureShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState('physique')

  const activeFeature = features.find((f) => f.id === active)!

  return (
    <section
      id="feature-showcase"
      ref={ref}
      className="relative bg-[#080F1F] py-24 md:py-32"
      aria-labelledby="features-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={staggerParent(0.08)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.span variants={fadeUp} className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Features
          </motion.span>
          <motion.h2
            id="features-heading"
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything your coach provides.{' '}
            <span className="text-[#64748B]">Nothing more.</span>
          </motion.h2>
        </motion.div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18 }}
          className="mt-12 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Feature tabs"
        >
          {features.map((f) => {
            const Icon = f.icon
            const isActive = active === f.id
            return (
              <motion.button
                key={f.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${f.id}`}
                id={`tab-${f.id}`}
                onClick={() => setActive(f.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? f.isCoach
                      ? 'bg-[#064E3B] text-[#10B981] shadow-[0_0_0_1px_rgba(16,185,129,0.3)]'
                      : 'bg-[#1E3A8A] text-[#93C5FD] shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                    : 'text-[#64748B] hover:bg-[#1E293B] hover:text-[#94A3B8]'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{f.title}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Feature detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className={`mt-6 overflow-hidden rounded-2xl border p-8 md:p-12 ${
              activeFeature.isCoach
                ? 'border-[#10B981]/20 bg-[#064E3B]/15'
                : 'border-[#1E293B] bg-[#1E293B]/40'
            }`}
          >
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <AnimatePresence mode="wait">
                <PanelLeft key={`pl-${active}`} f={activeFeature} />
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <PanelRight key={`pr-${active}`} f={activeFeature} />
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
