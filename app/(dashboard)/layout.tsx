import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Zyvora',
  },
}

// Authenticated app layout — navigation scaffold (full UI Sprint 2+)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation placeholder */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-display font-bold gradient-text">Zyvora</span>
          <span className="text-xs text-muted-foreground">Nav — Sprint 2</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-8">{children}</main>

      {/* Footer placeholder */}
      <footer className="border-t border-border py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zyvora. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
