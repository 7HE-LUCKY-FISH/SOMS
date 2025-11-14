import { redirect } from 'next/navigation'
import { getUser} from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export default async function AnalyticsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!hasPermission(user.role, 'view:analytics')) {
    redirect('/dashboard')
  }

  return <AnalyticsDashboard />
}
