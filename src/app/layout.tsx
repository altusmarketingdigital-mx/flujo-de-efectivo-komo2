import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
