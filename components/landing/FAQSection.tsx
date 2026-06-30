'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'

const faqs = [
  {
    id: 'privacy',
    question: 'Is my data private?',
    answer:
      'Yes. Physique photos are stored in encrypted, private buckets accessible only to you via short-lived URLs (10-minute expiry). Your health data is never sold, shared with advertisers, or used to train external AI models. You can delete everything — account, photos, history — at any time, and we execute deletion within 72 hours.',
  },
  {
    id: 'accuracy',
    question: 'How accurate is the AI physique analysis?',
    answer:
      'AI-based body composition estimation from photos carries an inherent margin of error (approximately ±2–3% body fat). Zyvora displays confidence intervals alongside all estimates so you understand the precision of the data. If you have a DEXA scan or caliper measurement, you can override the AI estimate with your verified value.',
  },
  {
    id: 'beginners',
    question: 'Can beginners use Zyvora?',
    answer:
      'Absolutely. Zyvora is built for all experience levels — beginner through advanced. The onboarding wizard captures your current level, constraints, and goals, and the AI coach adapts its communication style and plan complexity accordingly. Beginners receive structured, progressive programming with clear explanations of every recommendation.',
  },
  {
    id: 'home',
    question: 'Can I train at home?',
    answer:
      'Yes. Zyvora generates plans adapted to your available equipment — full gym, home gym, dumbbells only, or bodyweight. If your equipment access changes, your coach adjusts the plan immediately. All home workout exercises come with written execution cues.',
  },
  {
    id: 'equipment',
    question: 'Do I need gym equipment?',
    answer:
      'No. Zyvora supports bodyweight-only training. You can get a complete, effective program with no equipment at all. If you have some equipment (resistance bands, dumbbells, a pull-up bar), the system incorporates it. The program will always reflect what you actually have access to.',
  },
]

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
  inView,
}: {
  faq: (typeof faqs)[0]
  isOpen: boolean
  onToggle: () => void
  index: number
  inView: boolean
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="border-b border-[#1E293B]"
      initial={{ opacity: 0, x: 16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.12 + index * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] }}
    >
      <button
        type="button"
        id={`faq-btn-${faq.id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${faq.id}`}
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-white transition-colors duration-150 group-hover:text-[#93C5FD]">
          {faq.question}
        </span>
        <motion.span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#334155] text-[#64748B] transition-colors duration-200 group-hover:border-[#3B82F6]/50 group-hover:text-[#3B82F6]"
          animate={shouldReduceMotion ? {} : { rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${faq.id}`}
            role="region"
            aria-labelledby={`faq-btn-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#64748B]">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [openId, setOpenId] = useState<string | null>('privacy')

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section
      id="faq"
      ref={ref}
      className="bg-[#0F172A] py-24 md:py-32"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24">
          {/* Left — sticky header */}
          <div className="md:sticky md:top-24 md:self-start">
            <motion.div
              variants={staggerParent(0.08)}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <motion.span
                variants={fadeUp}
                className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]"
              >
                FAQ
              </motion.span>
              <motion.h2
                id="faq-heading"
                variants={fadeUp}
                className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Questions answered.{' '}
                <span className="text-[#64748B]">Honestly.</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-base leading-relaxed text-[#64748B]"
              >
                If your question isn&apos;t here, your AI coach will be able to answer it once
                you&apos;re inside.
              </motion.p>
            </motion.div>
          </div>

          {/* Right — accordion */}
          <div>
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggle(faq.id)}
                index={i}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
