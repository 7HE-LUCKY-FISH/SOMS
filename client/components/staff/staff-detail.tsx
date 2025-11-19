'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, Mail, DollarSign, Calendar, Briefcase } from 'lucide-react'

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

interface StaffDetailProps {
  staffId: string
}

export function StaffDetail({ staffId }: StaffDetailProps) {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaff()
  }, [staffId])

  async function fetchStaff() {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/staff/${staffId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch staff member')
      }
      const data = await response.json()
      if (data.data) {
        setStaff(data.data)
      }
    } catch (err) {
      console.error('[staff-detail] Error fetching staff:', err)
      setError('Failed to load staff details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-muted-foreground">Loading staff details...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !staff) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12">
          <div className="text-center">
            <p className="text-destructive">{error || 'Staff member not found'}</p>
            <Link href="/staff">
              <Button className="mt-4">Back to Staff</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const fullName = `${staff.first_name} ${staff.middle_name ? staff.middle_name + ' ' : ''}${staff.last_name}`

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff">
          <Button variant="outline" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
          <p className="text-muted-foreground capitalize">{staff.staff_type}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{staff.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Briefcase className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Staff Type</p>
                <p className="font-medium text-foreground capitalize">{staff.staff_type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{staff.age} years</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Employment Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Salary</p>
                <p className="font-medium text-foreground">
                  ${staff.salary?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date Hired</p>
                <p className="font-medium text-foreground">
                  {staff.date_hired ? new Date(staff.date_hired).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Staff ID</p>
                <p className="font-medium text-foreground">#{staff.staff_id}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {staff.staff_type === 'coach' && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Coaching Information</h3>
          <p className="text-muted-foreground">Additional coaching details would appear here.</p>
        </Card>
      )}

      {staff.staff_type === 'scout' && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Scouting Information</h3>
          <p className="text-muted-foreground">Additional scouting details would appear here.</p>
        </Card>
      )}

      {staff.staff_type === 'medical' && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Medical Staff Information</h3>
          <p className="text-muted-foreground">Additional medical staff details would appear here.</p>
        </Card>
      )}
    </div>
  )
}