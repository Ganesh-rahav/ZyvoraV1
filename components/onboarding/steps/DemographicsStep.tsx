'use client'

import { useEffect, useState } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps } from '@/types/onboarding'

export function DemographicsStep({ data, onChange, onValidChange }: StepProps) {
  const [units, setUnits] = useState(data.units ?? 'metric')

  const isMetric = units === 'metric'

  // Sync local unit state up
  useEffect(() => {
    onChange({ units })
  }, [units]) // eslint-disable-line react-hooks/exhaustive-deps

  // Validate
  useEffect(() => {
    const valid = Boolean(
      data.firstName?.trim() &&
      data.biologicalSex &&
      (data.heightCm ?? 0) > 0 &&
      (data.weightKg ?? 0) > 0
    )
    onValidChange(valid)
  }, [data.firstName, data.biologicalSex, data.heightCm, data.weightKg, onValidChange])

  // Unit conversions for display
  const displayHeight = isMetric
    ? data.heightCm ?? ''
    : data.heightCm ? Math.round(data.heightCm / 2.54) : ''

  const displayWeight = isMetric
    ? data.weightKg ?? ''
    : data.weightKg ? Math.round(data.weightKg * 2.2046) : ''

  const handleHeight = (val: string) => {
    const n = parseFloat(val)
    if (isNaN(n)) { onChange({ heightCm: 0 }); return }
    onChange({ heightCm: isMetric ? n : Math.round(n * 2.54) })
  }

  const handleWeight = (val: string) => {
    const n = parseFloat(val)
    if (isNaN(n)) { onChange({ weightKg: 0 }); return }
    onChange({ weightKg: isMetric ? n : Math.round(n / 2.2046) })
  }

  return (
    <div className="space-y-6">
      <StepQuestion
        question="Tell me a bit about yourself."
        subtitle="A few basics help your coach calibrate everything from calorie targets to workout intensity."
        helper="Your biological sex and body metrics are used for precise TDEE calculation (Katch-McArdle formula). Age adjusts baseline metabolic rate. Nothing here is shared externally."
      />

      {/* Units toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#1E293B]/40 p-1 w-fit">
        {(['metric', 'imperial'] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnits(u)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-150 ${
              units === u
                ? 'bg-[#3B82F6] text-white'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {u === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, in)'}
          </button>
        ))}
      </div>

      {/* First name */}
      <div>
        <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
          First name <span className="text-[#EF4444]">*</span>
        </label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          value={data.firstName ?? ''}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="What should your coach call you?"
          className="h-12 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 text-sm text-white placeholder-[#475569] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>

      {/* Sex */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#CBD5E1]">
          Biological sex <span className="text-[#EF4444]">*</span>
        </p>
        <div className="flex gap-3">
          {(['male', 'female'] as const).map((sex) => (
            <button
              key={sex}
              type="button"
              onClick={() => onChange({ biologicalSex: sex })}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-all duration-150 capitalize ${
                data.biologicalSex === sex
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-[#94A3B8]'
              }`}
            >
              {sex}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-[#475569]">Used for calorie calculation only — not displayed anywhere in the app.</p>
      </div>

      {/* Height + Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="height" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
            Height {isMetric ? '(cm)' : '(in)'} <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="height"
            type="number"
            value={displayHeight}
            onChange={(e) => handleHeight(e.target.value)}
            placeholder={isMetric ? '175' : '69'}
            min={isMetric ? 100 : 40}
            max={isMetric ? 250 : 100}
            className="h-12 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 font-mono text-sm text-white placeholder-[#475569] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div>
          <label htmlFor="weight" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
            Weight {isMetric ? '(kg)' : '(lbs)'} <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="weight"
            type="number"
            value={displayWeight}
            onChange={(e) => handleWeight(e.target.value)}
            placeholder={isMetric ? '80' : '176'}
            min={isMetric ? 30 : 66}
            max={isMetric ? 300 : 660}
            className="h-12 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 font-mono text-sm text-white placeholder-[#475569] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
      </div>
    </div>
  )
}
