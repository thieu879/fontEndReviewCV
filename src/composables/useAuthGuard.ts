import { useAuth } from '../composables/useAuth'
import { cookieStorage } from '../api/axios'

export function useAuthGuard() {
  const { user } = useAuth()

  const isAuthenticated = (): boolean => {
    const accessToken = cookieStorage.getItem('accessToken')
    const refreshToken = cookieStorage.getItem('refreshToken')
    return !!accessToken && !!refreshToken
  }

  const isAdmin = (): boolean => {
    if (!user.value) return false
    const role = user.value.role?.toLowerCase() || ''
    return role === 'admin' || user.value.roleNames?.some((r: string) => 
      r.toLowerCase() === 'admin' || r.toLowerCase() === 'role_admin'
    ) || false
  }

  const canAccess = (routeMeta: any): { allowed: boolean; reason?: string } => {
    if (!isAuthenticated()) {
      return { allowed: false, reason: 'not_authenticated' }
    }

    if (routeMeta.requiresAdmin && !isAdmin()) {
      return { allowed: false, reason: 'not_admin' }
    }

    return { allowed: true }
  }

  return {
    isAuthenticated,
    isAdmin,
    canAccess
  }
}

export default useAuthGuard
