import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { AdminPanel } from '@/components/admin/admin-panel'

export default async function AdminPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminPanel />
}
