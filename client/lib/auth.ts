'use server'

import { cookies } from 'next/headers'

export type UserRole = 'coach' | 'medical' | 'player' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Mock user storage (in production, use a database)
const users: Map<string, User & { password: string }> = new Map([
  ['admin@soms.app', {
    id: '1',
    email: 'admin@soms.app',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123'
  }],
  ['coach@soms.app', {
    id: '2',
    email: 'coach@soms.app',
    name: 'Coach Smith',
    role: 'coach',
    password: 'coach123'
  }],
  ['medical@soms.app', {
    id: '3',
    email: 'medical@soms.app',
    name: 'Dr. Johnson',
    role: 'medical',
    password: 'medical123'
  }],
  ['player@soms.app', {
    id: '4',
    email: 'player@soms.app',
    name: 'Player One',
    role: 'player',
    password: 'player123'
  }]
])

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const user = users.get(email)
  
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid email or password' }
  }

  const { password: _, ...userWithoutPassword } = user
  
  const cookieStore = await cookies()
  cookieStore.set('auth', JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })

  return { success: true, user: userWithoutPassword }
}

export async function signup(email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; error?: string; user?: User }> {
  if (users.has(email)) {
    return { success: false, error: 'Email already exists' }
  }

  const newUser: User & { password: string } = {
    id: String(users.size + 1),
    email,
    name,
    role,
    password
  }

  users.set(email, newUser)

  const { password: _, ...userWithoutPassword } = newUser
  
  const cookieStore = await cookies()
  cookieStore.set('auth', JSON.stringify(userWithoutPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return { success: true, user: userWithoutPassword }
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