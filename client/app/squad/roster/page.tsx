import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { RosterTable } from '@/components/roster/roster-table'

export default async function RosterPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Squad Roster</h1>
        <p className="text-muted-foreground">Manage your team roster and player assignments.</p>
      </div>

      <RosterTable userRole={user.role} />
    </div>
  )
}
