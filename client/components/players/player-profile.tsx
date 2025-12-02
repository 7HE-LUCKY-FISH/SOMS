'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { UserRole } from '@/lib/auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PlayerStats {
  pms_id: number
  player_id: number
  match_id: number
  match_name: string
  match_date: string
  match_time: string
  team_id: number
  team_name: string
  started: boolean
  tackles: number
  minutes: number
  shots_total: number
  offsides: number
  red_cards: number
  yellow_cards: number
  fouls_committed: number
  dribbles_attempted: number
  assists: number
  goals: number
  passing_accuracy: number
}

interface MedicalReport {
  med_report_id: number
  summary: string
  report_date: string
  treatment: string
  severity_of_injury: string
}

interface Player {
  player_id: number
  first_name: string
  middle_name?: string
  last_name: string
  positions?: string
  is_active: boolean
  is_injured: boolean
  salary: number
  transfer_value?: number
  contract_end_date?: string
  scouted_player: boolean
  medical_reports: MedicalReport[]
  match_stats: PlayerStats[]
  photo?: string
  photo_content_type?: string
  photo_filename?: string
  photo_size?: number
  photo_uploaded_at?: string
}

interface PlayerProfileProps {
  playerId: string
  userRole: UserRole
}

export function PlayerProfile({ playerId, userRole }: PlayerProfileProps) {
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const canAddNotes = userRole === 'coach' || userRole === 'medical' || userRole === 'admin'
  const canDelete = userRole === 'admin'

  useEffect(() => {
    fetchPlayer()
  }, [playerId])

  async function fetchPlayer() {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/player_details/${playerId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch player')
      }
      const data = await response.json()
      if (data.data) {
        setPlayer(data.data)
      }
    } catch (err) {
      console.error('[player-profile] Error fetching player:', err)
      setError('Failed to load player details')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeletePlayer() {
    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:8000/player/${playerId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete player')
      }
      
      const data = await response.json()
      
      // Redirect to players list after successful deletion
      router.push('/players')
    } catch (err) {
      console.error('[player-profile] Error deleting player:', err)
      setError('Failed to delete player. Please try again.')
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-muted-foreground">Loading player details...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="text-center">
            <p className="text-destructive">{error || 'Player not found'}</p>
            <Link href="/players">
              <Button className="mt-4">Back to Players</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const fullName = `${player.first_name} ${player.middle_name ? player.middle_name + ' ' : ''}${player.last_name}`

  // Calculate stats
  const totalAppearances = player.match_stats?.length || 0
  const totalGoals = player.match_stats?.reduce((sum, s) => sum + (s.goals || 0), 0) || 0
  const totalAssists = player.match_stats?.reduce((sum, s) => sum + (s.assists || 0), 0) || 0
  const totalMinutes = player.match_stats?.reduce((sum, s) => sum + (s.minutes || 0), 0) || 0
  const avgRating = totalAppearances > 0 ? 
    (player.match_stats.reduce((sum, s) => sum + (s.passing_accuracy || 0), 0) / totalAppearances).toFixed(1) : 
    'N/A'

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
          <p className="text-muted-foreground">{player.positions || 'Position not set'}</p>
        </div>
        <div className="flex gap-2">
          {canAddNotes && (
            <Button>Add Note</Button>
          )}
          {canDelete && (
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              style={{ color: 'lab(12.9629 -0.428468 -3.68954)' }}
            >
              <Trash2 className="size-4 mr-2" />
              Delete Player
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Match Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          {canAddNotes && <TabsTrigger value="notes">Notes</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Player Information</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">
                  {player.is_injured ? 'Injured' : player.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium text-foreground">${player.salary?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transfer Value</p>
                <p className="font-medium text-foreground">
                  ${player.transfer_value?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contract End</p>
                <p className="font-medium text-foreground">
                  {player.contract_end_date ? 
                    new Date(player.contract_end_date).toLocaleDateString() : 
                    'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium text-foreground">
                  {player.scouted_player ? 'Scouted' : 'Direct'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Season Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalAppearances}</p>
                <p className="text-sm text-muted-foreground mt-1">Appearances</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-foreground">{totalGoals}</p>
                <p className="text-sm text-muted-foreground mt-1">Goals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-info-foreground">{totalAssists}</p>
                <p className="text-sm text-muted-foreground mt-1">Assists</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning-foreground">{totalMinutes}</p>
                <p className="text-sm text-muted-foreground mt-1">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{avgRating}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Pass %</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Match History</h3>
            {!player.match_stats || player.match_stats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No match history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {player.match_stats.map((match) => (
                  <div key={match.pms_id} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-48">
                        <p className="font-medium text-foreground">{match.match_name || 'Match'}</p>
                        <p className="text-sm text-muted-foreground">
                          {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Minutes</p>
                          <p className="font-semibold text-foreground">{match.minutes}'</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Goals</p>
                          <p className="font-semibold text-foreground">{match.goals || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Assists</p>
                          <p className="font-semibold text-foreground">{match.assists || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pass %</p>
                          <p className="font-semibold text-foreground">{match.passing_accuracy || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Detailed Statistics</h3>
            {!player.match_stats || player.match_stats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No statistics available</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Goals per 90</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalMinutes > 0 ? ((totalGoals / totalMinutes) * 90).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Assists per 90</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalMinutes > 0 ? ((totalAssists / totalMinutes) * 90).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Shots</p>
                  <p className="text-2xl font-bold text-foreground">
                    {player.match_stats.reduce((sum, s) => sum + (s.shots_total || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Tackles</p>
                  <p className="text-2xl font-bold text-foreground">
                    {player.match_stats.reduce((sum, s) => sum + (s.tackles || 0), 0)}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Medical Summary</h3>
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${
                player.is_injured 
                  ? 'bg-destructive/10 border-destructive/30' 
                  : 'bg-accent/10 border-accent/30'
              }`}>
                <p className={`font-medium ${
                  player.is_injured ? 'text-destructive' : 'text-accent-foreground'
                }`}>
                  Current Status: {player.is_injured ? 'Injured' : 'Available'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {player.is_injured ? 'Player is currently recovering from injury' : 'No active injuries or concerns'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Medical Reports</h4>
                {!player.medical_reports || player.medical_reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No medical reports on record</p>
                ) : (
                  <div className="space-y-2">
                    {player.medical_reports.map((report) => (
                      <div key={report.med_report_id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm text-foreground">
                            {new Date(report.report_date).toLocaleDateString()}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            report.severity_of_injury === 'High' ? 'bg-destructive/10 text-destructive' :
                            report.severity_of_injury === 'Medium' ? 'bg-warning/10 text-warning-foreground' :
                            'bg-accent/10 text-accent-foreground'
                          }`}>
                            {report.severity_of_injury || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.summary}</p>
                        {report.treatment && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Treatment: {report.treatment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {canAddNotes && (
          <TabsContent value="notes">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Coaching Notes</h3>
                <Button size="sm">Add Note</Button>
              </div>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No notes added yet</p>
              </div>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="photos">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Player Photos</h3>
            {player.photo ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={`data:${player.photo_content_type};base64,${player.photo}`}
                    alt={player.photo_filename || 'Player photo'}
                    className="max-w-full h-auto rounded-lg shadow-md object-top"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Filename</p>
                    <p className="font-medium text-foreground">{player.photo_filename || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium text-foreground">
                      {player.photo_size ? `${(player.photo_size / 1024).toFixed(2)} KB` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uploaded At</p>
                    <p className="font-medium text-foreground">
                      {player.photo_uploaded_at ? new Date(player.photo_uploaded_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Content Type</p>
                    <p className="font-medium text-foreground">{player.photo_content_type || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No photo available</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {fullName}? This action cannot be undone and will permanently remove all player data including match statistics, medical reports, and photos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayer}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Player'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}