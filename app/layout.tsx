import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Re:Book - Échangez vos livres',
  description: 'Re:Book est la plateforme simple pour échanger vos livres gratuitement avec d\'autres lecteurs.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  )
}