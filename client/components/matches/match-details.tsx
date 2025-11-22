'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar, Loader2 } from 'lucide-react'

interface Match {
  match_id: number
  name: string
  venue: string
  match_time: string
  opponent_team: string
  match_date: string
  result?: string
}

interface MatchDetailsProps {
  matchId: string
}

export function MatchDetails({ matchId }: MatchDetailsProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatch()
  }, [matchId])

  async function fetchMatch() {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/match/${matchId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch match')
      }
      const data = await response.json()
      if (data.data) {
        setMatch(data.data)
      }
    } catch (err) {
      console.error('[match-details] Error fetching match:', err)
      setError('Failed to load match details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-muted-foreground">Loading match details...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="text-center">
            <p className="text-destructive">{error || 'Match not found'}</p>
            <Link href="/matches">
              <Button className="mt-4">Back to Matches</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/matches">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">vs {match.opponent_team}</h1>
          <p className="text-muted-foreground">{match.name}</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Match Information</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <p className="font-medium text-foreground">
                {new Date(match.match_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Kickoff</p>
            <p className="font-medium text-foreground">
              {new Date(`1970-01-01T${match.match_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Venue</p>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <p className="font-medium text-foreground">{match.venue}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Result</p>
            <p className="font-medium text-foreground">{match.result || 'TBD'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Lineup</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No lineup created yet</p>
          <Link href="/squad/lineup">
            <Button>Create Lineup</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}