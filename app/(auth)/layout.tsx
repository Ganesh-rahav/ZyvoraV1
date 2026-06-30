import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Zyvora',
  },
}

// Auth layout — centered card container, no app navigation
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
