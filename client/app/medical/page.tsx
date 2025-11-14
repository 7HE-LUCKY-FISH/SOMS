import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { MedicalCenter } from '@/components/medical/medical-center'

export default async function MedicalPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!hasPermission(user.role, 'view:medical')) {
    redirect('/dashboard')
  }

  return <MedicalCenter userRole={user.role} />
}
