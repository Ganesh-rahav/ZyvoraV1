'use client'

import { motion, useReducedMotion } from 'framer-motion'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { fadeUp, staggerParent } from '@/lib/motion'

// ─── Scan-line animation running vertically through the central orb ─────────
function ScanLine() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2"
      style={{ width: '120px', height: '2px', top: '50%' }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: ['-80px', '80px', '-80px'], opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
    >
      <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent shadow-[0_0_8px_2px_rgba(59,130,246,0.4)]" />
    </motion.div>
  )
}

// ─── Floating metric micro-card ───────────────────────────────────────────────
function FloatingCard({
  label,
  value,
  color,
  delay,
  x,
  y,
  floatY = 5,
}: {
  label: string
  value: string
  color: string
  delay: number
  x: string
  y: string
  floatY?: number
}) {
  return (
    <motion.div
      className="absolute select-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0, 0, 0.2, 1] }}
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [`-${floatY / 2}px`, `${floatY / 2}px`, `-${floatY / 2}px`] }}
        transition={{ duration: 3 + delay * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-xl border border-[#334155] bg-[#1E293B]/90 px-3 py-2 backdrop-blur-sm shadow-[0_4px_24px_0_rgba(0,0,0,0.4)]"
      >
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#64748B]">{label}</p>
        <p className="mt-0.5 font-mono text-base font-semibold" style={{ color }}>
          {value}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Pulsing node dot on the ring ────────────────────────────────────────────
function NodeDot({ cx, cy, color, delay }: { cx: number; cy: number; color: string; delay: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
      transition={{ delay, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ─── Animated connection line ─────────────────────────────────────────────────
function ConnectionLine({
  x1, y1, x2, y2, color, delay,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string; delay: number
}) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={0.6}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.35 }}
      transition={{ delay, duration: 1, ease: [0, 0, 0.2, 1] }}
    />
  )
}

// ─── Main AI visualization ────────────────────────────────────────────────────
function HeroVisual() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-2xl select-none" aria-hidden="true">
      {/* Ambient radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="h-72 w-72 rounded-full bg-[#3B82F6]/12 blur-[90px]"
          animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* SVG — rings, lines, nodes */}
      <svg viewBox="0 0 500 420" fill="none" className="absolute inset-0 h-full w-full">
        <defs>
          {/* Gradient for the scan line glow */}
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer orbit ring — slow spin */}
        <motion.ellipse
          cx={250} cy={210} rx={200} ry={160}
          stroke="#3B82F6"
          strokeWidth={0.5}
          strokeDasharray="4 10"
          opacity={0.25}
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '250px 210px' }}
        />

        {/* Middle orbit ring — reverse spin */}
        <motion.ellipse
          cx={250} cy={210} rx={140} ry={108}
          stroke="#3B82F6"
          strokeWidth={0.5}
          strokeDasharray="2 8"
          opacity={0.35}
          animate={shouldReduceMotion ? {} : { rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '250px 210px' }}
        />

        {/* Inner ring — static */}
        <ellipse cx={250} cy={210} rx={78} ry={58} stroke="#60A5FA" strokeWidth={0.75} opacity={0.5} />

        {/* Animated connection lines */}
        <ConnectionLine x1={250} y1={210} x2={80}  y2={110} color="#3B82F6" delay={0.6} />
        <ConnectionLine x1={250} y1={210} x2={420} y2={130} color="#3B82F6" delay={0.8} />
        <ConnectionLine x1={250} y1={210} x2={400} y2={300} color="#10B981" delay={1.0} />
        <ConnectionLine x1={250} y1={210} x2={100} y2={320} color="#10B981" delay={1.2} />
        <ConnectionLine x1={250} y1={210} x2={250} y2={60}  color="#60A5FA" delay={1.4} />

        {/* Pulsing node dots */}
        <NodeDot cx={80}  cy={110} color="#3B82F6" delay={1.0} />
        <NodeDot cx={420} cy={130} color="#3B82F6" delay={1.2} />
        <NodeDot cx={400} cy={300} color="#10B981" delay={1.4} />
        <NodeDot cx={100} cy={320} color="#10B981" delay={1.6} />
        <NodeDot cx={250} cy={60}  color="#60A5FA" delay={1.8} />
        <NodeDot cx={460} cy={210} color="#3B82F6" delay={2.0} />
        <NodeDot cx={40}  cy={210} color="#3B82F6" delay={2.2} />

        {/* Data confidence bar – top center */}
        <rect x={195} y={36} width={110} height={38} rx={6} fill="#1E293B" stroke="#334155" strokeWidth={1} />
        <text x={207} y={53} fill="#64748B" fontSize={8} fontFamily="Inter, sans-serif" letterSpacing="0.08em">PLAN WEEK</text>
        <text x={207} y={67} fill="#F8FAFC" fontSize={11} fontWeight="500" fontFamily="Inter, sans-serif">3 of 4 ✓</text>
      </svg>

      {/* Floating metric cards */}
      <FloatingCard label="BODY FAT"    value="18.4%"  color="#F8FAFC" delay={0.9}  x="2%"  y="18%" floatY={7} />
      <FloatingCard label="WEEKLY VOL." value="14,280" color="#F8FAFC" delay={1.1}  x="69%" y="20%" floatY={6} />
      <FloatingCard label="PROTEIN"     value="186g"   color="#10B981" delay={1.3}  x="69%" y="61%" floatY={8} />
      <FloatingCard label="STREAK"      value="21d"    color="#F59E0B" delay={1.5}  x="2%"  y="63%" floatY={5} />

      {/* Central AI orb */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
          transition={shouldReduceMotion ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          className="relative flex h-20 w-20 items-center justify-center"
        >
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 blur-lg" />
          {/* Rotating outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[#3B82F6]/30"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{
              borderTopColor: '#3B82F6',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              borderWidth: '1.5px',
            }}
          />
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border border-[#3B82F6]/40" />
          {/* Core */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#3B82F6]/60 bg-[#1E293B]">
            <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
              <path d="M8 22L16 10L24 22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="10" r="2" fill="#60A5FA" />
              <circle cx="8"  cy="22" r="2" fill="#3B82F6" />
              <circle cx="24" cy="22" r="2" fill="#3B82F6" />
            </svg>
          </div>
        </motion.div>

        {/* Scan line */}
        {!shouldReduceMotion && <ScanLine />}
      </div>

      {/* AI Coach Active badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#064E3B]/60 px-3.5 py-1.5 backdrop-blur-sm">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#10B981]"
            animate={shouldReduceMotion ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-[#10B981]">AI Coach Active</span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const fadeVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : fadeUp

  const containerVariants = shouldReduceMotion ? {} : staggerParent(0.1, 0)

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[#0F172A] pt-24 md:pt-28"
      aria-label="Hero"
    >
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `radial-gradient(circle, #94A3B8 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      {/* Top radial gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className="h-[640px] w-[900px] rounded-full bg-[#3B82F6]/7 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeVariant}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-[#60A5FA]">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]"
                animate={shouldReduceMotion ? {} : { opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              AI-Powered Fitness Coaching
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeVariant}
            className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            The world&apos;s most{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#93C5FD] bg-clip-text text-transparent">
              intelligent
            </span>{' '}
            AI fitness coach.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeVariant}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-[#94A3B8] sm:text-xl"
          >
            Zyvora analyzes your physique, builds a fully personalized training and nutrition plan,
            and adapts intelligently every week — like having an elite coach who never forgets a detail.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeVariant}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                id="hero-cta-primary"
                className="group flex h-12 items-center gap-2 rounded-lg bg-[#3B82F6] px-7 text-base font-semibold text-white transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_0_28px_0_rgba(59,130,246,0.5)]"
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <button
                type="button"
                id="hero-cta-demo"
                className="flex h-12 items-center gap-2.5 rounded-lg border border-[#334155] px-6 text-base font-medium text-[#94A3B8] transition-all duration-200 hover:border-[#475569] hover:text-white"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#475569] transition-colors group-hover:border-[#3B82F6]">
                  <Play className="h-2.5 w-2.5 fill-current" />
                </span>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Trust note */}
          <motion.p variants={fadeVariant} className="mt-5 text-sm text-[#475569]">
            No credit card required · Cancel anytime
          </motion.p>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0, 0, 0.2, 1] }}
          className="mt-16"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}
