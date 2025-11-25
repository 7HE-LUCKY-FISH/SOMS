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
import { apiGetAllPlayers, apiGetUpcomingFixtures, apiGetAllFormations, apiCreateLineup, apiGetAllLineups, apiGetLineupById } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export type Formation = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2' | 'custom'

export interface Player {
  id: string
  name: string
  last_name: string
  position: string
  availability: 'available' | 'doubtful' | 'injured'
  number: number
  photo?: string
  photo_content_type?: string
}

// fix implicity issue on any type line 115 p
interface ApiPlayer {
  player_id: number
  first_name: string
  middle_name?: string
  last_name: string
  positions?: string
  is_active: boolean
  is_injured: boolean
  photo?: string
  photo_content_type?: string
  photo_filename?: string
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

// Mapping from frontend slot IDs to DB role numbers (1-11)
// Ensures unique mapping for each formation
const formationRoleMap: Record<Formation, Record<string, number>> = {
  '4-3-3': {
    'gk': 1, 'lb': 3, 'cb1': 4, 'cb2': 5, 'rb': 2,
    'cm1': 6, 'cm2': 8, 'cm3': 10,
    'lw': 11, 'st': 9, 'rw': 7
  },
  '4-2-3-1': {
    'gk': 1, 'lb': 3, 'cb1': 4, 'cb2': 5, 'rb': 2,
    'cdm1': 6, 'cdm2': 8,
    'lam': 11, 'cam': 10, 'ram': 7,
    'st': 9
  },
  '4-4-2': {
    'gk': 1, 'lb': 3, 'cb1': 4, 'cb2': 5, 'rb': 2,
    'lm': 11, 'cm1': 6, 'cm2': 8, 'rm': 7,
    'st1': 9, 'st2': 10
  },
  '3-5-2': {
    'gk': 1,
    'cb1': 4, 'cb2': 5, 'cb3': 3, // Using LB role for 3rd CB
    'lwb': 11, // Using LM role
    'cm1': 6, 'cm2': 8, 'cm3': 10, // Using CAM role
    'rwb': 2, // Using RB role
    'st1': 9, 'st2': 7 // Using RM role for 2nd striker
  },
  'custom': {}
}

export function LineupBuilder({ user }: { user: User }) {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [dbFormations, setDbFormations] = useState<any[]>([])
  const [savedLineups, setSavedLineups] = useState<any[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [lineupName, setLineupName] = useState('')
  const [slots, setSlots] = useState<PitchSlot[]>(
    formationTemplates['4-3-3'].map(slot => ({ ...slot, player: null }))
  )
  const [bench, setBench] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Load critical data first
        const [playersRes, matchesRes, formationsRes] = await Promise.all([
          apiGetAllPlayers(),
          apiGetUpcomingFixtures(),
          apiGetAllFormations()
        ])

        if (playersRes.data) {
          const transformedPlayers: Player[] = playersRes.data.map((p: ApiPlayer) => ({
            id: String(p.player_id),
            name: `${p.first_name} ${p.middle_name ? p.middle_name + ' ' : ''}${p.last_name}`,
            last_name: p.last_name,
            position: p.positions || 'N/A',
            availability: p.is_injured ? 'injured' : (p.is_active ? 'available' : 'doubtful'),
            number: p.player_id,
            photo: p.photo,
            photo_content_type: p.photo_content_type
          }))
          setPlayers(transformedPlayers)
        }

        if (matchesRes.data) {
          setMatches(matchesRes.data)
        }

        if (formationsRes.data) {
          setDbFormations(formationsRes.data)
        }

        // Load saved lineups separately so it doesn't block the main UI if it fails
        try {
          const lineupsRes = await apiGetAllLineups()
          if (lineupsRes.data) {
            setSavedLineups(lineupsRes.data)
          }
        } catch (lineupError) {
          console.error('Error fetching lineups:', lineupError)
          // We don't show a toast here to avoid annoying the user if just this part fails
        }

      } catch (err) {
        console.error('[v0] Error fetching data:', err)
        toast({
          title: "Error",
          description: "Failed to load lineup data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Auto-load lineup when match is selected or formation changes
  useEffect(() => {
    async function loadLineupForMatch() {
      if (!selectedMatchId) return

      // Find DB formation ID for current formation
      const dbFormation = dbFormations.find(f => f.code === formation)
      
      // Find lineup that matches both match_id AND formation_id
      const existingLineup = savedLineups.find((l: any) => 
        String(l.match_id) === selectedMatchId && 
        (!dbFormation || l.formation_id === dbFormation.formation_id)
      )
      
      if (existingLineup) {
        try {
          setIsLoading(true)
          const detailsRes = await apiGetLineupById(existingLineup.lineup_id)
          
          if (detailsRes.data) {
            const data = detailsRes.data
            
            if (formationTemplates[formation]) {
              // Map players to slots
              const newSlots = formationTemplates[formation].map(templateSlot => {
                const roleNo = formationRoleMap[formation]?.[templateSlot.id]
                const slotData = data.slots.find((s: any) => s.slot_no === roleNo)
                
                let player: Player | null = null
                if (slotData) {
                  const foundPlayer = players.find(p => p.id === String(slotData.player_id))
                  if (foundPlayer) {
                    player = foundPlayer
                  }
                }
                
                return {
                  ...templateSlot,
                  player
                }
              })
              
              setSlots(newSlots)
              setBench([]) 
              
              toast({
                title: "Lineup Loaded",
                description: `Loaded saved lineup for ${formation}.`,
              })
            }
          }
        } catch (err) {
          console.error("Error loading lineup details:", err)
          toast({
            title: "Error",
            description: "Failed to load existing lineup details.",
            variant: "destructive"
          })
        } finally {
          setIsLoading(false)
        }
      } else {
        // Reset if no lineup exists for this match and formation
        setSlots(formationTemplates[formation].map(slot => ({ ...slot, player: null })))
        setBench([])
      }
    }

    if (players.length > 0) {
      loadLineupForMatch()
    }
  }, [selectedMatchId, savedLineups, players, formation, dbFormations]) // Depend on players to ensure we can map IDs to objects

  const handleSave = async () => {
    if (!selectedMatchId) {
      toast({
        title: "Validation Error",
        description: "Please select a match to save the lineup for.",
        variant: "destructive"
      })
      return
    }

    try {
      // Find DB formation ID
      const dbFormation = dbFormations.find(f => f.code === formation)
      const formationId = dbFormation ? dbFormation.formation_id : 1 // Default to 1 if not found

      // Map slots to players
      const playersMap: Record<number, number> = {}
      slots.forEach(slot => {
        if (slot.player) {
          const roleNo = formationRoleMap[formation]?.[slot.id]
          if (roleNo) {
            playersMap[roleNo] = parseInt(slot.player.id)
          }
        }
      })

      const payload = {
        match_id: parseInt(selectedMatchId),
        team_id: 1, // Default to team 1 for now
        formation_id: formationId,
        is_starting: true,
        minute_applied: 0,
        players: playersMap
      }

      await apiCreateLineup(payload)

      // Refresh saved lineups list
      const lineupsRes = await apiGetAllLineups()
      if (lineupsRes.data) {
        setSavedLineups(lineupsRes.data)
      }

      toast({
        title: "Success",
        description: "Lineup saved successfully!",
      })
    } catch (error) {
      console.error('Error saving lineup:', error)
      toast({
        title: "Error",
        description: "Failed to save lineup",
        variant: "destructive"
      })
    }
  }

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
          <div className="flex-1 w-full sm:w-auto flex gap-4">
            <div className="flex-1">
              <Label htmlFor="match-select" className="mb-2 block">Match</Label>
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger id="match-select" className="w-full min-w-[200px]">
                  <SelectValue placeholder="Select a match" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SelectItem key={match.match_id} value={String(match.match_id)}>
                      {match.opponent_team} ({new Date(match.match_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="lineup-name" className="mb-2 block">Lineup Name</Label>
              <Input
                id="lineup-name"
                placeholder="e.g., vs City FC - Home"
                value={lineupName}
                onChange={(e) => setLineupName(e.target.value)}
                className="max-w-xs"
              />
            </div>
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
            <Button size="sm" onClick={handleSave}>
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
                  className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm font-medium text-secondary-foreground cursor-move hover:bg-secondary/80 transition-colors"
                >
                  {player.photo ? (
                    <img
                      src={`data:${player.photo_content_type};base64,${player.photo}`}
                      alt={player.name}
                      className="size-6 rounded object-cover"
                    />
                  ) : (
                    <span>{player.number}.</span>
                  )}
                  <span>{player.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
