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

export async function apiGetStaffById(staffId: number) {
  return fetchApi<ApiResponse<{
    staff_id: number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    salary: number
    age: number
    date_hired: string
    staff_type: string
  }>>(`/staff/${staffId}`)
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

export async function apiGetPlayerDetails(playerId: number) {
  return fetchApi<ApiResponse<any>>(`/player_details/${playerId}`)
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

export async function apiGetAllMatches() {
  return fetchApi<ApiResponse<Array<{
    match_id: number
    name: string
    venue: string
    match_time: string
    opponent_team: string
    match_date: string
    result?: string
  }>>>('/matches')
}

export async function apiGetMatchById(matchId: number) {
  return fetchApi<ApiResponse<{
    match_id: number
    name: string
    venue: string
    match_time: string
    opponent_team: string
    match_date: string
    result?: string
  }>>(`/match/${matchId}`)
}

export async function apiCreateMatch(data: {
  name: string
  venue: string
  match_time: string
  opponent_team: string
  match_date: string
  result?: string
}) {
  return fetchApi<{ status: string; match_id: number }>('/match/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Coaches
export async function apiGetCoaches() {
  return fetchApi<ApiResponse<Array<{
    staff_id: number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    role: string
    team_id?: number
  }>>>('/coaches')
}

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
export async function apiGetMedicalStaff() {
  return fetchApi<ApiResponse<Array<{
    staff_id: number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    med_specialization: string
    certification: string
    YOE: number
  }>>>('/medical_staff')
}

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
export async function apiGetMedicalReports() {
  return fetchApi<ApiResponse<Array<any>>>('/medical_reports')
}

export async function apiGetMedicalReportsByPlayer(playerId: number) {
  return fetchApi<ApiResponse<Array<any>>>(`/medical_reports/${playerId}`)
}

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

// Formations
export async function apiGetFormations() {
  return fetchApi<ApiResponse<Array<{
    formation_id: number
    code: string
    name: string
  }>>>('/formations')
}

export async function apiCreateFormation(data: {
  code: string
  name: string
}) {
  return fetchApi<{ status: string; formation_id: number }>('/formation/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Lineups
export async function apiGetLineups() {
  return fetchApi<ApiResponse<Array<any>>>('/lineups')
}

export async function apiGetLineupDetails(lineupId: number) {
  return fetchApi<ApiResponse<any>>(`/lineups/${lineupId}`)
}

export async function apiCreateLineup(data: {
  match_id?: number
  team_id?: number
  formation_id: number
  is_starting: boolean
  minute_applied?: number
  slots: Array<{
    slot_no: number
    player_id: number
    jersey_number: number
    captain: boolean
  }>
}) {
  return fetchApi<{ status: string; lineup_id: number }>('/lineup/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
