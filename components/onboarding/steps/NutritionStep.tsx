'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import { ScaleInput } from '../ui/ScaleInput'
import type { StepProps, DietStyle, AllergyType, SupplementType, Scale5 } from '@/types/onboarding'

const diets: { id: DietStyle; icon: string; label: string }[] = [
  { id: 'no_restrictions', icon: '🍽️', label: 'No restrictions' },
  { id: 'vegetarian',      icon: '🥦', label: 'Vegetarian' },
  { id: 'vegan',           icon: '🌱', label: 'Vegan' },
  { id: 'keto',            icon: '🥑', label: 'Keto / Low-carb' },
  { id: 'paleo',           icon: '🍖', label: 'Paleo' },
  { id: 'mediterranean',   icon: '🫒', label: 'Mediterranean' },
  { id: 'halal',           icon: '☪️',  label: 'Halal' },
  { id: 'gluten_free',     icon: '🌾', label: 'Gluten-free' },
]

const allergies: { id: AllergyType; label: string }[] = [
  { id: 'none',     label: 'No allergies' },
  { id: 'gluten',   label: 'Gluten' },
  { id: 'dairy',    label: 'Dairy' },
  { id: 'nuts',     label: 'Tree nuts / Peanuts' },
  { id: 'eggs',     label: 'Eggs' },
  { id: 'soy',      label: 'Soy' },
  { id: 'shellfish',label: 'Shellfish' },
  { id: 'fish',     label: 'Fish' },
]

const supplements: { id: SupplementType; label: string }[] = [
  { id: 'none',           label: 'None currently' },
  { id: 'protein_powder', label: 'Protein powder' },
  { id: 'creatine',       label: 'Creatine' },
  { id: 'pre_workout',    label: 'Pre-workout' },
  { id: 'vitamins',       label: 'Multivitamins / D3' },
  { id: 'omega3',         label: 'Omega-3 / Fish oil' },
  { id: 'bcaa',           label: 'BCAAs / EAAs' },
]

export function NutritionStep({ data, onChange, onValidChange }: StepProps) {
  const selectedAllergies = data.allergies ?? ['none']
  const selectedSupps     = data.supplements ?? ['none']

  const toggleAllergy = (id: AllergyType) => {
    if (id === 'none') { onChange({ allergies: ['none'] }); return }
    const without = selectedAllergies.filter((a) => a !== 'none')
    onChange({ allergies: without.includes(id) ? without.filter((a) => a !== id) : [...without, id] })
  }

  const toggleSupp = (id: SupplementType) => {
    if (id === 'none') { onChange({ supplements: ['none'] }); return }
    const without = selectedSupps.filter((s) => s !== 'none')
    onChange({ supplements: without.includes(id) ? without.filter((s) => s !== id) : [...without, id] })
  }

  useEffect(() => {
    onValidChange(Boolean(data.dietStyle && (data.mealFrequency ?? 0) > 0))
  }, [data.dietStyle, data.mealFrequency, onValidChange])

  return (
    <div className="space-y-8">
      <StepQuestion
        question="How do you eat?"
        subtitle="Nutrition is 70% of the result. Your coach needs to know the canvas."
        helper="Dietary style determines which macro ratio frameworks are appropriate. Allergies prevent dangerous ingredient suggestions. Cooking confidence calibrates whether your coach recommends complex or simple meal approaches."
      />

      {/* Diet style */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">Dietary style <span className="text-[#EF4444]">*</span></p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {diets.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange({ dietStyle: d.id })}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150 ${
                data.dietStyle === d.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              <span className="text-lg" role="img" aria-hidden="true">{d.icon}</span>
              <span className={`text-xs font-medium leading-tight ${data.dietStyle === d.id ? 'text-[#93C5FD]' : 'text-[#64748B]'}`}>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">Food allergies or intolerances</p>
        <div className="flex flex-wrap gap-2">
          {allergies.map((a) => {
            const sel = selectedAllergies.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={sel}
                onClick={() => toggleAllergy(a.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  sel
                    ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#FCA5A5]'
                    : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155]'
                }`}
              >
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Meal frequency */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-[#CBD5E1]">Meals per day <span className="text-[#EF4444]">*</span></p>
          <span className="font-mono text-sm font-bold text-[#3B82F6]">{data.mealFrequency ?? 3}</span>
        </div>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ mealFrequency: n })}
              className={`flex-1 rounded-lg border py-2.5 font-mono text-sm font-semibold transition-all duration-150 ${
                data.mealFrequency === n
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Cooking confidence */}
      <ScaleInput
        id="cooking"
        value={(data.cookingConfidence ?? 3) as Scale5}
        onChange={(v) => onChange({ cookingConfidence: v as Scale5 })}
        label="Cooking confidence"
        lowLabel="I barely boil water"
        highLabel="I enjoy cooking"
      />

      {/* Supplements */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#64748B]">Current supplements <span className="text-[#475569]">(optional)</span></p>
        <div className="flex flex-wrap gap-2">
          {supplements.map((s) => {
            const sel = selectedSupps.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={sel}
                onClick={() => toggleSupp(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  sel
                    ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#6EE7B7]'
                    : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155]'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
