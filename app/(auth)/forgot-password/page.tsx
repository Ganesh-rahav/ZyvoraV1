import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Zyvora account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we will send you a recovery link.
        </p>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Forgot password UI — Sprint 2 scope.
      </p>
    </div>
  )
}
