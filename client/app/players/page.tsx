import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { PlayerGrid } from '@/components/players/player-grid'

export default async function PlayersPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Players</h1>
        <p className="text-muted-foreground">Browse all players and view detailed profiles.</p>
      </div>

      <PlayerGrid userRole={user.role} />
    </div>
  )
}
