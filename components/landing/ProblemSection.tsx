'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { X } from 'lucide-react'
import { staggerParent, fadeUp, scaleIn } from '@/lib/motion'

const problems = [
  {
    title: 'Everyone gets different advice.',
    body: 'Generic plans ignore your starting point, constraints, and goals. What works for someone else may actively slow you down.',
  },
  {
    title: 'Progress stalls with no explanation.',
    body: "Without intelligent feedback loops, most people plateau within weeks and have no idea why — or what to do about it.",
  },
  {
    title: 'There is no real personalization.',
    body: "Most fitness apps give you a template. They call it \"personalized\" because you entered your age. It isn't.",
  },
  {
    title: 'Coaching is prohibitively expensive.',
    body: 'A qualified personal trainer costs $80–$200 per session. Online coaches start at $150/month. Elite coaching is inaccessible to most people.',
  },
]

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="problem"
      ref={ref}
      className="bg-[#0F172A] py-24 md:py-32"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={staggerParent(0.08)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.span
            variants={fadeUp}
            className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]"
          >
            The Problem
          </motion.span>
          <motion.h2
            id="problem-heading"
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Generic plans don&apos;t work.{' '}
            <span className="text-[#64748B]">They never did.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base leading-relaxed text-[#64748B] sm:text-lg"
          >
            The fitness industry has a personalization problem. Most people fail not because they
            lack willpower — but because they lack an intelligent system that adapts to them.
          </motion.p>
        </motion.div>

        {/* Problem cards */}
        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-2"
          variants={staggerParent(0.1, 0.1)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={scaleIn}
              whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-6 transition-colors duration-200 hover:border-[#334155]"
            >
              {/* Hover corner glow */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#EF4444]/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-[#EF4444]/10">
                <X className="h-4 w-4 text-[#EF4444]" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-white">{problem.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{problem.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
