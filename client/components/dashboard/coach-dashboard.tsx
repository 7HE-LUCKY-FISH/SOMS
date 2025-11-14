import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Calendar, Users, AlertCircle } from 'lucide-react'

interface CoachDashboardProps {
  user: User
}

export function CoachDashboard({ user }: CoachDashboardProps) {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your team today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/squad/lineup">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Create Lineup</h3>
                <p className="text-sm text-muted-foreground">Build your next match lineup</p>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="size-5 text-primary" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Schedule Match</h3>
                <p className="text-sm text-muted-foreground">Add a new fixture</p>
              </div>
              <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Calendar className="size-5 text-accent-foreground" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/squad/roster">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Manage Roster</h3>
                <p className="text-sm text-muted-foreground">View and edit your squad</p>
              </div>
              <div className="size-10 rounded-xl bg-info/20 flex items-center justify-center">
                <Users className="size-5 text-info-foreground" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Next Match</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Opponent</span>
              <span className="font-medium text-foreground">City FC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">Nov 16, 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Venue</span>
              <span className="font-medium text-foreground">Home</span>
            </div>
          </div>
          <Button className="w-full mt-4" size="sm">View Details</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Squad Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="font-medium text-accent-foreground">23 players</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Doubtful</span>
              <span className="font-medium text-warning-foreground">2 players</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Injured</span>
              <span className="font-medium text-destructive">3 players</span>
            </div>
          </div>
          <Link href="/squad/roster">
            <Button variant="outline" className="w-full mt-4" size="sm">View Roster</Button>
          </Link>
        </Card>

        <Card className="p-6 border-warning/20 bg-warning/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="size-5 text-warning-foreground mt-0.5" />
            <h3 className="font-semibold text-foreground">Unavailable Players</h3>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium text-foreground">Marcus Silva</p>
              <p className="text-muted-foreground text-xs">Knee injury - Out 2 weeks</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">James Wilson</p>
              <p className="text-muted-foreground text-xs">Ankle sprain - Doubtful</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Tom Anderson</p>
              <p className="text-muted-foreground text-xs">Hamstring - Out 1 week</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
