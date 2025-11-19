import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
