import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Clock } from 'lucide-react'

interface PlayerDashboardProps {
  user: User
}

export function PlayerDashboard({ user }: PlayerDashboardProps) {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your personal dashboard and stats.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Appearances</h3>
            <Calendar className="size-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground mt-1">This season</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Minutes Played</h3>
            <Clock className="size-5 text-accent-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">876</p>
          <p className="text-xs text-muted-foreground mt-1">Avg 73 min/game</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Form Rating</h3>
            <TrendingUp className="size-5 text-info-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">7.2</p>
          <p className="text-xs text-muted-foreground mt-1">Last 5 games</p>
        </Card>
      </div>

      {/* Next Match */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Next Match</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Opponent</span>
            <span className="font-medium text-foreground">City FC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date & Time</span>
            <span className="font-medium text-foreground">Nov 16, 2025 - 3:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Venue</span>
            <span className="font-medium text-foreground">Home Stadium</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Status</span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
              Available
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Performance */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Performance</h3>
        <div className="space-y-3">
          {[
            { opponent: 'United FC', date: 'Nov 10', rating: 7.5, minutes: 90 },
            { opponent: 'Rangers SC', date: 'Nov 3', rating: 7.0, minutes: 65 },
            { opponent: 'Athletic Club', date: 'Oct 27', rating: 7.8, minutes: 90 },
          ].map((match) => (
            <div key={match.date} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-foreground">{match.opponent}</p>
                <p className="text-sm text-muted-foreground">{match.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-semibold text-foreground">{match.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Minutes</p>
                  <p className="font-semibold text-foreground">{match.minutes}'</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
