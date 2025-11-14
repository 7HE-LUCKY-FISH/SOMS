'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup, UserRole } from '@/lib/auth'
import { Loader2, Shield, Activity, User, Settings } from 'lucide-react'

const roles: { value: UserRole; label: string; description: string; icon: typeof Shield }[] = [
  {
    value: 'coach',
    label: 'Coach / Manager',
    description: 'Create lineups, manage rosters, track matches',
    icon: Shield
  },
  {
    value: 'medical',
    label: 'Medical Staff',
    description: 'Log injuries, manage availability and recovery',
    icon: Activity
  },
  {
    value: 'player',
    label: 'Player',
    description: 'View stats, schedule, and team information',
    icon: User
  },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Manage users, settings, and all operations',
    icon: Settings
  }
]

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(email, password, name, selectedRole)
      
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <div className="space-y-3">
        <Label>Select Your Role</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === role.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/50'
                } disabled:opacity-50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedRole === role.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground mb-1">{role.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{role.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  )
}
