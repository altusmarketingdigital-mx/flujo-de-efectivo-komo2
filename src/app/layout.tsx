import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 pb-20`}>
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  )
}
