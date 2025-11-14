'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar } from 'lucide-react'

interface MatchDetailsProps {
  matchId: string
}

export function MatchDetails({ matchId }: MatchDetailsProps) {
  // Mock match data
  const match = {
    id: matchId,
    opponent: 'City FC',
    competition: 'League',
    venue: 'Home',
    date: '2025-11-16',
    time: '15:00',
    status: 'upcoming' as const,
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
          <h1 className="text-3xl font-bold text-foreground">vs {match.opponent}</h1>
          <p className="text-muted-foreground">{match.competition}</p>
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
                {new Date(match.date).toLocaleDateString('en-US', {
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
            <p className="font-medium text-foreground">{match.time}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Venue</p>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <p className="font-medium text-foreground">{match.venue}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Competition</p>
            <p className="font-medium text-foreground">{match.competition}</p>
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
