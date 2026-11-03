import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { I18nProvider } from '@/lib/i18n/context'
import { Toaster } from '@/components/ui/toaster'
import { PwaRegister } from '@/components/shared/pwa'

export const metadata: Metadata = {
  title: 'Map Cash',
  description: 'Seu dinheiro, mapeado.',
  manifest: '/manifest.json',
  applicationName: 'Map Cash',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Map Cash',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <I18nProvider>
            {children}
            <Toaster />
            <PwaRegister />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
