import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { LineupBuilder } from '@/components/lineup/lineup-builder'

export default async function LineupPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!hasPermission(user.role, 'create:lineup')) {
    redirect('/dashboard')
  }

  return (
    <div className="h-screen overflow-hidden">
      <LineupBuilder user={user} />
    </div>
  )
}
