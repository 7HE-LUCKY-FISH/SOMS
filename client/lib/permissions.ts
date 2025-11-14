import type { UserRole } from './auth'

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: ['*'],
    coach: [
      'view:dashboard',
      'create:lineup',
      'edit:lineup',
      'view:lineup',
      'view:roster',
      'edit:roster',
      'view:player',
      'create:notes',
      'view:medical',
      'create:match',
      'edit:match',
      'view:analytics'
    ],
    medical: [
      'view:dashboard',
      'view:lineup',
      'view:roster',
      'view:player',
      'create:notes',
      'create:injury',
      'edit:injury',
      'view:medical',
      'view:analytics'
    ],
    player: [
      'view:dashboard',
      'view:lineup',
      'view:roster',
      'view:player',
      'view:medical:self'
    ]
  }

  const userPermissions = permissions[userRole] || []
  return userPermissions.includes('*') || userPermissions.includes(permission)
}