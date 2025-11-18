'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/lib/auth'
import { logout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Shield, LayoutDashboard, Users, UserCircle, Activity, Calendar, BarChart3, Settings, LogOut, Menu, X, Home } from 'lucide-react'
import { useState } from 'react'

interface DashboardNavProps {
  user: User
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const showHomeButton = pathname !== '/dashboard'

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['coach', 'medical', 'player', 'admin'] },
    { href: '/squad/lineup', label: 'Lineup Builder', icon: Shield, roles: ['coach', 'admin'] },
    { href: '/squad/roster', label: 'Roster', icon: Users, roles: ['coach', 'medical', 'player', 'admin'] },
    { href: '/players', label: 'Players', icon: UserCircle, roles: ['coach', 'medical', 'player', 'admin'] },
    { href: '/matches', label: 'Matches', icon: Calendar, roles: ['coach', 'medical', 'player', 'admin'] },
    { href: '/medical', label: 'Medical Center', icon: Activity, roles: ['coach', 'medical', 'admin'] },
    { href: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
  ]

  const visibleNavItems = navItems.filter(item => item.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 size-10 rounded-xl bg-card border border-border flex items-center justify-center"
      >
        {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {showHomeButton && (
        <Link href="/dashboard" className="lg:hidden fixed top-4 right-4 z-50">
          <Button size="icon" className="rounded-xl">
            <Home className="size-5" />
          </Button>
        </Link>
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-card border-r border-border flex flex-col
        fixed lg:sticky top-0 h-screen z-40
        transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="size-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl text-foreground">SOMS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className="size-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="size-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
