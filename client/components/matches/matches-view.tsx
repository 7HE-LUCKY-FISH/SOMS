'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, CalendarIcon, MapPin, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'
import { apiGetAllMatches, apiCreateMatch } from '@/lib/api'

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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  const canEdit = userRole === 'coach' || userRole === 'admin'

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    try {
      setIsLoading(true)
      const response = await apiGetAllMatches()
      if (response.data) {
        setMatches(response.data)
      }
    } catch (err) {
      console.error('[matches-view] Error fetching matches:', err)
      setError('Failed to load matches')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateMatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      venue: formData.get('venue') as string,
      match_time: formData.get('match_time') as string,
      opponent_team: formData.get('opponent_team') as string,
      match_date: formData.get('match_date') as string,
      result: formData.get('result') as string || undefined,
    }

    try {
      await apiCreateMatch(data)
      setIsCreateOpen(false)
      fetchMatches()
      e.currentTarget.reset()
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create match')
    } finally {
      setIsCreating(false)
    }
  }

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
            <Button onClick={fetchMatches} className="mt-4">
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Schedule Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Match</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Match Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g., League Match Week 12" />
                  </div>
                  <div>
                    <Label htmlFor="opponent_team">Opponent Team *</Label>
                    <Input id="opponent_team" name="opponent_team" required placeholder="e.g., City FC" />
                  </div>
                  <div>
                    <Label htmlFor="venue">Venue *</Label>
                    <Input id="venue" name="venue" required placeholder="e.g., Home, Away" />
                  </div>
                  <div>
                    <Label htmlFor="match_date">Match Date *</Label>
                    <Input id="match_date" name="match_date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="match_time">Match Time *</Label>
                    <Input id="match_time" name="match_time" type="time" required />
                  </div>
                  <div>
                    <Label htmlFor="result">Result (Optional)</Label>
                    <Input id="result" name="result" placeholder="e.g., 2-1, 0-0" />
                  </div>
                </div>
                
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Schedule Match
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                        <span className="text-foreground">
                          {new Date(`1970-01-01T${match.match_time}`).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
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