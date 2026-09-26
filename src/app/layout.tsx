import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Flujo de Efectivo',
  description: 'Sistema ejecutivo de control de finanzas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Finanzas',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-100 text-slate-900 pb-20`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative border-x border-slate-200">
          {children}
        </main>
        <Navbar />
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff' } }} />
      </body>
    </html>
  )
}
