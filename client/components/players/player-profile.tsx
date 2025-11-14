'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface PlayerProfileProps {
  playerId: string
  userRole: UserRole
}

export function PlayerProfile({ playerId, userRole }: PlayerProfileProps) {
  const canAddNotes = userRole === 'coach' || userRole === 'medical' || userRole === 'admin'

  // Mock player data
  const player = {
    id: playerId,
    name: 'Lucas Garcia',
    number: 9,
    position: 'ST',
    team: 'First Team',
    availability: 'available',
    nationality: 'Argentina',
    age: 24,
    height: '183 cm',
    weight: '78 kg',
    preferredFoot: 'Right',
  }

  const stats = {
    appearances: 12,
    goals: 8,
    assists: 3,
    minutesPlayed: 1048,
    rating: 7.4,
  }

  const matchLogs = [
    { date: 'Nov 10, 2025', opponent: 'United FC', minutes: 90, rating: 7.5, goals: 1, assists: 0 },
    { date: 'Nov 3, 2025', opponent: 'Rangers SC', minutes: 82, rating: 7.0, goals: 0, assists: 1 },
    { date: 'Oct 27, 2025', opponent: 'Athletic Club', minutes: 90, rating: 7.8, goals: 2, assists: 0 },
    { date: 'Oct 20, 2025', opponent: 'City FC', minutes: 65, rating: 7.2, goals: 1, assists: 1 },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{player.name}</h1>
          <p className="text-muted-foreground">{player.position} • #{player.number}</p>
        </div>
        {canAddNotes && (
          <Button>Add Note</Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Match Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          {canAddNotes && <TabsTrigger value="notes">Notes</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Bio Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Player Information</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{player.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium text-foreground">{player.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-medium text-foreground">{player.height}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium text-foreground">{player.weight}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Foot</p>
                <p className="font-medium text-foreground">{player.preferredFoot}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium text-foreground">{player.team}</p>
              </div>
            </div>
          </Card>

          {/* Season Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Season Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.appearances}</p>
                <p className="text-sm text-muted-foreground mt-1">Appearances</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-foreground">{stats.goals}</p>
                <p className="text-sm text-muted-foreground mt-1">Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-info-foreground">{stats.assists}</p>
                <p className="text-sm text-muted-foreground mt-1">Assists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning-foreground">{stats.minutesPlayed}</p>
                <p className="text-sm text-muted-foreground mt-1">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.rating}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Match History</h3>
            <div className="space-y-4">
              {matchLogs.map((match, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-48">
                      <p className="font-medium text-foreground">{match.opponent}</p>
                      <p className="text-sm text-muted-foreground">{match.date}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Minutes</p>
                        <p className="font-semibold text-foreground">{match.minutes}'</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-semibold text-foreground">{match.rating}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goals</p>
                        <p className="font-semibold text-foreground">{match.goals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assists</p>
                        <p className="font-semibold text-foreground">{match.assists}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Detailed Statistics</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Goals per 90</p>
                <p className="text-2xl font-bold text-foreground">0.69</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assists per 90</p>
                <p className="text-2xl font-bold text-foreground">0.26</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Shots per 90</p>
                <p className="text-2xl font-bold text-foreground">3.8</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Shot Accuracy</p>
                <p className="text-2xl font-bold text-foreground">62%</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Medical Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <p className="font-medium text-accent-foreground">Current Status: Available</p>
                <p className="text-sm text-muted-foreground mt-1">No active injuries or concerns</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Injury History</h4>
                <p className="text-sm text-muted-foreground">No injuries recorded this season</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {canAddNotes && (
          <TabsContent value="notes">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Coaching Notes</h3>
                <Button size="sm">Add Note</Button>
              </div>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No notes added yet</p>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
