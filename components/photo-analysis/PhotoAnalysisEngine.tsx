'use client'

import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePhotoAnalysis } from '@/contexts/photo-analysis-context'
import { WelcomeScreen }       from './WelcomeScreen'
import { PrivacyScreen }       from './PrivacyScreen'
import { CaptureGuideScreen }  from './CaptureGuideScreen'
import { UploadScreen }        from './UploadScreen'
import { ValidationScreen }    from './ValidationScreen'
import { ImageReview }         from './ImageReview'
import { PreparationScreen }   from './PreparationScreen'
import { SkipDialog }          from './SkipDialog'
import type { PhotoAnalysisStep } from '@/types/photo-analysis'

const STEP_LABELS: Record<PhotoAnalysisStep, string> = {
  welcome:     'Welcome',
  privacy:     'Privacy',
  guide:       'Guide',
  upload:      'Upload',
  validation:  'Validate',
  review:      'Review',
  preparation: 'Prepare',
}

const PROGRESS_STEPS: PhotoAnalysisStep[] = [
  'privacy', 'guide', 'upload', 'validation', 'review', 'preparation',
]

export function PhotoAnalysisEngine() {
  const { state, nextStep, prevStep, setStep, setSkipped } = usePhotoAnalysis()
  const { currentStep } = state
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [showSkip, setShowSkip] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setDirection('forward')
    nextStep()
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [nextStep])

  const goBack = useCallback(() => {
    setDirection('backward')
    prevStep()
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [prevStep])

  const goToStep = useCallback((step: PhotoAnalysisStep) => {
    setDirection('forward')
    setStep(step)
  }, [setStep])

  const handleDone = useCallback(() => {
    // Sprint 4: navigate to AI Analysis screen
    router.push('/dashboard')
  }, [router])

  const handleSkip = useCallback(() => {
    setSkipped(true)
    setShowSkip(false)
    router.push('/dashboard')
  }, [setSkipped, router])

  // ── Slide variants ────────────────────────────────────────────────────────
  const EASE_OUT = [0, 0, 0.2, 1] as [number, number, number, number]
  const EASE_IN  = [0.4, 0, 1, 1] as [number, number, number, number]

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      opacity: 0, x: dir === 'forward' ? 40 : -40,
    }),
    center: {
      opacity: 1, x: 0,
      transition: { duration: 0.35, ease: EASE_OUT },
    },
    exit: (dir: 'forward' | 'backward') => ({
      opacity: 0, x: dir === 'forward' ? -40 : 40,
      transition: { duration: 0.25, ease: EASE_IN },
    }),
  }

  const isWelcome     = currentStep === 'welcome'
  const isPreparation = currentStep === 'preparation'

  // ── Render step ───────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onContinue={goNext}
            onLearnPrivacy={() => goToStep('privacy')}
          />
        )
      case 'privacy':
        return <PrivacyScreen onContinue={goNext} onBack={goBack} />
      case 'guide':
        return <CaptureGuideScreen onContinue={goNext} onBack={goBack} />
      case 'upload':
        return <UploadScreen onContinue={goNext} onBack={goBack} />
      case 'validation':
        return (
          <ValidationScreen
            onContinue={goNext}
            onBack={goBack}
            onRetake={() => goToStep('upload')}
          />
        )
      case 'review':
        return (
          <ImageReview
            onContinue={goNext}
            onRetake={() => goToStep('upload')}
            onReplace={() => goToStep('upload')}
          />
        )
      case 'preparation':
        return <PreparationScreen onDone={handleDone} />
      default:
        return null
    }
  }

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col bg-[#0F172A]">
      {/* ── Top progress header ── */}
      {!isWelcome && !isPreparation && (
        <header className="sticky top-0 z-10 border-b border-[#1E293B]/60 bg-[#0F172A]/90 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-4">
            {/* Wordmark + skip */}
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm font-bold text-white">Zyvora</span>
              <button
                type="button"
                onClick={() => setShowSkip(true)}
                className="text-xs text-[#475569] hover:text-[#94A3B8]"
              >
                Skip for now
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5" role="progressbar" aria-label="Setup progress">
              {PROGRESS_STEPS.map((step, i) => {
                const stepIdx = PROGRESS_STEPS.indexOf(currentStep as PhotoAnalysisStep)
                const isPast    = i < stepIdx
                const isCurrent = step === currentStep
                return (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      isPast    ? 'bg-[#10B981]'
                      : isCurrent ? 'bg-[#3B82F6]'
                      : 'bg-[#1E293B]'
                    }`}
                    aria-label={`${STEP_LABELS[step]}${isPast ? ' (complete)' : isCurrent ? ' (current)' : ''}`}
                  />
                )
              })}
            </div>

            {/* Current label */}
            <p className="mt-2 text-xs text-[#475569]">
              {STEP_LABELS[currentStep]}
            </p>
          </div>
        </header>
      )}

      {/* ── Step content ── */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8" id="photo-analysis-main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Skip dialog ── */}
      <SkipDialog
        isOpen={showSkip}
        onClose={() => setShowSkip(false)}
        onSkip={handleSkip}
      />
    </div>
  )
}
