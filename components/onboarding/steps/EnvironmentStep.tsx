'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, TrainingEnvironment } from '@/types/onboarding'

const environments: { id: TrainingEnvironment; icon: string; label: string; description: string; badge: string }[] = [
  {
    id: 'gym',
    icon: '🏋️',
    label: 'Commercial Gym',
    description: 'Full access — barbells, cables, machines, cardio equipment.',
    badge: 'Most versatile',
  },
  {
    id: 'home',
    icon: '🏠',
    label: 'Home Gym',
    description: 'Training at home or without gym access. Equipment varies — you\'ll specify next.',
    badge: 'Fully supported',
  },
  {
    id: 'hybrid',
    icon: '🔄',
    label: 'Hybrid',
    description: 'Mix of gym and home. Your coach will build a plan that works across both.',
    badge: 'Adaptive',
  },
]

export function EnvironmentStep({ data, onChange, onValidChange }: StepProps) {
  useEffect(() => {
    onValidChange(Boolean(data.trainingEnvironment))
  }, [data.trainingEnvironment, onValidChange])

  return (
    <div className="space-y-6">
      <StepQuestion
        question="Where do you train?"
        subtitle="Your environment shapes exercise selection. Every option is fully supported."
        helper="Equipment availability is one of the most important variables in program design. A gym plan and a home plan are fundamentally different programs — not the same program with substitutions bolted on."
      />

      <div className="flex flex-col gap-3">
        {environments.map((env) => (
          <button
            key={env.id}
            type="button"
            onClick={() => onChange({ trainingEnvironment: env.id })}
            className={`relative flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-150 ${
              data.trainingEnvironment === env.id
                ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
            }`}
          >
            {/* Badge */}
            <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              data.trainingEnvironment === env.id
                ? 'bg-[#3B82F6]/20 text-[#60A5FA]'
                : 'bg-[#1E293B] text-[#475569]'
            }`}>
              {env.badge}
            </span>

            <span className="text-2xl" role="img" aria-hidden="true">{env.icon}</span>
            <div>
              <p className={`font-semibold ${data.trainingEnvironment === env.id ? 'text-white' : 'text-[#CBD5E1]'}`}>{env.label}</p>
              <p className="mt-0.5 text-sm text-[#64748B]">{env.description}</p>
            </div>
          </button>
        ))}
      </div>

      {data.trainingEnvironment && (
        <p className="text-center text-xs text-[#475569]">
          {data.trainingEnvironment === 'gym'
            ? 'Next, you\'ll specify which equipment your gym has.'
            : data.trainingEnvironment === 'home'
            ? 'Next, you\'ll tell us what you have at home.'
            : 'Next, you\'ll specify equipment for both environments.'}
        </p>
      )}
    </div>
  )
}
