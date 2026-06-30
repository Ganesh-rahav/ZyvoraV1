'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import { ChoiceCard } from '../ui/ChoiceCard'
import type { StepProps, GoalType, TimelineType } from '@/types/onboarding'

const goals: { id: GoalType; icon: string; label: string; description: string }[] = [
  { id: 'lose_fat',       icon: '🔥', label: 'Lose Fat',              description: 'Reduce body fat while preserving muscle mass.' },
  { id: 'build_muscle',   icon: '💪', label: 'Build Muscle',          description: 'Maximize lean muscle growth with a structured surplus.' },
  { id: 'recomposition',  icon: '⚡', label: 'Body Recomposition',    description: 'Lose fat and gain muscle simultaneously.' },
  { id: 'build_strength', icon: '🏋', label: 'Build Strength',        description: 'Increase your 1RM on core lifts with powerlifting focus.' },
  { id: 'improve_health', icon: '❤️', label: 'Improve General Health', description: 'Build consistent habits and feel better every day.' },
]

const timelines: { id: string; label: string }[] = [
  { id: '3_months',   label: '3 months' },
  { id: '6_months',   label: '6 months' },
  { id: '12_months',  label: '12 months' },
  { id: 'no_deadline', label: 'No specific deadline' },
]

export function GoalStep({ data, onChange, onValidChange }: StepProps) {
  useEffect(() => {
    onValidChange(Boolean(data.primaryGoal && data.timeline))
  }, [data.primaryGoal, data.timeline, onValidChange])

  const toggleSecondary = (goal: GoalType) => {
    if (goal === data.primaryGoal) return
    const current = data.secondaryGoals ?? []
    const updated = current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal]
    onChange({ secondaryGoals: updated })
  }

  return (
    <div className="space-y-8">
      <StepQuestion
        question="What is your primary goal?"
        subtitle="Select one. You can add supporting goals below."
        helper="Your primary goal determines your caloric strategy (deficit, surplus, or maintenance), training volume focus, and which metrics your coach tracks most closely."
      />

      {/* Primary goal */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Primary goal">
        {goals.map((g) => (
          <ChoiceCard
            key={g.id}
            id={`goal-primary-${g.id}`}
            selected={data.primaryGoal === g.id}
            onClick={() => onChange({ primaryGoal: g.id })}
            icon={<span role="img" aria-hidden="true">{g.icon}</span>}
            label={g.label}
            description={g.description}
          />
        ))}
      </div>

      {/* Secondary goals */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#64748B]">
          Any supporting goals? <span className="text-[#475569]">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {goals
            .filter((g) => g.id !== data.primaryGoal)
            .map((g) => {
              const selected = (data.secondaryGoals ?? []).includes(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleSecondary(g.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                    selected
                      ? 'border-[#3B82F6]/50 bg-[#3B82F6]/15 text-[#93C5FD]'
                      : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'
                  }`}
                >
                  <span role="img" aria-hidden="true">{g.icon}</span> {g.label}
                </button>
              )
            })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">
          What&apos;s your target timeline? <span className="text-[#EF4444]">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {timelines.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ timeline: t.id as TimelineType })}
              className={`rounded-lg border py-2.5 text-sm font-medium transition-all duration-150 ${
                data.timeline === t.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
