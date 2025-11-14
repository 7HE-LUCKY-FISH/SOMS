'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Download } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Player {
  id: string
  name: string
  number: number
  position: string
  team: 'First Team' | 'Reserve' | 'Academy'
  availability: 'available' | 'doubtful' | 'out'
  nationality: string
}

const mockPlayers: Player[] = [
  { id: '1', name: 'John Keeper', number: 1, position: 'GK', team: 'First Team', availability: 'available', nationality: 'USA' },
  { id: '2', name: 'Alex Silva', number: 4, position: 'CB', team: 'First Team', availability: 'available', nationality: 'Brazil' },
  { id: '3', name: 'Tom White', number: 5, position: 'CB', team: 'First Team', availability: 'available', nationality: 'England' },
  { id: '4', name: 'Mike Brown', number: 3, position: 'LB', team: 'First Team', availability: 'available', nationality: 'USA' },
  { id: '5', name: 'Chris Johnson', number: 2, position: 'RB', team: 'First Team', availability: 'available', nationality: 'Canada' },
  { id: '6', name: 'David Lee', number: 6, position: 'CDM', team: 'First Team', availability: 'doubtful', nationality: 'South Korea' },
  { id: '7', name: 'Paul Martinez', number: 8, position: 'CM', team: 'First Team', availability: 'available', nationality: 'Spain' },
  { id: '8', name: 'James Wilson', number: 10, position: 'CAM', team: 'First Team', availability: 'doubtful', nationality: 'England' },
  { id: '9', name: 'Marcus Silva', number: 11, position: 'LW', team: 'First Team', availability: 'out', nationality: 'Portugal' },
  { id: '10', name: 'Ryan Taylor', number: 7, position: 'RW', team: 'First Team', availability: 'available', nationality: 'USA' },
  { id: '11', name: 'Lucas Garcia', number: 9, position: 'ST', team: 'First Team', availability: 'available', nationality: 'Argentina' },
  { id: '12', name: 'Tom Anderson', number: 19, position: 'ST', team: 'Reserve', availability: 'available', nationality: 'Scotland' },
  { id: '13', name: 'Ben Roberts', number: 13, position: 'GK', team: 'Reserve', availability: 'available', nationality: 'Wales' },
  { id: '14', name: 'Sam Davis', number: 15, position: 'CB', team: 'Reserve', availability: 'available', nationality: 'England' },
  { id: '15', name: 'Jack Miller', number: 16, position: 'CM', team: 'Academy', availability: 'available', nationality: 'USA' },
]

interface RosterTableProps {
  userRole: UserRole
}

export function RosterTable({ userRole }: RosterTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  const canEdit = userRole === 'coach' || userRole === 'admin'

  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === 'all' || player.position === positionFilter
    const matchesTeam = teamFilter === 'all' || player.team === teamFilter
    const matchesAvailability = availabilityFilter === 'all' || player.availability === availabilityFilter

    return matchesSearch && matchesPosition && matchesTeam && matchesAvailability
  })

  const getAvailabilityBadge = (availability: Player['availability']) => {
    switch (availability) {
      case 'available':
        return <span className="px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/30">Available</span>
      case 'doubtful':
        return <span className="px-2 py-1 rounded-md text-xs font-medium bg-warning/20 text-warning-foreground border border-warning/30">Doubtful</span>
      case 'out':
        return <span className="px-2 py-1 rounded-md text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30">Out</span>
    }
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

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="First Team">First Team</SelectItem>
                <SelectItem value="Reserve">Reserve</SelectItem>
                <SelectItem value="Academy">Academy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="doubtful">Doubtful</SelectItem>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Player</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Position</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Team</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Availability</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nationality</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{player.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/players/${player.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{player.team}</td>
                  <td className="px-4 py-4">{getAvailabilityBadge(player.availability)}</td>
                  <td className="px-4 py-4 text-sm text-foreground">{player.nationality}</td>
                  <td className="px-4 py-4">
                    <Link href={`/players/${player.id}`}>
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
