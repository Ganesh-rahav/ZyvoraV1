'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { TrendingUp, Dumbbell, CheckCircle2, Flame } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { fadeUp, staggerParent, sectionReveal } from '@/lib/motion'

// ─── Animated macro ring with SVG stroke animation ────────────────────────────
function AnimatedMacroRing({
  label,
  value,
  max,
  color,
  active,
  unit = 'g',
  delay = 0,
}: {
  label: string
  value: number
  max: number
  color: string
  active: boolean
  unit?: string
  delay?: number
}) {
  const r = 26
  const circ = 2 * Math.PI * r
  const targetPct = Math.min(value / max, 1)
  const displayValue = useCountUp({ to: value, active, duration: 1.2 })

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`${label}: ${value} of ${max} ${unit}`}>
        {/* Track */}
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1E293B" strokeWidth="5" />
        {/* Animated fill */}
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circ * targetPct} ${circ * (1 - targetPct)}`}
          strokeDashoffset={circ * 0.25}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={active ? { strokeDasharray: `${circ * targetPct} ${circ * (1 - targetPct)}` } : {}}
          transition={{ duration: 1.2, delay, ease: [0, 0, 0.2, 1] }}
        />
        <text
          x="32" y="36"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="11"
          fontWeight="600"
          fontFamily="JetBrains Mono, monospace"
        >
          {displayValue}
        </text>
      </svg>
      <span className="text-xs text-[#64748B]">{label}</span>
    </div>
  )
}

// ─── Animated bar chart column ───────────────────────────────────────────────
function AnimatedBar({
  day,
  height,
  isActive,
  inView,
  delay,
}: {
  day: string
  height: number
  isActive?: boolean
  inView: boolean
  delay: number
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-6 overflow-hidden rounded-t-sm bg-[#1E293B]"
        style={{ height: '48px' }}
      >
        <motion.div
          className="absolute bottom-0 w-full rounded-t-sm"
          style={{ backgroundColor: isActive ? '#3B82F6' : '#334155' }}
          initial={{ height: 0 }}
          animate={inView ? { height: `${height}%` } : { height: 0 }}
          transition={{ duration: 0.6, delay, ease: [0, 0, 0.2, 1] }}
        />
      </div>
      <span className="text-[10px] text-[#475569]">{day}</span>
    </div>
  )
}

// ─── Number counter stat ──────────────────────────────────────────────────────
function CountStat({
  label,
  value,
  unit,
  color,
  suffix,
  active,
  delay,
  decimals = 0,
}: {
  label: string
  value: number
  unit?: string
  color?: string
  suffix?: string
  active: boolean
  delay?: number
  decimals?: number
}) {
  void delay
  const display = useCountUp({ to: value, active, duration: 1.4, decimals })
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#64748B]">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-sm font-semibold" style={{ color: color ?? '#F8FAFC' }}>
          {display}{unit ?? ''}
        </span>
        {suffix && <span className="text-xs text-[#10B981]">{suffix}</span>}
      </div>
    </div>
  )
}

// ─── Dashboard Preview Section ────────────────────────────────────────────────
export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()
  const active = inView

  const bars: { day: string; height: number; active?: boolean }[] = [
    { day: 'Mon', height: 80, active: true },
    { day: 'Tue', height: 0 },
    { day: 'Wed', height: 90, active: true },
    { day: 'Thu', height: 0 },
    { day: 'Fri', height: 65, active: true },
    { day: 'Sat', height: 0 },
    { day: 'Sun', height: 0 },
  ]

  return (
    <section
      ref={ref}
      className="bg-[#0F172A] py-24 md:py-32"
      aria-label="Dashboard preview"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={staggerParent(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.span variants={fadeUp} className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Dashboard
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Your coaching hub.{' '}
            <span className="text-[#64748B]">Everything in one place.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-[#64748B]">
            See your workout, macros, body metrics, and AI check-in at a glance — every day.
          </motion.p>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0F172A] shadow-[0_0_80px_0_rgba(0,0,0,0.6)]"
          aria-label="Illustrative dashboard mockup"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4">
            <div className="flex items-center gap-3">
              <motion.span
                className="h-2 w-2 rounded-full bg-[#10B981]"
                animate={shouldReduceMotion ? {} : { opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
              <span className="font-display text-sm font-semibold text-white">Zyvora Dashboard</span>
            </div>
            <motion.span
              initial={{ opacity: 0, x: 12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-medium text-[#F59E0B]"
            >
              Check-in due today
            </motion.span>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            {/* Left — workout + activity */}
            <div className="flex flex-col gap-4 md:col-span-2">
              {/* Today's workout */}
              <motion.div
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/60 p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.25 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                    <span className="text-sm font-semibold text-white">Today&apos;s Workout</span>
                  </div>
                  <span className="rounded-md bg-[#3B82F6]/15 px-2 py-0.5 text-xs font-medium text-[#60A5FA]">
                    Upper A
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { name: 'Bench Press', sets: '4 × 8', weight: '85kg', done: true },
                    { name: 'Incline DB Press', sets: '3 × 10', weight: '30kg', done: true },
                    { name: 'Cable Flyes', sets: '3 × 12', weight: '15kg', done: false },
                    { name: 'Tricep Pushdowns', sets: '3 × 15', weight: '25kg', done: false },
                  ].map((ex, i) => (
                    <motion.div
                      key={ex.name}
                      className="flex items-center justify-between rounded-lg bg-[#0F172A]/80 px-3 py-2.5"
                      initial={{ opacity: 0, x: -12 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 transition-colors ${ex.done ? 'text-[#10B981]' : 'text-[#334155]'}`}
                          aria-hidden="true"
                        />
                        <span className={`text-sm ${ex.done ? 'text-[#64748B] line-through' : 'text-[#CBD5E1]'}`}>
                          {ex.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#475569]">{ex.sets}</span>
                        <span className="font-mono text-xs font-medium text-[#94A3B8]">{ex.weight}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Weekly activity */}
              <motion.div
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/60 p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">Weekly Activity</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  {bars.map((b, i) => (
                    <AnimatedBar
                      key={b.day}
                      day={b.day}
                      height={b.height}
                      isActive={b.active}
                      inView={inView}
                      delay={0.4 + i * 0.07}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right — macros + metrics + streak */}
            <div className="flex flex-col gap-4">
              {/* Macro rings */}
              <motion.div
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/60 p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm font-semibold text-white">Today&apos;s Macros</span>
                <div className="mt-4 flex justify-around">
                  <AnimatedMacroRing label="Protein" value={142} max={190} color="#10B981" active={active} delay={0.5} />
                  <AnimatedMacroRing label="Carbs"   value={220} max={280} color="#3B82F6" active={active} delay={0.65} />
                  <AnimatedMacroRing label="Fats"    value={58}  max={70}  color="#60A5FA" active={active} delay={0.8} />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-[#0F172A]/60 px-3 py-2">
                  <span className="text-xs text-[#64748B]">Calories</span>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      className="font-mono text-sm font-semibold text-white"
                    >
                      {useCountUp({ to: 1842, active, duration: 1.4 })}
                    </motion.span>
                    <span className="font-mono text-xs text-[#475569]">/ 2,200</span>
                  </div>
                </div>
              </motion.div>

              {/* Body metrics */}
              <motion.div
                className="rounded-xl border border-[#1E293B] bg-[#1E293B]/60 p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                <span className="text-sm font-semibold text-white">Body Metrics</span>
                <div className="mt-4 flex flex-col gap-3">
                  <CountStat label="Weight"   value={83.4} unit=" kg" active={active} suffix="↓ 0.4" decimals={1} />
                  <CountStat label="Body Fat" value={18.4} unit="%"   active={active} decimals={1} />
                  <CountStat label="Waist"    value={82}   unit=" cm" active={active} />
                </div>
              </motion.div>

              {/* Streak */}
              <motion.div
                className="flex items-center gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/8 p-4"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 22 }}
              >
                <motion.div
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Flame className="h-5 w-5 shrink-0 text-[#F59E0B]" aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="text-xs text-[#F59E0B]/70">Training Streak</p>
                  <p className="font-mono text-lg font-bold text-[#F59E0B]">
                    {useCountUp({ to: 21, active, duration: 1.0 })} days
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-[#334155]" aria-hidden="true">
          Illustrative mockup — not real user data
        </p>
      </div>
    </section>
  )
}
