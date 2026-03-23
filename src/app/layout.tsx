// ─────────────────────────────────────────────────────────
// app/layout.tsx — Layout raíz con tema, fuentes y PWA
// ─────────────────────────────────────────────────────────
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-sans',
  display:  'swap',
})

const syne = Syne({
  subsets:  ['latin'],
  variable: '--font-display',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Dark Kitchen — Lomitos, Burgers y Milanesas',
  description: 'Pedí online o retirá en el local. El Club del Lomito · La Burger Club · Milanesa · Brolas',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:           true,
    statusBarStyle:    'default',
    title:             'Dark Kitchen',
  },
  icons: {
    icon:  '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor:          '#FF6B35',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} font-sans bg-[#f5f3ef] text-[#1a1a1a] antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#242424',
              color:      '#f0ede8',
              border:     '1px solid #2e2e2e',
              fontFamily: 'var(--font-sans)',
              fontSize:   '14px',
            },
          }}
        />
      </body>
    </html>
  )
}