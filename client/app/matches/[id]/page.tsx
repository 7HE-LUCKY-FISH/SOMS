import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { MatchDetails } from '@/components/matches/match-details'

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect('/auth/login')
  }

  return <MatchDetails matchId={id} />
}
