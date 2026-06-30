'use client'

import { useCallback, useRef, useState } from 'react'
import { useOnboarding } from '@/contexts/onboarding-context'
import { ProgressHeader } from './ui/ProgressHeader'
import { StepWrapper } from './ui/StepWrapper'
import { NavigationControls } from './ui/NavigationControls'
import { WelcomeStep }          from './steps/WelcomeStep'
import { DemographicsStep }     from './steps/DemographicsStep'
import { GoalStep }             from './steps/GoalStep'
import { MotivationStep }       from './steps/MotivationStep'
import { ExperienceStep }       from './steps/ExperienceStep'
import { ScheduleStep }         from './steps/ScheduleStep'
import { EnvironmentStep }      from './steps/EnvironmentStep'
import { EquipmentStep }        from './steps/EquipmentStep'
import { LifestyleStep }        from './steps/LifestyleStep'
import { NutritionStep }        from './steps/NutritionStep'
import { HealthStep }           from './steps/HealthStep'
import { CoachPersonalityStep } from './steps/CoachPersonalityStep'
import { SummaryStep }          from './steps/SummaryStep'
import { PreparationStep }      from './steps/PreparationStep'
import type { OnboardingData, StepProps } from '@/types/onboarding'

// ─── Step definitions ─────────────────────────────────────────────────────────
interface InternalStep {
  id: string
  progressLabel: string
  component: React.ComponentType<StepProps & { onEditStep?: (n: number) => void }>
  isSpecial?: 'welcome' | 'preparation' | 'summary'
}

const STEP_DEFS: InternalStep[] = [
  { id: 'welcome',      progressLabel: 'Ready to begin?',                    component: WelcomeStep as never,           isSpecial: 'welcome' },
  { id: 'demographics', progressLabel: 'Building your coaching profile...',  component: DemographicsStep },
  { id: 'goal',         progressLabel: 'Understanding your goals...',        component: GoalStep },
  { id: 'motivation',   progressLabel: 'Learning what drives you...',        component: MotivationStep },
  { id: 'experience',   progressLabel: 'Calibrating your experience...',     component: ExperienceStep },
  { id: 'schedule',     progressLabel: 'Mapping your schedule...',           component: ScheduleStep },
  { id: 'environment',  progressLabel: 'Setting up your training space...',  component: EnvironmentStep },
  { id: 'equipment',    progressLabel: 'Cataloguing your equipment...',      component: EquipmentStep },
  { id: 'lifestyle',    progressLabel: 'Understanding your lifestyle...',    component: LifestyleStep },
  { id: 'nutrition',    progressLabel: 'Learning your nutrition style...',   component: NutritionStep },
  { id: 'health',       progressLabel: 'Noting health considerations...',    component: HealthStep },
  { id: 'personality',  progressLabel: 'Configuring your coaching style...', component: CoachPersonalityStep },
  { id: 'summary',      progressLabel: 'Review and confirm...',              component: SummaryStep as never, isSpecial: 'summary' },
  { id: 'preparation',  progressLabel: 'Preparing your AI coach...',         component: PreparationStep as never, isSpecial: 'preparation' },
]

// ─── Engine ───────────────────────────────────────────────────────────────────
export function OnboardingEngine() {
  // ──── All hooks FIRST — before any early returns ────────────────────────────
  const { state, updateData, nextStep, prevStep, goToStep } = useOnboarding()
  const { currentStep, data } = state

  const [stepValid, setStepValid] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const navScrollRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback((updates: Partial<OnboardingData>) => {
    updateData(updates)
  }, [updateData])

  const handleValidChange = useCallback((valid: boolean) => {
    setStepValid(valid)
  }, [])

  const handleNext = useCallback(() => {
    setDirection('forward')
    setStepValid(false)
    nextStep(STEP_DEFS.length)
    navScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [nextStep])

  const handleBack = useCallback(() => {
    setDirection('backward')
    setStepValid(true)
    prevStep()
    navScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [prevStep])

  const handleEditStep = useCallback((step: number) => {
    setDirection('backward')
    setStepValid(true)
    goToStep(step)
  }, [goToStep])

  // ──── Derived values (safe after all hooks) ──────────────────────────────────
  const currentDef = STEP_DEFS[currentStep]
  if (!currentDef) return null

  const isWelcome     = currentDef.isSpecial === 'welcome'
  const isPreparation = currentDef.isSpecial === 'preparation'
  const isSummary     = currentDef.isSpecial === 'summary'
  const isLastContent = currentStep === STEP_DEFS.length - 2

  const progressStep  = Math.max(0, currentStep - 1)
  const totalProgress = STEP_DEFS.length - 2

  const StepComponent = currentDef.component as React.ComponentType<
    StepProps & { onBegin?: () => void; onEditStep?: (n: number) => void }
  >

  return (
    <div ref={navScrollRef} className="flex min-h-screen flex-col bg-[#0F172A]">
      {/* Top bar — progress header */}
      {!isWelcome && !isPreparation && (
        <header className="sticky top-0 z-10 border-b border-[#1E293B]/60 bg-[#0F172A]/90 pb-4 pt-6 backdrop-blur-sm">
          <div className="mx-auto mb-4 max-w-2xl px-4">
            <span className="font-display text-base font-bold tracking-tight text-white">Zyvora</span>
          </div>
          <ProgressHeader
            currentStep={progressStep}
            totalSteps={totalProgress}
            progressLabel={currentDef.progressLabel}
          />
        </header>
      )}

      {/* Step content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8" id="onboarding-main">
        {isWelcome ? (
          <WelcomeStep onBegin={handleNext} />
        ) : isPreparation ? (
          <PreparationStep />
        ) : (
          <StepWrapper stepKey={currentStep} direction={direction}>
            <div className="pb-8">
              <StepComponent
                data={data}
                onChange={handleChange}
                onValidChange={handleValidChange}
                onBegin={handleNext}
                onEditStep={handleEditStep}
              />
            </div>
          </StepWrapper>
        )}
      </main>

      {/* Bottom navigation */}
      {!isWelcome && !isPreparation && (
        <footer className="sticky bottom-0 z-10 border-t border-[#1E293B]/60 bg-[#0F172A]/90 px-4 py-4 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <NavigationControls
              onBack={handleBack}
              onNext={isSummary
                ? () => { setDirection('forward'); nextStep(STEP_DEFS.length) }
                : stepValid ? handleNext : undefined!
              }
              isFirstStep={currentStep === 1}
              isLastStep={isLastContent}
              canProceed={stepValid}
              nextLabel={isSummary ? 'Build My Plan' : undefined}
            />
          </div>
        </footer>
      )}
    </div>
  )
}
