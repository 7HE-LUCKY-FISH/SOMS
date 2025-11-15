'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Download, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'
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

interface RosterTableProps {
  userRole: UserRole
}

export function RosterTable({ userRole }: RosterTableProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

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
        setError('Failed to load players')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const canEdit = userRole === 'coach' || userRole === 'admin'

  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.middle_name || ''} ${player.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         (player.positions?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || player.positions === positionFilter
    
    let matchesAvailability = true
    if (availabilityFilter === 'available') {
      matchesAvailability = player.is_active && !player.is_injured
    } else if (availabilityFilter === 'out') {
      matchesAvailability = player.is_injured
    }

    return matchesSearch && matchesPosition && matchesAvailability
  })

  const getAvailabilityBadge = (player: Player) => {
    if (player.is_injured) {
      return <span className="px-2 py-1 rounded-md text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30">Out</span>
    } else if (player.is_active) {
      return <span className="px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/30">Available</span>
    } else {
      return <span className="px-2 py-1 rounded-md text-xs font-medium bg-warning/20 text-warning-foreground border border-warning/30">Inactive</span>
    }
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

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GK">GK</SelectItem>
                <SelectItem value="CB">CB</SelectItem>
                <SelectItem value="LB">LB</SelectItem>
                <SelectItem value="RB">RB</SelectItem>
                <SelectItem value="CDM">CDM</SelectItem>
                <SelectItem value="CM">CM</SelectItem>
                <SelectItem value="CAM">CAM</SelectItem>
                <SelectItem value="LW">LW</SelectItem>
                <SelectItem value="RW">RW</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="out">Out</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Player</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Position</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Availability</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlayers.map((player) => (
                <tr key={player.player_id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{player.player_id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/players/${player.player_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {player.first_name} {player.middle_name ? player.middle_name + ' ' : ''}{player.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                      {player.positions || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">{getAvailabilityBadge(player)}</td>
                  <td className="px-4 py-4">
                    <Link href={`/players/${player.player_id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No players found matching your filters.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
