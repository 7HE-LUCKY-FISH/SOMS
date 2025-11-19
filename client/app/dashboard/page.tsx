import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { CoachDashboard } from '@/components/dashboard/coach-dashboard'
import { MedicalDashboard } from '@/components/dashboard/medical-dashboard'
import { PlayerDashboard } from '@/components/dashboard/player-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <>
      {user.role === 'coach' && <CoachDashboard user={user} />}
      {user.role === 'medical' && <MedicalDashboard user={user} />}
      {user.role === 'scout' && <PlayerDashboard user={user} />}
      {user.role === 'admin' && <AdminDashboard user={user} />}
    </>
  )
}
