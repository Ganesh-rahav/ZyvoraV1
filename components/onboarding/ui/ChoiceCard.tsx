'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ChoiceCardProps {
  id: string
  selected: boolean
  onClick: () => void
  icon?: ReactNode
  label: string
  description?: string
  accent?: 'blue' | 'emerald' | 'amber'
  disabled?: boolean
}

const accentMap = {
  blue: {
    ring: 'border-[#3B82F6] bg-[#3B82F6]/10',
    icon: 'bg-[#3B82F6]/15 text-[#60A5FA]',
    dot: 'bg-[#3B82F6]',
  },
  emerald: {
    ring: 'border-[#10B981] bg-[#10B981]/10',
    icon: 'bg-[#10B981]/15 text-[#10B981]',
    dot: 'bg-[#10B981]',
  },
  amber: {
    ring: 'border-[#F59E0B] bg-[#F59E0B]/10',
    icon: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
}

export function ChoiceCard({
  id,
  selected,
  onClick,
  icon,
  label,
  description,
  accent = 'blue',
  disabled = false,
}: ChoiceCardProps) {
  const colors = accentMap[accent]

  return (
    <motion.button
      id={id}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { y: -2, transition: { duration: 0.15 } }}
      whileTap={disabled ? {} : { scale: 0.98, transition: { duration: 0.1 } }}
      className={`relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer'
      } ${
        selected
          ? `${colors.ring} shadow-[0_0_0_1px_rgba(59,130,246,0.2)]`
          : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
      }`}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div
          layoutId={`selected-dot-${id}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute right-3 top-3 h-2 w-2 rounded-full ${colors.dot}`}
        />
      )}

      {/* Icon */}
      {icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg transition-colors duration-200 ${
            selected ? colors.icon : 'bg-[#1E293B] text-[#64748B]'
          }`}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold transition-colors duration-200 ${selected ? 'text-white' : 'text-[#CBD5E1]'}`}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">{description}</p>
        )}
      </div>
    </motion.button>
  )
}
