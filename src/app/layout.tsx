// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/menu_sidebar'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'Meu App ShadCN',
  description: 'Sidebar Responsiva com Next.js + ShadCN',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        <ThemeProvider>
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-6 bg-gray-100 min-h-screen">
          {children}
        </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
