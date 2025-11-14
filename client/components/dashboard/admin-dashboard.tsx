import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Shield, Activity, Settings } from 'lucide-react'

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
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
          <p className="text-3xl font-bold text-foreground">32</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Players</h3>
            <Shield className="size-5 text-accent-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">28</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Staff</h3>
            <Activity className="size-5 text-info-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">4</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Season</h3>
            <Settings className="size-5 text-warning-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground">2025</p>
        </Card>
      </div>

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
