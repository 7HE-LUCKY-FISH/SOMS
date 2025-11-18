'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Loader2, Plus } from 'lucide-react'
import { apiGetAllPlayers, apiCreatePlayer } from '@/lib/api'
import { UserRole } from '@/lib/auth'

interface Player {
  player_id: number
  first_name: string
  middle_name?: string
  last_name: string
  positions?: string
  is_active: boolean
  is_injured: boolean
}

interface PlayerGridProps {
  userRole: UserRole
}

export function PlayerGrid({ userRole }: PlayerGridProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  const canCreate = userRole === 'admin'

  useEffect(() => {
    fetchPlayers()
  }, [])

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

  async function handleCreatePlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get('first_name') as string,
      middle_name: formData.get('middle_name') as string || undefined,
      last_name: formData.get('last_name') as string,
      salary: parseFloat(formData.get('salary') as string),
      positions: formData.get('positions') as string || undefined,
      is_active: true,
      is_injured: false,
      transfer_value: parseFloat(formData.get('transfer_value') as string) || undefined,
      contract_end_date: formData.get('contract_end_date') as string || undefined,
      scouted_player: false,
    }

    try {
      await apiCreatePlayer(data)
      setIsCreateOpen(false)
      fetchPlayers()
      e.currentTarget.reset()
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create player')
    } finally {
      setIsCreating(false)
    }
  }

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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Create Player
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Player</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" name="first_name" required />
                  </div>
                  <div>
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input id="middle_name" name="middle_name" />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input id="last_name" name="last_name" required />
                  </div>
                  <div>
                    <Label htmlFor="positions">Position(s)</Label>
                    <Input id="positions" name="positions" placeholder="e.g., ST, CF" />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary *</Label>
                    <Input id="salary" name="salary" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="transfer_value">Transfer Value</Label>
                    <Input id="transfer_value" name="transfer_value" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="contract_end_date">Contract End Date</Label>
                    <Input id="contract_end_date" name="contract_end_date" type="date" />
                  </div>
                </div>
                
                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Create Player
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
