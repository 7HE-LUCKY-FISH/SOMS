'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface Player {
  id: string
  name: string
  number: number
  position: string
  availability: 'available' | 'doubtful' | 'out'
}

const mockPlayers: Player[] = [
  { id: '1', name: 'John Keeper', number: 1, position: 'GK', availability: 'available' },
  { id: '2', name: 'Alex Silva', number: 4, position: 'CB', availability: 'available' },
  { id: '3', name: 'Tom White', number: 5, position: 'CB', availability: 'available' },
  { id: '4', name: 'Mike Brown', number: 3, position: 'LB', availability: 'available' },
  { id: '5', name: 'Chris Johnson', number: 2, position: 'RB', availability: 'available' },
  { id: '6', name: 'David Lee', number: 6, position: 'CDM', availability: 'doubtful' },
  { id: '7', name: 'Paul Martinez', number: 8, position: 'CM', availability: 'available' },
  { id: '8', name: 'James Wilson', number: 10, position: 'CAM', availability: 'doubtful' },
  { id: '9', name: 'Marcus Silva', number: 11, position: 'LW', availability: 'out' },
  { id: '10', name: 'Ryan Taylor', number: 7, position: 'RW', availability: 'available' },
  { id: '11', name: 'Lucas Garcia', number: 9, position: 'ST', availability: 'available' },
  { id: '12', name: 'Tom Anderson', number: 19, position: 'ST', availability: 'available' },
]

export function PlayerGrid() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAvailabilityColor = (availability: Player['availability']) => {
    switch (availability) {
      case 'available':
        return 'border-accent/30'
      case 'doubtful':
        return 'border-warning/30'
      case 'out':
        return 'border-destructive/30'
    }
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
          <Link key={player.id} href={`/players/${player.id}`}>
            <Card className={`p-6 hover:border-primary transition-all cursor-pointer border-2 ${getAvailabilityColor(player.availability)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{player.number}</span>
                </div>
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                  {player.position}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{player.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{player.availability}</p>
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
