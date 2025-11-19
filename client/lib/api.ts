const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T = any> {
  status: string
  data?: T
  count?: number
  error?: string
}

async function apiFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

// ============================================================================
// STAFF ENDPOINTS
// ============================================================================

export async function apiGetAllStaff() {
  return apiFetch('/staff')
}

export async function apiGetStaffById(staffId: number) {
  return apiFetch(`/staff/${staffId}`)
}

export async function apiCreateStaff(data: any) {
  return apiFetch('/staff/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiUpdateStaff(staffId: number, data: any) {
  return apiFetch(`/staff/${staffId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// PLAYER ENDPOINTS
// ============================================================================

export async function apiGetAllPlayers() {
  return apiFetch('/players')
}

export async function apiGetPlayerById(playerId: number) {
  return apiFetch(`/player/${playerId}`)
}

export async function apiGetPlayerDetails(playerId: number) {
  return apiFetch(`/player_details/${playerId}`)
}

export async function apiCreatePlayer(data: any) {
  return apiFetch('/player/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiCreatePlayerWithPhoto(formData: FormData) {
  // Special case: multipart/form-data
  const response = await fetch(`${API_BASE_URL}/player/create-with-photo`, {
    method: 'POST',
    body: formData, // Don't set Content-Type, browser will set it with boundary
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP ${response.status}`)
  }

  return await response.json()
}

export async function apiUpdatePlayer(playerId: number, data: any) {
  return apiFetch(`/player/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiDeletePlayer(playerId: number) {
  return apiFetch(`/player/${playerId}`, {
    method: 'DELETE',
  })
}

export async function apiSetPlayerInjured(playerId: number) {
  return apiFetch(`/player/injure/${playerId}`, {
    method: 'POST',
  })
}

export async function apiSetPlayerHealed(playerId: number) {
  return apiFetch(`/player/heal/${playerId}`, {
    method: 'POST',
  })
}

// ============================================================================
// MATCH ENDPOINTS
// ============================================================================

export async function apiGetAllMatches() {
  return apiFetch('/matches')
}

export async function apiGetMatchById(matchId: number) {
  return apiFetch(`/match/${matchId}`)
}

export async function apiGetFixtures() {
  return apiFetch('/fixtures')
}

export async function apiGetUpcomingFixtures() {
  return apiFetch('/fixtures/upcoming')
}

export async function apiCreateMatch(data: any) {
  return apiFetch('/match/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiUpdateMatchResult(matchId: number, result: string) {
  const formData = new FormData()
  formData.append('result', result)
  
  const response = await fetch(`${API_BASE_URL}/match/${matchId}/result`, {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP ${response.status}`)
  }

  return await response.json()
}

export async function apiDeleteMatch(matchId: number) {
  return apiFetch(`/match/${matchId}`, {
    method: 'DELETE',
  })
}

// ============================================================================
// COACH ENDPOINTS
// ============================================================================

export async function apiGetAllCoaches() {
  return apiFetch('/coaches')
}

export async function apiCreateCoach(data: any) {
  return apiFetch('/coach/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// SCOUT ENDPOINTS
// ============================================================================

export async function apiGetAllScouts() {
  return apiFetch('/scouts')
}

export async function apiCreateScout(data: any) {
  return apiFetch('/scout/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// MEDICAL ENDPOINTS
// ============================================================================

export async function apiGetAllMedicalStaff() {
  return apiFetch('/medical_staff')
}

export async function apiCreateMedicalStaff(data: any) {
  return apiFetch('/medical_staff/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiGetAllMedicalReports() {
  return apiFetch('/medical_reports')
}

export async function apiGetMedicalReportsByPlayer(playerId: number) {
  return apiFetch(`/medical_reports/${playerId}`)
}

export async function apiCreateMedicalReport(data: any) {
  return apiFetch('/medical_report/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// FORMATION & LINEUP ENDPOINTS
// ============================================================================

export async function apiGetAllFormations() {
  return apiFetch('/formations')
}

export async function apiCreateFormation(data: any) {
  return apiFetch('/formation/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiGetAllLineups() {
  return apiFetch('/lineups')
}

export async function apiGetLineupById(lineupId: number) {
  return apiFetch(`/lineups/${lineupId}`)
}

export async function apiCreateLineup(data: any) {
  return apiFetch('/lineup/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export async function apiLogin(username: string, password: string) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function apiCreateAccount(data: any) {
  return apiFetch('/create_account', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function apiHealthCheck() {
  return apiFetch('/health')
}