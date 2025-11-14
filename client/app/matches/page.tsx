import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { MatchesView } from '@/components/matches/matches-view'

export default async function MatchesPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <MatchesView userRole={user.role} />
}
