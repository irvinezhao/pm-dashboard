export type UserRole = 'owner' | 'viewer'

export const canEdit = (role: UserRole) => role === 'owner'
