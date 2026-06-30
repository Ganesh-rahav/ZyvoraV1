import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — class name utility.
 * Combines clsx (conditional class logic) with tailwind-merge
 * (resolves conflicting Tailwind classes). Standard shadcn/ui pattern.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
