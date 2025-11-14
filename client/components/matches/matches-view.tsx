'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CalendarIcon, MapPin } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Match {
  id: string
  opponent: string
  competition: string
  venue: 'Home' | 'Away'
  date: string
  time: string
  status: 'upcoming' | 'completed'
  result?: string
}

const mockMatches: Match[] = [
  {
    id: '1',
    opponent: 'City FC',
    competition: 'League',
    venue: 'Home',
    date: '2025-11-16',
    time: '15:00',
    status: 'upcoming'
  },
  {
    id: '2',
    opponent: 'Rangers SC',
    competition: 'Cup',
    venue: 'Away',
    date: '2025-11-20',
    time: '19:00',
    status: 'upcoming'
  },
  {
    id: '3',
    opponent: 'United FC',
    competition: 'League',
    venue: 'Home',
    date: '2025-11-10',
    time: '15:00',
    status: 'completed',
    result: '2 - 1'
  },
  {
    id: '4',
    opponent: 'Athletic Club',
    competition: 'League',
    venue: 'Away',
    date: '2025-11-03',
    time: '18:00',
    status: 'completed',
    result: '3 - 2'
  },
]

interface MatchesViewProps {
  userRole: UserRole
}

export function MatchesView({ userRole }: MatchesViewProps) {
  const canEdit = userRole === 'coach' || userRole === 'admin'
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const upcomingMatches = mockMatches.filter(m => m.status === 'upcoming')
  const completedMatches = mockMatches.filter(m => m.status === 'completed')

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Matches</h1>
          <p className="text-muted-foreground">View fixtures and match results.</p>
        </div>
        {canEdit && (
          <Button>
            <Plus className="size-4 mr-2" />
            Schedule Match
          </Button>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMatches.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No upcoming matches scheduled.</p>
            </Card>
          ) : (
            upcomingMatches.map((match) => (
              <Card key={match.id} className="p-6 hover:border-primary transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`size-12 rounded-xl flex items-center justify-center ${
                        match.venue === 'Home' ? 'bg-primary/10' : 'bg-accent/20'
                      }`}>
                        <MapPin className={`size-6 ${
                          match.venue === 'Home' ? 'text-primary' : 'text-accent-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">vs {match.opponent}</h3>
                        <p className="text-sm text-muted-foreground">{match.competition}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="text-foreground">{match.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          match.venue === 'Home' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-accent/20 text-accent-foreground'
                        }`}>
                          {match.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/matches/${match.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedMatches.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No completed matches yet.</p>
            </Card>
          ) : (
            completedMatches.map((match) => (
              <Card key={match.id} className="p-6 hover:border-primary transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                        <CalendarIcon className="size-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">vs {match.opponent}</h3>
                        <p className="text-sm text-muted-foreground">{match.competition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{match.result}</p>
                        <p className="text-xs text-muted-foreground">Final Score</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground`}>
                          {match.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/matches/${match.id}`}>
                      <Button variant="outline">Match Report</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
