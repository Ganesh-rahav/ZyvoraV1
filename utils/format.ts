/**
 * Number and unit formatting utilities for Zyvora.
 */

/**
 * Format a weight value with the correct unit label.
 * Zyvora stores weights in kg internally.
 */
export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${(kg * 2.20462).toFixed(1)} lbs`
  }
  return `${kg.toFixed(1)} kg`
}

/**
 * Format a measurement in centimeters.
 */
export function formatMeasurement(cm: number, unit: 'cm' | 'in' = 'cm'): string {
  if (unit === 'in') {
    return `${(cm / 2.54).toFixed(1)}"`
  }
  return `${cm.toFixed(1)} cm`
}

/**
 * Format a percentage with one decimal point.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate BMI from height (cm) and weight (kg).
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Format currency for billing displays.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
