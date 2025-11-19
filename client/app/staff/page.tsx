import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import StaffTable from '@/components/staff/staff-table'

export default async function StaffPage() {
	const user = await getUser()

	if (!user) {
		redirect('/auth/login')
	}
	if (typeof hasPermission === 'function') {
		try {
			if (!(hasPermission as any)(user, 'view_staff')) {
				redirect('/')
			}
		} catch (e) {
			
		}
	}

	return (
		<div className="p-6 lg:p-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground mb-2">Staff</h1>
				<p className="text-muted-foreground">Browse all staff members.</p>
			</div>

			<StaffTable />
		</div>
	)
}