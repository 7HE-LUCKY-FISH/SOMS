'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CalendarIcon, MapPin, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'
import { apiGetAllFixtures, apiGetUpcomingFixtures } from '@/lib/api'

interface Match {
  match_id: number
  name: string
  venue: string
  match_time: string
  opponent_team: string
  match_date: string
  result?: string
}

interface MatchesViewProps {
  userRole: UserRole
}

export function MatchesView({ userRole }: MatchesViewProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canEdit = userRole === 'coach' || userRole === 'admin'

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true)
        const response = await apiGetAllFixtures()
        if (response.data) {
          setMatches(response.data)
        }
      } catch (err) {
        console.error('[v0] Error fetching matches:', err)
        setError('Failed to load matches')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const upcomingMatches = matches.filter(m => !m.result)
  const completedMatches = matches.filter(m => m.result)

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-muted-foreground">Loading matches...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

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
              <Card key={match.match_id} className="p-6 hover:border-primary transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`size-12 rounded-xl flex items-center justify-center ${
                        match.venue.toLowerCase().includes('home') ? 'bg-primary/10' : 'bg-accent/20'
                      }`}>
                        <MapPin className={`size-6 ${
                          match.venue.toLowerCase().includes('home') ? 'text-primary' : 'text-accent-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">vs {match.opponent_team}</h3>
                        <p className="text-sm text-muted-foreground">{match.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {new Date(match.match_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="text-foreground">{match.match_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          match.venue.toLowerCase().includes('home')
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-accent/20 text-accent-foreground'
                        }`}>
                          {match.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/matches/${match.match_id}`}>
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
              <Card key={match.match_id} className="p-6 hover:border-primary transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                        <CalendarIcon className="size-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1">vs {match.opponent_team}</h3>
                        <p className="text-sm text-muted-foreground">{match.name}</p>
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
                          {new Date(match.match_date).toLocaleDateString('en-US', { 
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
                    <Link href={`/matches/${match.match_id}`}>
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
