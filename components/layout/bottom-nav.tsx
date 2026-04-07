'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, ChartNoAxesCombined, User } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/applications', label: 'Histórico', icon: History },
  { href: '/progress', label: 'Progresso', icon: ChartNoAxesCombined },
  { href: '/profile', label: 'Perfil', icon: User }
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white px-3 pb-5 pt-2">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center rounded-lg p-2 text-xs ${pathname === href ? 'text-emerald-600' : 'text-slate-500'}`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
