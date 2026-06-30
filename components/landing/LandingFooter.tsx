import Link from 'next/link'

const footerNav = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
}

function FooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#3B82F6]">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
          <path
            d="M4 14L10 6L16 14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-sm font-bold tracking-tight text-white">ZYVORA</span>
    </div>
  )
}

export function LandingFooter() {
  return (
    <footer
      className="border-t border-[#1E293B] bg-[#0A0F1E]"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <FooterLogo />
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              From Potential to Physique. AI-powered fitness coaching for everyone.
            </p>
            {/* Social placeholders */}
            <div className="mt-5 flex gap-3" aria-label="Social links">
              {['X', 'IG', 'YT'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={`Zyvora on ${s}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#1E293B] text-[10px] font-bold text-[#475569] transition-colors hover:border-[#334155] hover:text-[#94A3B8]"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Product
            </p>
            <ul className="flex flex-col gap-3" role="list">
              {footerNav.product.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#64748B] transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Account
            </p>
            <ul className="flex flex-col gap-3" role="list">
              {footerNav.account.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#64748B] transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Legal
            </p>
            <ul className="flex flex-col gap-3" role="list">
              {footerNav.legal.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[#64748B] transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1E293B] pt-8 sm:flex-row">
          <p className="text-xs text-[#334155]">
            © {new Date().getFullYear()} Zyvora. All rights reserved.
          </p>
          <p className="text-xs text-[#334155]">
            AI coaching is not a substitute for medical advice.{' '}
            <a href="#" className="underline hover:text-[#64748B]">
              Disclaimer
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
