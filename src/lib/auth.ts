import { sessionStorageKey, userStorageKey } from '../constants'
import type { UserRole } from './permissions'

export type AuthUser = {
  id: string
  username: string
  passwordHash: string
  role: UserRole
}

export type AuthSession = {
  userId: string
  username: string
  role: UserRole
}

export type LoginDraft = {
  username: string
  password: string
}

export type UserDraft = {
  username: string
  password: string
}

const passwordSalt = 'pm-dashboard-v1'

export const adminUser: AuthUser = {
  id: 'admin-irvingzhao',
  username: 'irvingzhao',
  passwordHash: '74eaeb2b0159503599ba5c1f5d49dd353df8a31e92770b55b4c8c7e405da0c6a',
  role: 'owner',
}

const byteToHex = (byte: number) => byte.toString(16).padStart(2, '0')

export const hashPassword = async (username: string, password: string) => {
  const payload = `${passwordSalt}:${username.trim().toLowerCase()}:${password}`
  const data = new TextEncoder().encode(payload)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map(byteToHex).join('')
}

const normalizeUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<AuthUser>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.username !== 'string' ||
    typeof candidate.passwordHash !== 'string' ||
    (candidate.role !== 'owner' && candidate.role !== 'viewer')
  ) {
    return null
  }

  return {
    id: candidate.id,
    username: candidate.username.trim(),
    passwordHash: candidate.passwordHash,
    role: candidate.role,
  }
}

export const loadStoredUsers = (): AuthUser[] => {
  if (typeof window === 'undefined') {
    return [adminUser]
  }

  try {
    const storedValue = window.localStorage.getItem(userStorageKey)
    const storedUsers = storedValue ? JSON.parse(storedValue) : []
    const normalizedUsers = Array.isArray(storedUsers)
      ? storedUsers.map(normalizeUser).filter((user): user is AuthUser => user !== null)
      : []
    const viewerUsers = normalizedUsers.filter((user) => user.id !== adminUser.id && user.username !== adminUser.username)

    return [adminUser, ...viewerUsers]
  } catch {
    return [adminUser]
  }
}

export const saveUsers = (users: AuthUser[]) => {
  window.localStorage.setItem(userStorageKey, JSON.stringify([adminUser, ...users.filter((user) => user.role === 'viewer')]))
}

export const loadStoredSession = (users: AuthUser[]): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(sessionStorageKey)
    if (!storedValue) {
      return null
    }

    const candidate = JSON.parse(storedValue) as Partial<AuthSession>
    const user = users.find((item) => item.id === candidate.userId)

    return user ? { userId: user.id, username: user.username, role: user.role } : null
  } catch {
    return null
  }
}

export const saveSession = (session: AuthSession) => {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export const clearSession = () => {
  window.localStorage.removeItem(sessionStorageKey)
}

export const authenticateUser = async (users: AuthUser[], draft: LoginDraft): Promise<AuthSession | null> => {
  const username = draft.username.trim().toLowerCase()
  const user = users.find((item) => item.username.toLowerCase() === username)

  if (!user) {
    return null
  }

  const passwordHash = await hashPassword(username, draft.password)
  if (passwordHash !== user.passwordHash) {
    return null
  }

  return { userId: user.id, username: user.username, role: user.role }
}

export const createViewerUser = async (draft: UserDraft): Promise<AuthUser> => {
  const username = draft.username.trim()
  return {
    id: window.crypto.randomUUID?.() ?? `user-${Date.now()}`,
    username,
    passwordHash: await hashPassword(username, draft.password),
    role: 'viewer',
  }
}
