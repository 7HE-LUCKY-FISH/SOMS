import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { StaffDetail } from '@/components/staff/staff-detail'

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect('/auth/login')
  }

  return <StaffDetail staffId={id} />
}