import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Re:Book - Échangez vos livres',
  description: 'Re:Book est la plateforme simple pour échanger vos livres gratuitement avec d\'autres lecteurs.',
  icons: {
    icon: 'https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/favicon.png',
    apple: 'https://hxpmqzzstnjhmmvalflj.supabase.co/storage/v1/object/public/assets/favicon.png',
  },
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