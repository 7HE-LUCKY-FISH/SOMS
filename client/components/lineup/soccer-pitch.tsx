'use client'

import { PitchSlot, Player } from './lineup-builder'
import { X } from 'lucide-react'

interface SoccerPitchProps {
  slots: PitchSlot[]
  onDropOnSlot: (slotId: string, player: Player) => void
  onRemoveFromSlot: (slotId: string) => void
  // Optional: override background gradient classes
  pitchBgClass?: string
}

export function SoccerPitch({ slots, onDropOnSlot, onRemoveFromSlot, pitchBgClass }: SoccerPitchProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault()
    const playerData = e.dataTransfer.getData('player')
    if (playerData) {
      const player = JSON.parse(playerData) as Player
      onDropOnSlot(slotId, player)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`relative aspect-[3/4] rounded-2xl border-2 overflow-hidden ${pitchBgClass ?? 'bg-gradient-to-b from-emerald-800/80 via-emerald-700/75 to-emerald-800/80 border-emerald-600/70'}`}>
        {/* Pitch markings */}
        <div className="absolute inset-0">
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/70" />
          
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-32 border-2 border-white/70 rounded-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3 bg-white/80 rounded-full" />
          
          {/* Penalty boxes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3/5 h-1/6 border-2 border-t-0 border-white/70" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-1/6 border-2 border-b-0 border-white/70" />
          
          {/* Goal areas */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2/5 h-[8%] border-2 border-t-0 border-white/70" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2/5 h-[8%] border-2 border-b-0 border-white/70" />
        </div>

        {/* Player slots */}
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, slot.id)}
          >
            {slot.player ? (
              <div className="relative group">
                <div className="size-16 sm:size-20 bg-primary text-primary-foreground rounded-2xl border-2 border-white shadow-lg flex flex-col items-center justify-center cursor-move">
                  <span className="text-xs font-bold">{slot.player.number}</span>
                  <span className="text-[10px] font-medium text-center leading-tight mt-0.5 px-1 truncate max-w-full">
                    {slot.player.name.split(' ').pop()}
                  </span>
                </div>
                {slot.player.availability !== 'available' && (
                  <div className={`absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    slot.player.availability === 'doubtful' ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground'
                  }`}>
                    !
                  </div>
                )}
                <button
                  onClick={() => onRemoveFromSlot(slot.id)}
                  className="absolute -top-2 -left-2 size-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="size-16 sm:size-20 border-2 border-dashed border-white/60 rounded-2xl flex items-center justify-center hover:border-white/80 hover:bg-white/10 transition-colors">
                <span className="text-xs text-white/50">Drop</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
