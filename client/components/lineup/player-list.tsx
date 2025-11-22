'use client'

import { Player } from './lineup-builder'

interface PlayerListProps {
  players: Player[]
  onDragStart: (e: React.DragEvent, player: Player) => void
}

export function PlayerList({ players, onDragStart }: PlayerListProps) {
  const getAvailabilityColor = (availability: Player['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-accent/20 text-accent-foreground border-accent/30'
      case 'doubtful':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'injured':
        return 'bg-destructive/20 text-destructive border-destructive/30'
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          draggable
          onDragStart={(e) => onDragStart(e, player)}
          className="p-3 bg-background border border-border rounded-xl cursor-move hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{player.number}</span>
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.position}</p>
              </div>
            </div>
          </div>
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${getAvailabilityColor(player.availability)}`}>
            {player.availability.charAt(0).toUpperCase() + player.availability.slice(1)}
          </span>
        </div>
      ))}
    </div>
  )
}
