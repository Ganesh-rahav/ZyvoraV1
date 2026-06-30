'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'

// Note: metadata must be in a server component — register page is client, so
// metadata is declared in the layout or a parallel route.

const passwordRules = [
  { label: '8+ characters',          test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter',   test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number',             test: (p: string) => /\d/.test(p) },
  { label: 'One special character',  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', firstName: '' })
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passRules = passwordRules.map((r) => ({ ...r, passed: r.test(form.password) }))
  const passwordStrong = passRules.every((r) => r.passed)
  const canSubmit = form.email.includes('@') && passwordStrong && agreed && form.firstName.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')

    // Mock auth — Sprint 3C will wire Supabase Auth
    try {
      await new Promise((r) => setTimeout(r, 800))  // Simulate API call
      // On success → onboarding
      router.push('/onboarding')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#1E293B]/60 p-8 shadow-[0_0_60px_0_rgba(0,0,0,0.5)] backdrop-blur-sm">
      {/* Wordmark */}
      <div className="mb-6 text-center">
        <Link href="/" className="font-display text-xl font-bold text-white">
          Zyvora
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-[#64748B]">From Potential to Physique.</p>
      </div>

      {/* Google OAuth — placeholder for Sprint 3C */}
      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#334155] bg-[#1E293B] text-sm font-medium text-[#64748B] opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google (coming soon)
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1E293B]" />
        <span className="text-xs text-[#475569]">or continue with email</span>
        <div className="h-px flex-1 bg-[#1E293B]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* First name */}
        <div>
          <label htmlFor="reg-firstName" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
            First name
          </label>
          <input
            id="reg-firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="Your first name"
            className="h-11 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-4 text-sm text-white placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            className="h-11 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-4 text-sm text-white placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Create a strong password"
              className="h-11 w-full rounded-lg border border-[#334155] bg-[#0F172A] px-4 pr-10 text-sm text-white placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 grid grid-cols-2 gap-1 overflow-hidden"
              role="list"
            >
              {passRules.map((r) => (
                <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.passed ? 'text-[#10B981]' : 'text-[#475569]'}`}>
                  <Check className={`h-3 w-3 ${r.passed ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                  {r.label}
                </li>
              ))}
            </motion.ul>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-3" htmlFor="reg-terms">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                agreed ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-[#334155] bg-[#0F172A]'
              }`}
              aria-hidden="true"
            >
              {agreed && <Check className="h-2.5 w-2.5 text-white" />}
            </div>
          </div>
          <span className="text-xs leading-relaxed text-[#64748B]">
            I agree to the{' '}
            <Link href="/terms" className="text-[#60A5FA] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#60A5FA] hover:underline">Privacy Policy</Link>.
            My coaching data stays private.
          </span>
        </label>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2 text-xs text-[#FCA5A5]" role="alert">
            {error}
          </p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={!canSubmit || loading}
          whileHover={canSubmit && !loading ? { scale: 1.01 } : {}}
          whileTap={canSubmit && !loading ? { scale: 0.98 } : {}}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            canSubmit && !loading
              ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.4)]'
              : 'cursor-not-allowed bg-[#1E293B] text-[#475569]'
          }`}
        >
          {loading ? (
            <>
              <motion.span
                className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </motion.button>
      </form>

      {/* Sign in link */}
      <p className="mt-5 text-center text-sm text-[#64748B]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#60A5FA] hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
