'use client'

import { useEffect, useState } from 'react'
import { User } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Calendar, Users, AlertCircle, Loader2 } from 'lucide-react'
import { apiGetUpcomingFixtures, apiGetAllPlayers } from '@/lib/api'
// took out apiGetMedicalReports
interface Player {
  player_id: number
  first_name: string
  middle_name?: string
  last_name: string
  positions?: string
  is_active: boolean
  is_injured: boolean
  salary: number
  transfer_value?: number
  contract_end_date?: string
  scouted_player: boolean
  photo?: string
  photo_content_type?: string
}

interface Match {
  match_id: number
  opponent_team: string
  match_date: string
  venue: string
}

interface CoachDashboardProps {
  user: User
}

export function CoachDashboard({ user }: CoachDashboardProps) {
  const [nextMatch, setNextMatch] = useState<Match | null>(null)
  const [playerStats, setPlayerStats] = useState({ available: 0, doubtful: 0, injured: 0 })
  const [unavailablePlayers, setUnavailablePlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const matchesRes = await apiGetUpcomingFixtures()
        if (matchesRes.data && matchesRes.data.length > 0) {
          setNextMatch(matchesRes.data[0] as Match)
        }

        const playersRes = await apiGetAllPlayers()
        if (playersRes.data) {
          const players = playersRes.data as Player[]
          const available = players.filter(p => p.is_active && !p.is_injured).length
          const injured = players.filter(p => p.is_injured).length
          const total = players.filter(p => p.is_active).length
          setPlayerStats({ available, doubtful: total - available - injured, injured })

          const injured_players = players.filter(p => p.is_injured).slice(0, 3)
          setUnavailablePlayers(injured_players)
        }
      } catch (error) {
        console.error('[v0] Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-96">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

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
          {nextMatch ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Opponent</span>
                  <span className="font-medium text-foreground">{nextMatch.opponent_team}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{new Date(nextMatch.match_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Venue</span>
                  <span className="font-medium text-foreground">{nextMatch.venue}</span>
                </div>
              </div>
              <Link href={`/matches/${nextMatch.match_id}`}>
                <Button className="w-full mt-4" size="sm">View Details</Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming matches</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Squad Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="font-medium text-accent-foreground">{playerStats.available} players</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Doubtful</span>
              <span className="font-medium text-warning-foreground">{playerStats.doubtful} players</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Injured</span>
              <span className="font-medium text-destructive">{playerStats.injured} players</span>
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
          {unavailablePlayers.length > 0 ? (
            <div className="space-y-2">
              {unavailablePlayers.map((player) => (
                <div key={player.player_id} className="text-sm">
                  <p className="font-medium text-foreground">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-muted-foreground text-xs">Injured</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All players available</p>
          )}
        </Card>
      </div>
    </div>
  )
}
