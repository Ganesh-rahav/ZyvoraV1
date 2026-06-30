'use client'

import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Root Providers wrapper.
 *
 * Stacking order (outermost → innermost):
 *  1. ThemeProvider     — dark/light/system theme via next-themes
 *  2. QueryClientProvider — React Query server state
 *  3. Toaster           — Sonner toast notifications
 */
export function Providers({ children }: ProvidersProps) {
  // Create a stable QueryClient instance per component mount.
  // Using useState prevents sharing state between server renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 60 seconds
            staleTime: 60 * 1000,
            // Cache retained for 5 minutes after component unmount
            gcTime: 5 * 60 * 1000,
            // Retry failed queries twice
            retry: 2,
            // Refetch on window focus (good for session sync)
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
