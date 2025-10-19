'use client'

import { BookOpen, Code2, Heart, LayoutDashboard, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Spellbooks', href: '/spellbooks', icon: BookOpen },
  { name: 'All Spells', href: '/explore', icon: Code2 },
  { name: 'Runes', href: '/dashboard/runes', icon: Sparkles },
  { name: 'Favorites', href: '/favorites', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center  space-x-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Spellbook</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Spellbook v1.0</p>
          <p className="mt-1">Built with ✨</p>
        </div>
      </div>
    </aside>
  )
}
