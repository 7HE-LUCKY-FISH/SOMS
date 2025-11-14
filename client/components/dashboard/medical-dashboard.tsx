import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react'

interface MedicalDashboardProps {
  user: User
}

export function MedicalDashboard({ user }: MedicalDashboardProps) {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Overview</h1>
        <p className="text-muted-foreground">Track injuries and player availability.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Injuries</h3>
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-foreground">3</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">RTP This Week</h3>
            <TrendingUp className="size-5 text-accent-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">2</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">High Load Alert</h3>
            <Clock className="size-5 text-warning-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">5</p>
        </Card>
      </div>

      {/* Recent Injuries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">New Injuries to Review</h3>
          <Link href="/medical">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Marcus Silva', injury: 'Knee Ligament Strain', date: '2 days ago', status: 'Out' },
            { name: 'James Wilson', injury: 'Ankle Sprain', date: '5 days ago', status: 'Doubtful' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.injury}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Out' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning-foreground'
                }`}>
                  {item.status}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming RTPs */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-6">Return to Play Due Soon</h3>
        <div className="space-y-4">
          {[
            { name: 'Tom Anderson', injury: 'Hamstring', rtp: 'Nov 20, 2025', progress: 85 },
            { name: 'David Lee', injury: 'Calf Strain', rtp: 'Nov 22, 2025', progress: 70 },
          ].map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.injury}</p>
                </div>
                <span className="text-sm text-muted-foreground">RTP: {item.rtp}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-foreground rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
