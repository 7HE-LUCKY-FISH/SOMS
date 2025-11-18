'use server'

import { cookies } from 'next/headers'
import { apiLogin } from '@/lib/api'

// Map backend staff_type to frontend roles
export type UserRole = 'coach' | 'medical' | 'scout' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  staff_id: number
  staff_type: string
}

// Map backend staff_type to frontend role
function mapStaffTypeToRole(staffType: string): UserRole {
  const mapping: Record<string, UserRole> = {
    'Coach': 'coach',
    'Med': 'medical',
    'Scout': 'scout',
    'Admin': 'admin'
  }
  return mapping[staffType] || 'admin'
}

export async function login(
  username: string, 
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const result = await apiLogin(username, password)
    
    if (result.status === 'success' && result.staff_id) {
      // Fetch full staff details from backend
      const staffDetails = await fetch(`http://localhost:8000/staff/${result.staff_id}`)
      const staffData = await staffDetails.json()
      
      if (!staffData.data) {
        return { success: false, error: 'Could not fetch user details' }
      }

      const staff = staffData.data
      const user: User = {
        id: String(result.staff_id),
        email: staff.email,
        name: `${staff.first_name} ${staff.last_name}`,
        role: mapStaffTypeToRole(staff.staff_type),
        staff_id: result.staff_id,
        staff_type: staff.staff_type
      }

      const cookieStore = await cookies()
      cookieStore.set('auth', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      })

      return { success: true, user }
    }

    return { success: false, error: 'Login failed' }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return { success: false, error: 'Invalid username or password' }
  }
}

export async function signup(
  email: string,
  password: string, 
  name: string, 
  role: UserRole
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Map frontend role back to backend staff_type
    const roleToStaffType: Record<UserRole, string> = {
      'coach': 'Coach',
      'medical': 'Med',
      'scout': 'Scout',
      'admin': 'Admin'
    }

    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ') || firstName

    // 1. Create staff member
    const staffResponse = await fetch('http://localhost:8000/staff/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        salary: 50000, // Default salary
        age: 30, // You might want to collect this
        staff_type: roleToStaffType[role],
        date_hired: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      })
    })

    if (!staffResponse.ok) {
      throw new Error('Failed to create staff member')
    }

    const staffData = await staffResponse.json()
    const staffId = staffData.staff_id

    // 2. Create staff account
    const accountResponse = await fetch('http://localhost:8000/create_account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staff_id: staffId,
        username: email,
        password: password,
        is_active: true
      })
    })

    if (!accountResponse.ok) {
      throw new Error('Failed to create account')
    }

    // 3. Create role-specific entry (coach, scout, or med_staff)
    if (role === 'coach') {
      await fetch('http://localhost:8000/coach/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          role: 'Assistant Coach', // Default role
          team_id: null
        })
      })
    } else if (role === 'scout') {
      await fetch('http://localhost:8000/scout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          region: 'Unassigned',
          YOE: 0
        })
      })
    } else if (role === 'medical') {
      await fetch('http://localhost:8000/medical_staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          med_specialization: 'General',
          certification: 'Pending',
          YOE: 0
        })
      })
    }

    // 4. Log the user in
    return await login(email, password)

  } catch (error) {
    console.error('[v0] Signup error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Signup failed' 
    }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth')
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('auth')
  
  if (!authCookie) {
    return null
  }

  try {
    return JSON.parse(authCookie.value)
  } catch {
    return null
  }
}