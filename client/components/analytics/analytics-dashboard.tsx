'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'

export function AnalyticsDashboard() {
  // Mock data
  const availabilityData = [
    { month: 'Jul', percentage: 92 },
    { month: 'Aug', percentage: 88 },
    { month: 'Sep', percentage: 94 },
    { month: 'Oct', percentage: 85 },
    { month: 'Nov', percentage: 89 },
  ]

  const positionMinutes = [
    { position: 'GK', minutes: 1080 },
    { position: 'DEF', minutes: 4320 },
    { position: 'MID', minutes: 3240 },
    { position: 'FWD', minutes: 2160 },
  ]

  const injuryTypes = [
    { type: 'Hamstring', count: 5, percentage: 33 },
    { type: 'Knee', count: 4, percentage: 27 },
    { type: 'Ankle', count: 3, percentage: 20 },
    { type: 'Other', count: 3, percentage: 20 },
  ]

  const maxMinutes = Math.max(...positionMinutes.map(p => p.minutes))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">View squad performance and injury trends.</p>
        </div>
        <Button variant="outline">
          <Download className="size-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Squad Availability</h3>
            <TrendingUp className="size-5 text-accent-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">89%</p>
          <p className="text-xs text-muted-foreground">+4% from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Injuries</h3>
            <TrendingDown className="size-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">3</p>
          <p className="text-xs text-muted-foreground">-2 from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Minutes/Player</h3>
            <TrendingUp className="size-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">73</p>
          <p className="text-xs text-muted-foreground">Per match this season</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Matches</h3>
            <TrendingUp className="size-5 text-info-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">12</p>
          <p className="text-xs text-muted-foreground">This season</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Availability Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Availability % Over Time</h3>
            <Button variant="ghost" size="sm">View Details</Button>
          </div>
          <div className="space-y-4">
            {availabilityData.map((item) => (
              <div key={item.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.month}</span>
                  <span className="font-medium text-foreground">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-foreground rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Minutes by Position */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Minutes by Position</h3>
            <Button variant="ghost" size="sm">View Details</Button>
          </div>
          <div className="space-y-4">
            {positionMinutes.map((item) => (
              <div key={item.position} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.position}</span>
                  <span className="font-medium text-foreground">{item.minutes} min</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(item.minutes / maxMinutes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Injuries by Type */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Injuries by Type</h3>
          <Button variant="ghost" size="sm">View Details</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {injuryTypes.map((item) => (
            <div key={item.type} className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">{item.type}</p>
              <p className="text-2xl font-bold text-foreground mb-1">{item.count}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
