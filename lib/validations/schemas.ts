/**
 * Zod validation schemas for Zyvora.
 * These schemas are shared between client-side forms and server-side API validation.
 * Single source of truth for all input shapes.
 */
import { z } from 'zod'

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
})

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── Profile Schemas ──────────────────────────────────────────────────────────
export const CreateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val)
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 16 && age <= 80
  }, 'You must be between 16 and 80 years old'),
  biologicalSex: z.enum(['male', 'female']),
  height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height cannot exceed 250cm'),
  currentWeight: z.number().min(30, 'Weight must be at least 30kg').max(300),
  targetWeight: z.number().min(30, 'Target weight must be at least 30kg').max(300),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  equipmentAccess: z.enum(['gym_full', 'gym_basic', 'home_dumbbells', 'home_bodyweight']),
})

export const UpdateProfileSchema = CreateProfileSchema.partial().extend({
  injuriesList: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
})

// ─── Progress Schemas ─────────────────────────────────────────────────────────
export const LogWeightSchema = z.object({
  weightKg: z.number().min(30).max(300),
  date: z.string().refine((val) => {
    const date = new Date(val)
    return date <= new Date()
  }, 'Date cannot be in the future'),
})

// ─── Type exports ─────────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type LogWeightInput = z.infer<typeof LogWeightSchema>
