"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Download, Loader2 } from 'lucide-react'
import { apiGetAllStaff } from '@/lib/api'

interface Staff {
  staff_id: number
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  salary: number
  age: number
  date_hired: string
  staff_type: string
}

export default function StaffTable() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function fetchStaff() {
      try {
        setIsLoading(true)
        const response = await apiGetAllStaff()
        console.debug('[staff-table] api response:', response)

        const anyResp = response as any
        if (Array.isArray(anyResp)) {
          setStaff(anyResp)
        } else if (anyResp && Array.isArray(anyResp.data)) {
          setStaff(anyResp.data)
        } else if (anyResp && anyResp.status && anyResp.status !== 'ok') {
          setError(anyResp.error || JSON.stringify(anyResp))
        } else {
          console.warn('[staff-table] unexpected response shape', anyResp)
          setError('Unexpected API response')
        }
      } catch (err: any) {
        console.error('[v0] Error fetching staff:', err)
        setError('Failed to load staff')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [])

  const filtered = staff.filter((s) => {
    const fullName = `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || s.staff_type === typeFilter
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-muted-foreground">Loading staff...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Coach">Coach</SelectItem>
                <SelectItem value="Scout">Scout</SelectItem>
                <SelectItem value="Med">Medical</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Staff</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Salary</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Hired</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.staff_id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{s.staff_id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/staff/${s.staff_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                      {s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">{s.staff_type || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-4">{s.email}</td>
                  <td className="px-4 py-4">{s.salary?.toFixed ? s.salary.toFixed(2) : s.salary}</td>
                  <td className="px-4 py-4">{s.date_hired ? new Date(s.date_hired).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-4">
                    <Link href={`/staff/${s.staff_id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No staff found matching your filters.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
