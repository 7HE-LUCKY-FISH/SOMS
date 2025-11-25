'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Loader2, UserCircle2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'

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

interface PlayerGridProps {
  userRole: UserRole
}

export function PlayerGrid({ userRole }: PlayerGridProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8000/players')
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      const data = await response.json()
      if (data.data) {
        setPlayers(data.data)
      }
    } catch (err) {
      console.error('[player-grid] Error fetching players:', err)
      setError('Failed to load players')
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = players.filter((p) => {
    const fullName = `${p.first_name} ${p.middle_name || ''} ${p.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || (p.positions && p.positions.includes(positionFilter))
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && p.is_active && !p.is_injured) ||
      (statusFilter === 'injured' && p.is_injured) ||
      (statusFilter === 'inactive' && !p.is_active)
    return matchesSearch && matchesPosition && matchesStatus
  })

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-muted-foreground">Loading players...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchPlayers} className="mt-4">Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GK">Goalkeeper</SelectItem>
                <SelectItem value="DF">Defender</SelectItem>
                <SelectItem value="MF">Midfielder</SelectItem>
                <SelectItem value="FW">Forward</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Available</SelectItem>
                <SelectItem value="injured">Injured</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No players found matching your filters.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player) => (
            <Link key={player.player_id} href={`/players/${player.player_id}`}>
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="size-20 bg-primary/10 flex items-center justify-center overflow-hidden rounded-lg">
                    {player.photo ? (
                      <img
                        src={`data:${player.photo_content_type};base64,${player.photo}`}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="size-full object-cover object-top rounded-lg"
                      />
                    ) : (
                      <UserCircle2 className="size-12 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{player.positions || 'N/A'}</p>
                  </div>

                  <div className="flex gap-2">
                    {player.is_injured && (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                        Injured
                      </span>
                    )}
                    {!player.is_active && (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                        Inactive
                      </span>
                    )}
                    {player.is_active && !player.is_injured && (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}