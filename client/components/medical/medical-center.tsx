'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { UserRole } from '@/lib/auth'

interface Injury {
  id: string
  playerId: string
  playerName: string
  type: string
  bodyPart: string
  severity: 'Minor' | 'Moderate' | 'Severe'
  startDate: string
  expectedRTP: string
  status: 'Active' | 'Recovering' | 'Cleared'
}

const mockInjuries: Injury[] = [
  {
    id: '1',
    playerId: '9',
    playerName: 'Marcus Silva',
    type: 'Knee Ligament Strain',
    bodyPart: 'Knee',
    severity: 'Moderate',
    startDate: '2025-11-08',
    expectedRTP: '2025-11-22',
    status: 'Active'
  },
  {
    id: '2',
    playerId: '8',
    playerName: 'James Wilson',
    type: 'Ankle Sprain',
    bodyPart: 'Ankle',
    severity: 'Minor',
    startDate: '2025-11-05',
    expectedRTP: '2025-11-15',
    status: 'Recovering'
  },
  {
    id: '3',
    playerId: '12',
    playerName: 'Tom Anderson',
    type: 'Hamstring Strain',
    bodyPart: 'Hamstring',
    severity: 'Minor',
    startDate: '2025-11-01',
    expectedRTP: '2025-11-14',
    status: 'Recovering'
  },
]

interface AvailabilityItem {
  playerId: string
  playerName: string
  status: 'available' | 'doubtful' | 'out'
  reason?: string
}

const mockAvailability: AvailabilityItem[] = [
  { playerId: '9', playerName: 'Marcus Silva', status: 'out', reason: 'Knee injury' },
  { playerId: '8', playerName: 'James Wilson', status: 'doubtful', reason: 'Ankle recovering' },
  { playerId: '6', playerName: 'David Lee', status: 'doubtful', reason: 'Fatigue management' },
]

interface MedicalCenterProps {
  userRole: UserRole
}

export function MedicalCenter({ userRole }: MedicalCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const canEdit = userRole === 'medical' || userRole === 'admin'

  const filteredInjuries = mockInjuries.filter(injury =>
    injury.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    injury.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSeverityColor = (severity: Injury['severity']) => {
    switch (severity) {
      case 'Minor':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'Moderate':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'Severe':
        return 'bg-destructive/30 text-destructive border-destructive'
    }
  }

  const getStatusColor = (status: Injury['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'Recovering':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'Cleared':
        return 'bg-accent/20 text-accent-foreground border-accent/30'
    }
  }

  const getAvailabilityColor = (status: AvailabilityItem['status']) => {
    switch (status) {
      case 'available':
        return 'bg-accent/20 text-accent-foreground border-accent/30'
      case 'doubtful':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'out':
        return 'bg-destructive/20 text-destructive border-destructive/30'
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical Center</h1>
          <p className="text-muted-foreground">Track injuries and player availability.</p>
        </div>
        {canEdit && (
          <Button>
            <Plus className="size-4 mr-2" />
            Log Injury
          </Button>
        )}
      </div>

      <Tabs defaultValue="injuries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="injuries">Injury Log</TabsTrigger>
          <TabsTrigger value="availability">Availability Board</TabsTrigger>
        </TabsList>

        <TabsContent value="injuries" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search injuries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Injuries List */}
          <div className="space-y-3">
            {filteredInjuries.map((injury) => (
              <Card key={injury.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="size-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{injury.playerName}</h3>
                        <p className="text-sm text-muted-foreground">{injury.type}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Body Part</p>
                        <p className="font-medium text-foreground">{injury.bodyPart}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium text-foreground">{new Date(injury.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected RTP</p>
                        <p className="font-medium text-foreground">{new Date(injury.expectedRTP).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days Left</p>
                        <p className="font-medium text-foreground">
                          {Math.ceil((new Date(injury.expectedRTP).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getSeverityColor(injury.severity)}`}>
                      {injury.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getStatusColor(injury.status)}`}>
                      {injury.status}
                    </span>
                    {canEdit && (
                      <Button variant="outline" size="sm">Edit</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredInjuries.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No injuries found.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="availability">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Player</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                    {canEdit && <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAvailability.map((item) => (
                    <tr key={item.playerId} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">{item.playerName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getAvailabilityColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-muted-foreground">{item.reason || '-'}</p>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-4">
                          <Button variant="ghost" size="sm">Update</Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
