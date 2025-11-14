import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { PlayerProfile } from '@/components/players/player-profile'

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect('/auth/login')
  }

  return <PlayerProfile playerId={id} userRole={user.role} />
}
