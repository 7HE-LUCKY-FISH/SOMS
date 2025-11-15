const API_BASE_URL = 'http://localhost:8000'

export interface ApiResponse<T> {
  status: string
  data?: T
  count?: number
  error?: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(response.status, error.detail || 'API request failed')
  }

  return response.json()
}

// Auth
export async function apiLogin(username: string, password: string) {
  return fetchApi<{ status: string; staff_id: number }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

// Staff
export async function apiGetAllStaff() {
  return fetchApi<ApiResponse<Array<{
    staff_id: number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    salary: number
    age: number
    date_hired: string
    staff_type: string
  }>>>('/staff')
}

export async function apiCreateStaff(data: {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  salary: number
  age: number
  staff_type: string
}) {
  return fetchApi<{ status: string; staff_id: number }>('/staff/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Players
export async function apiGetAllPlayers() {
  return fetchApi<ApiResponse<Array<{
    player_id: number
    first_name: string
    middle_name?: string
    last_name: string
    salary: number
    positions?: string
    is_active: boolean
    is_injured: boolean
    transfer_value?: number
    contract_end_date?: string
    scouted_player: boolean
  }>>>('/players')
}

export async function apiCreatePlayer(data: {
  first_name: string
  middle_name?: string
  last_name: string
  salary: number
  positions?: string
  is_active?: boolean
  is_injured?: boolean
  transfer_value?: number
  contract_end_date?: string
  scouted_player?: boolean
}) {
  return fetchApi<{ status: string; player_id: number }>('/player/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Scouts
export async function apiGetAllScouts() {
  return fetchApi<ApiResponse<Array<{
    staff_id: number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    region?: string
    YOE: number
  }>>>('/scouts')
}

export async function apiCreateScout(data: {
  staff_id: number
  region?: string
  YOE: number
}) {
  return fetchApi<{ status: string; staff_id: number }>('/scout/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Fixtures/Matches
export async function apiGetAllFixtures() {
  return fetchApi<ApiResponse<Array<{
    match_id: number
    name: string
    venue: string
    match_time: string
    opponent_team: string
    match_date: string
    result?: string
  }>>>('/fixtures')
}

export async function apiGetUpcomingFixtures() {
  return fetchApi<ApiResponse<Array<{
    match_id: number
    name: string
    venue: string
    match_time: string
    opponent_team: string
    match_date: string
    result?: string
  }>>>('/fixtures/upcoming')
}

// Coaches
export async function apiCreateCoach(data: {
  staff_id: number
  role: string
  team_id?: number
}) {
  return fetchApi<{ status: string; staff_id: number }>('/coach/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Medical Staff
export async function apiCreateMedicalStaff(data: {
  staff_id: number
  med_specialization: string
  certification: string
  YOE: number
}) {
  return fetchApi<{ status: string; staff_id: number }>('/medical_staff/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Medical Reports
export async function apiCreateMedicalReport(data: {
  player_id: number
  summary?: string
  report_date: string
  treatment?: string
  severity_of_injury?: string
}) {
  return fetchApi<{ status: string; med_report_id: number }>('/medical_report/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
