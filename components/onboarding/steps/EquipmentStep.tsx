'use client'

import { useEffect, useMemo } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, GymEquipment, HomeEquipment } from '@/types/onboarding'

const gymItems: { id: GymEquipment; icon: string; label: string }[] = [
  { id: 'barbells',     icon: '🏋️', label: 'Barbells & Squat Rack' },
  { id: 'dumbbells',    icon: '💪', label: 'Dumbbells' },
  { id: 'cables',       icon: '🔗', label: 'Cable Machines' },
  { id: 'machines',     icon: '⚙️', label: 'Plate-Loaded Machines' },
  { id: 'smith_machine',icon: '🔧', label: 'Smith Machine' },
  { id: 'leg_press',    icon: '🦵', label: 'Leg Press' },
  { id: 'pull_up_bar',  icon: '🔝', label: 'Pull-Up Bar' },
  { id: 'cardio',       icon: '🏃', label: 'Cardio Equipment' },
]

const homeItems: { id: HomeEquipment; icon: string; label: string }[] = [
  { id: 'bodyweight_only', icon: '🤸', label: 'Bodyweight only — no equipment' },
  { id: 'resistance_bands',icon: '🔴', label: 'Resistance Bands' },
  { id: 'dumbbells',       icon: '💪', label: 'Dumbbells' },
  { id: 'kettlebells',     icon: '🔔', label: 'Kettlebells' },
  { id: 'pull_up_bar',     icon: '🔝', label: 'Pull-Up Bar' },
  { id: 'bench',           icon: '🪑', label: 'Adjustable Bench' },
  { id: 'barbell',         icon: '🏋️', label: 'Barbell & Plates' },
]

export function EquipmentStep({ data, onChange, onValidChange }: StepProps) {
  const env = data.trainingEnvironment
  const isHome = env === 'home'
  const isGym  = env === 'gym'
  const isHybrid = env === 'hybrid'

  const gymSel  = useMemo(() => data.gymEquipment  ?? [], [data.gymEquipment])
  const homeSel = useMemo(() => data.homeEquipment ?? [], [data.homeEquipment])

  const toggleGym = (id: GymEquipment) => {
    onChange({ gymEquipment: gymSel.includes(id) ? gymSel.filter((x) => x !== id) : [...gymSel, id] })
  }

  const toggleHome = (id: HomeEquipment) => {
    // Bodyweight-only is exclusive
    if (id === 'bodyweight_only') {
      onChange({ homeEquipment: homeSel.includes(id) ? [] : ['bodyweight_only'] })
      return
    }
    const without = homeSel.filter((x) => x !== 'bodyweight_only')
    onChange({ homeEquipment: without.includes(id) ? without.filter((x) => x !== id) : [...without, id] })
  }

  useEffect(() => {
    const gymValid  = !isGym    || gymSel.length > 0
    const homeValid = !isHome   || homeSel.length > 0
    const hybridValid = !isHybrid || (gymSel.length > 0 && homeSel.length > 0)
    onValidChange(gymValid && homeValid && hybridValid)
  }, [gymSel, homeSel, isGym, isHome, isHybrid, onValidChange])

  const renderGrid = (
    items: { id: string; icon: string; label: string }[],
    selected: string[],
    onToggle: (id: string) => void,
    groupLabel: string
  ) => (
    <div>
      {isHybrid && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#475569]">{groupLabel}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={groupLabel}>
        {items.map((item) => {
          const sel = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={sel}
              onClick={() => onToggle(item.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-150 ${
                sel
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              <span className="text-xl" role="img" aria-hidden="true">{item.icon}</span>
              <span className={`text-xs font-medium leading-tight ${sel ? 'text-[#93C5FD]' : 'text-[#64748B]'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <StepQuestion
        question={isHome ? "What do you have at home?" : isGym ? "What does your gym have?" : "What equipment do you have access to?"}
        subtitle="Select everything available — your coach will only program what you can actually use."
        helper="Accurate equipment information prevents the single most common plan failure: being assigned exercises you can't perform. Every selection narrows or expands which exercises your coach can safely recommend."
      />

      {(isGym || isHybrid) && renderGrid(gymItems, gymSel, (id) => toggleGym(id as GymEquipment), 'Gym Equipment')}
      {(isHome || isHybrid) && renderGrid(homeItems, homeSel, (id) => toggleHome(id as HomeEquipment), 'Home Equipment')}
    </div>
  )
}
