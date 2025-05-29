// components/sidebar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ThemeProvider } from '@/context/ThemeContext'

const links = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pages/configs', label: 'Configurações' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
   
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-900 text-white">
        <h1 className="text-xl font-bold">Meu App</h1>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? 'block' : 'hidden'
        } md:block bg-gray-900 text-white w-64 min-h-screen p-6 fixed md:relative top-0 left-0 z-50 transition-all`}
      >
        <h2 className="text-2xl font-bold mb-8">Meu App</h2>
        <nav className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 rounded hover:bg-gray-700 transition"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
            
          ))}
        </nav>
      </aside>
    </>
  )
}
