'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SoccerPitch } from '@/components/lineup/soccer-pitch'
import { PlayerList } from '@/components/lineup/player-list'
import { Save, Download, RotateCcw, Loader2 } from 'lucide-react'
import { apiGetAllPlayers } from '@/lib/api'
import { Card } from '@/components/ui/card'

export type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | 'custom'

export interface Player {
  id: string
  name: string
  position: string
  availability: 'available' | 'doubtful' | 'out'
  number: number
}

export interface PitchSlot {
  id: string
  x: number
  y: number
  player: Player | null
}

const formationTemplates: Record<Formation, Omit<PitchSlot, 'player'>[]> = {
  '4-3-3': [
    { id: 'gk', x: 50, y: 90 },
    { id: 'lb', x: 20, y: 70 },
    { id: 'cb1', x: 40, y: 70 },
    { id: 'cb2', x: 60, y: 70 },
    { id: 'rb', x: 80, y: 70 },
    { id: 'cm1', x: 30, y: 50 },
    { id: 'cm2', x: 50, y: 50 },
    { id: 'cm3', x: 70, y: 50 },
    { id: 'lw', x: 20, y: 25 },
    { id: 'st', x: 50, y: 20 },
    { id: 'rw', x: 80, y: 25 },
  ],
  '4-2-3-1': [
    { id: 'gk', x: 50, y: 90 },
    { id: 'lb', x: 20, y: 70 },
    { id: 'cb1', x: 40, y: 70 },
    { id: 'cb2', x: 60, y: 70 },
    { id: 'rb', x: 80, y: 70 },
    { id: 'cdm1', x: 35, y: 55 },
    { id: 'cdm2', x: 65, y: 55 },
    { id: 'lam', x: 25, y: 38 },
    { id: 'cam', x: 50, y: 35 },
    { id: 'ram', x: 75, y: 38 },
    { id: 'st', x: 50, y: 18 },
  ],
  '3-5-2': [
    { id: 'gk', x: 50, y: 90 },
    { id: 'cb1', x: 30, y: 70 },
    { id: 'cb2', x: 50, y: 70 },
    { id: 'cb3', x: 70, y: 70 },
    { id: 'lwb', x: 15, y: 50 },
    { id: 'cm1', x: 35, y: 50 },
    { id: 'cm2', x: 50, y: 48 },
    { id: 'cm3', x: 65, y: 50 },
    { id: 'rwb', x: 85, y: 50 },
    { id: 'st1', x: 40, y: 20 },
    { id: 'st2', x: 60, y: 20 },
  ],
  '4-4-2': [
    { id: 'gk', x: 50, y: 90 },
    { id: 'lb', x: 20, y: 70 },
    { id: 'cb1', x: 40, y: 70 },
    { id: 'cb2', x: 60, y: 70 },
    { id: 'rb', x: 80, y: 70 },
    { id: 'lm', x: 20, y: 45 },
    { id: 'cm1', x: 40, y: 48 },
    { id: 'cm2', x: 60, y: 48 },
    { id: 'rm', x: 80, y: 45 },
    { id: 'st1', x: 40, y: 20 },
    { id: 'st2', x: 60, y: 20 },
  ],
  'custom': []
}

export function LineupBuilder({ user }: { user: User }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [lineupName, setLineupName] = useState('')
  const [slots, setSlots] = useState<PitchSlot[]>(
    formationTemplates['4-3-3'].map(slot => ({ ...slot, player: null }))
  )
  const [bench, setBench] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setIsLoading(true)
        const response = await apiGetAllPlayers()
        if (response.data) {
          const transformedPlayers: Player[] = response.data.map(p => ({
            id: String(p.player_id),
            name: `${p.first_name} ${p.middle_name ? p.middle_name + ' ' : ''}${p.last_name}`,
            position: p.positions || 'N/A',
            availability: p.is_injured ? 'out' : (p.is_active ? 'available' : 'doubtful'),
            number: p.player_id
          }))
          setPlayers(transformedPlayers)
        }
      } catch (err) {
        console.error('[v0] Error fetching players:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handleFormationChange = (newFormation: Formation) => {
    setFormation(newFormation)
    setSlots(formationTemplates[newFormation].map(slot => ({ ...slot, player: null })))
    setBench([])
  }

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('player', JSON.stringify(player))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnSlot = (slotId: string, player: Player) => {
    const updatedSlots = slots.map(slot => 
      slot.player?.id === player.id ? { ...slot, player: null } : slot
    )
    
    setBench(prev => prev.filter(p => p.id !== player.id))
    
    const finalSlots = updatedSlots.map(slot =>
      slot.id === slotId ? { ...slot, player } : slot
    )
    
    setSlots(finalSlots)
  }

  const handleDropOnBench = (player: Player) => {
    setSlots(prev => prev.map(slot =>
      slot.player?.id === player.id ? { ...slot, player: null } : slot
    ))
    
    if (!bench.find(p => p.id === player.id)) {
      setBench(prev => [...prev, player])
    }
  }

  const handleRemoveFromSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, player: null } : slot
    ))
  }

  const handleReset = () => {
    setSlots(formationTemplates[formation].map(slot => ({ ...slot, player: null })))
    setBench([])
    setLineupName('')
  }

  const assignedPlayerIds = new Set([
    ...slots.filter(s => s.player).map(s => s.player!.id),
    ...bench.map(p => p.id)
  ])

  const availablePlayers = players.filter(p => !assignedPlayerIds.has(p.id))
  const filteredPlayers = availablePlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <div className="h-full flex flex-col lg:flex-row">
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card flex flex-col max-h-[40vh] lg:max-h-none">
        <div className="p-4 border-b border-border space-y-4">
          <div>
            <h2 className="font-semibold text-foreground mb-2">Squad</h2>
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <PlayerList
          players={filteredPlayers}
          onDragStart={handleDragStart}
        />
      </div>

      <div className="flex-1 flex flex-col bg-background overflow-auto">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <Label htmlFor="lineup-name" className="mb-2 block">Lineup Name</Label>
            <Input
              id="lineup-name"
              placeholder="e.g., vs City FC - Home"
              value={lineupName}
              onChange={(e) => setLineupName(e.target.value)}
              className="max-w-xs"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={formation} onValueChange={(v) => handleFormationChange(v as Formation)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-3-3">4-3-3</SelectItem>
                <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                <SelectItem value="3-5-2">3-5-2</SelectItem>
                <SelectItem value="4-4-2">4-4-2</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Save className="size-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          <SoccerPitch
            slots={slots}
            onDropOnSlot={handleDropOnSlot}
            onRemoveFromSlot={handleRemoveFromSlot}
          />
        </div>

        <div
          className="border-t border-border bg-card p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const playerData = e.dataTransfer.getData('player')
            if (playerData) {
              const player = JSON.parse(playerData) as Player
              handleDropOnBench(player)
            }
          }}
        >
          <h3 className="font-semibold text-foreground mb-3">Bench</h3>
          <div className="flex flex-wrap gap-2">
            {bench.length === 0 ? (
              <p className="text-sm text-muted-foreground">Drag players here for the bench</p>
            ) : (
              bench.map((player) => (
                <div
                  key={player.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  className="px-3 py-2 bg-secondary rounded-lg text-sm font-medium text-secondary-foreground cursor-move hover:bg-secondary/80 transition-colors"
                >
                  {player.number}. {player.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
