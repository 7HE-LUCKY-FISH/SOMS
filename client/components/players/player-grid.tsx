'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Loader2 } from 'lucide-react'
import { apiGetAllPlayers } from '@/lib/api'

interface Player {
  player_id: number
  first_name: string
  middle_name?: string
  last_name: string
  positions?: string
  is_active: boolean
  is_injured: boolean
}

export function PlayerGrid() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setIsLoading(true)
        const response = await apiGetAllPlayers()
        if (response.data) {
          setPlayers(response.data)
        }
      } catch (err) {
        console.error('[v0] Error fetching players:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.middle_name || ''} ${player.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) ||
           (player.positions?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  })

  const getAvailabilityColor = (player: Player) => {
    if (player.is_injured) {
      return 'border-destructive/30'
    } else if (player.is_active) {
      return 'border-accent/30'
    } else {
      return 'border-warning/30'
    }
  }

  const getAvailabilityText = (player: Player) => {
    if (player.is_injured) return 'out'
    if (player.is_active) return 'available'
    return 'inactive'
  }

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

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => (
          <Link key={player.player_id} href={`/players/${player.player_id}`}>
            <Card className={`p-6 hover:border-primary transition-all cursor-pointer border-2 ${getAvailabilityColor(player)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{player.player_id}</span>
                </div>
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                  {player.positions || 'N/A'}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {player.first_name} {player.middle_name ? player.middle_name + ' ' : ''}{player.last_name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">{getAvailabilityText(player)}</p>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No players found.</p>
        </Card>
      )}
    </div>
  )
}
