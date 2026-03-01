import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

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
      <body className={`${poppins.variable} font-sans antialiased bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
