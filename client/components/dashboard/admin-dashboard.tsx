'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Shield, Activity, Settings, Loader2 } from 'lucide-react'

interface AdminDashboardProps {
  user: User
}

interface DashboardStats {
  totalUsers: number
  totalPlayers: number
  totalStaff: number
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPlayers: 0,
    totalStaff: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      setIsLoadingStats(true)
      setStatsError(null)

      // Fetch all stats in parallel
      const [usersResponse, playersResponse, staffResponse] = await Promise.all([
        fetch('http://localhost:8000/total_users'),
        fetch('http://localhost:8000/total_staff'),
        fetch('http://localhost:8000/total_players')
      ])

      // Check if all requests succeeded
      if (!usersResponse.ok || !playersResponse.ok || !staffResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      // Parse responses
      const usersData = await usersResponse.json()
      const playersData = await playersResponse.json()
      const staffData = await staffResponse.json()

      setStats({
        totalUsers: usersData.total_count || usersData.data?.total_count || 0,
        totalPlayers: playersData.total_staff || playersData.data?.total_staff || 0,
        totalStaff: staffData.total_players || staffData.data?.total_players || 0
      })
    } catch (err) {
      console.error('[admin-dashboard] Error fetching stats:', err)
      setStatsError('Failed to load statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your organization and system settings.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <Users className="size-5 text-primary" />
          </div>
          {isLoadingStats ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : statsError ? (
            <p className="text-sm text-destructive">{statsError}</p>
          ) : (
            <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Players</h3>
            <Shield className="size-5 text-accent-foreground" />
          </div>
          {isLoadingStats ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : statsError ? (
            <p className="text-sm text-destructive">Error</p>
          ) : (
            <p className="text-3xl font-bold text-foreground">{stats.totalStaff}</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Staff</h3>
            <Activity className="size-5 text-info-foreground" />
          </div>
          {isLoadingStats ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : statsError ? (
            <p className="text-sm text-destructive">Error</p>
          ) : (
            <p className="text-3xl font-bold text-foreground">{stats.totalPlayers}</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Season</h3>
            <Settings className="size-5 text-warning-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground">2025</p>
        </Card>
      </div>

      {/* Error banner if stats failed to load */}
      {statsError && (
        <Card className="p-4 border-destructive/50 bg-destructive/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{statsError}</p>
            <Button size="sm" variant="outline" onClick={fetchDashboardStats}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Manage Users</h3>
                <p className="text-sm text-muted-foreground">Add or edit user accounts</p>
              </div>
              <Users className="size-5 text-primary" />
            </div>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Organization Settings</h3>
                <p className="text-sm text-muted-foreground">Configure club details</p>
              </div>
              <Settings className="size-5 text-accent-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Data Import</h3>
                <p className="text-sm text-muted-foreground">Import player data</p>
              </div>
              <Activity className="size-5 text-info-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New lineup created', user: 'Coach Smith', time: '2 hours ago' },
            { action: 'Player injury logged', user: 'Dr. Johnson', time: '5 hours ago' },
            { action: 'Match scheduled', user: 'Coach Smith', time: '1 day ago' },
            { action: 'New user added', user: 'Admin User', time: '2 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">by {activity.user}</p>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}