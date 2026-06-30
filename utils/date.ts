/**
 * Date utilities for Zyvora.
 * Uses date-fns for consistent, locale-aware date formatting.
 */
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format an ISO date string to a readable display format.
 * @example formatDate('2026-06-28') → 'Jun 28, 2026'
 */
export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  const date = parseISO(dateString)
  if (!isValid(date)) return 'Invalid date'
  return format(date, pattern)
}

/**
 * Return a relative time description.
 * @example timeAgo('2026-06-27T12:00:00Z') → 'about 1 day ago'
 */
export function timeAgo(dateString: string): string {
  const date = parseISO(dateString)
  if (!isValid(date)) return 'Unknown'
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Return today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if a date string is in the future.
 */
export function isFutureDate(dateString: string): boolean {
  const date = parseISO(dateString)
  return isValid(date) && date > new Date()
}
