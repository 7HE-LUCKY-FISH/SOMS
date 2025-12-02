'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, AlertTriangle, Loader2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'
import { apiGetAllMedicalReports, apiGetAllPlayers, apiCreateMedicalReport, apiSetPlayerInjured, apiSetPlayerHealed } from '@/lib/api'

interface MedicalCenterProps {
  userRole: UserRole
}

export function MedicalCenter({ userRole }: MedicalCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updatingPlayerId, setUpdatingPlayerId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('injuries')
  
  const canEdit = userRole === 'medical' || userRole === 'admin'

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [reportsRes, playersRes] = await Promise.all([
        apiGetAllMedicalReports(),
        apiGetAllPlayers()
      ])
      if (reportsRes.data) setReports(reportsRes.data)
      if (playersRes.data) setPlayers(playersRes.data)
    } catch (err) {
      console.error('[v0] Error fetching medical data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateReport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      player_id: parseInt(formData.get('player_id') as string),
      summary: formData.get('summary') as string || undefined,
      report_date: formData.get('report_date') as string,
      treatment: formData.get('treatment') as string || undefined,
      severity_of_injury: formData.get('severity_of_injury') as string || undefined,
    }

    try {
      await apiCreateMedicalReport(data)
      setIsCreateOpen(false)
      fetchData()
      e.currentTarget.reset()
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create medical report')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleMarkInjured(playerId: number) {
    setUpdatingPlayerId(playerId)
    try {
      await apiSetPlayerInjured(playerId)
      fetchData() // Refresh the data
    } catch (err: any) {
      console.error('Failed to mark player as injured:', err)
      // You could add a toast notification here
    } finally {
      setUpdatingPlayerId(null)
    }
  }

  async function handleMarkHealed(playerId: number) {
    setUpdatingPlayerId(playerId)
    try {
      await apiSetPlayerHealed(playerId)
      fetchData() // Refresh the data
    } catch (err: any) {
      console.error('Failed to mark player as recovered:', err)
      // You could add a toast notification here
    } finally {
      setUpdatingPlayerId(null)
    }
  }

  const filteredReports = reports.filter(report =>
    report.player_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.player_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'moderate':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'severe':
        return 'bg-destructive/30 text-destructive border-destructive'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const availability = players.map(p => ({
    playerId: String(p.player_id),
    playerName: `${p.first_name} ${p.last_name}`,
    status: p.is_injured ? 'out' : (p.is_active ? 'available' : 'doubtful'),
    reason: p.is_injured ? 'Injured' : (!p.is_active ? 'Inactive' : undefined)
  }))

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-accent/20 text-accent-foreground border-accent/30'
      case 'doubtful':
        return 'bg-warning/20 text-warning-foreground border-warning/30'
      case 'out':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-muted-foreground">Loading medical data...</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical Center</h1>
          <p className="text-muted-foreground">Track injuries and player availability.</p>
        </div>
        {canEdit && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Log Injury
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Medical Report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="player_id">Player *</Label>
                    <Select name="player_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map(p => (
                          <SelectItem key={p.player_id} value={String(p.player_id)}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report_date">Report Date *</Label>
                    <Input id="report_date" name="report_date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="severity_of_injury">Severity</Label>
                    <Select name="severity_of_injury">
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minor">Minor</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" name="summary" rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="treatment">Treatment</Label>
                    <Textarea id="treatment" name="treatment" rows={3} />
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
                    Create Report
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="injuries">Injury Log</TabsTrigger>
          <TabsTrigger value="availability">Availability Board</TabsTrigger>
        </TabsList>

        <TabsContent value="injuries" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-3">
            {filteredReports.map((report) => (
              <Card key={report.med_report_id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="size-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {report.player_first_name} {report.player_last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{report.summary || 'No summary'}</p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Report Date</p>
                        <p className="font-medium text-foreground">
                          {report.report_date ? new Date(report.report_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Treatment</p>
                        <p className="font-medium text-foreground">{report.treatment || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Severity</p>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getSeverityColor(report.severity_of_injury)}`}>
                          {report.severity_of_injury || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No medical reports found.</p>
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
                  {availability.map((item) => (
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
                          <div className="flex gap-2">
                            {item.status === 'out' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkHealed(parseInt(item.playerId))}
                                disabled={updatingPlayerId === parseInt(item.playerId)}
                              >
                                {updatingPlayerId === parseInt(item.playerId) ? (
                                  <Loader2 className="size-3 animate-spin mr-1" />
                                ) : null}
                                Mark Available
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleMarkInjured(parseInt(item.playerId))}
                                disabled={updatingPlayerId === parseInt(item.playerId)}
                              >
                                {updatingPlayerId === parseInt(item.playerId) ? (
                                  <Loader2 className="size-3 animate-spin mr-1" />
                                ) : null}
                                Mark Injured
                              </Button>
                            )}
                          </div>
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
