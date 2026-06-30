import type { Metadata, Viewport } from 'next'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

// ─── Font Configuration ─────────────────────────────────────────────────────
// Inter: body text — excellent legibility at all sizes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Outfit: display / headings — modern, premium feel
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

// JetBrains Mono: code / data displays
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// ─── Metadata ───────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://zyvora.ai'),
  title: {
    default: 'Zyvora — From Potential to Physique',
    template: '%s | Zyvora',
  },
  description:
    "The world's most trusted AI fitness coach. Personalized workout plans, adaptive nutrition, and a coach that learns you over time.",
  keywords: [
    'AI fitness coach',
    'personalized workout plans',
    'nutrition planning',
    'physique analysis',
    'adaptive coaching',
  ],
  authors: [{ name: 'Zyvora' }],
  creator: 'Zyvora',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zyvora.ai',
    title: 'Zyvora — From Potential to Physique',
    description: 'Elite AI fitness coaching for everyone.',
    siteName: 'Zyvora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zyvora — From Potential to Physique',
    description: 'Elite AI fitness coaching for everyone.',
    creator: '@zyvora',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
