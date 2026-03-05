import { useCallback, useMemo } from "react"
import { useAuth } from "./useAuth"
import { PermissionEnum } from "@/shared/types"

/**
 * Hook para verificar permisos de administrador
 * @returns Métodos para verificar permisos
 */
export const usePermissions = () => {
  const { user } = useAuth()

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((permission: PermissionEnum): boolean => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission)
  }, [user])

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = useCallback((permissions: PermissionEnum[]): boolean => {
    if (!user || !user.permissions) return false
    return permissions.some((permission) =>
      user.permissions!.includes(permission),
    )
  }, [user])

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = useCallback((permissions: PermissionEnum[]): boolean => {
    if (!user || !user.permissions) return false
    return permissions.every((permission) =>
      user.permissions!.includes(permission),
    )
  }, [user])

  return useMemo(
    () => ({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [hasPermission, hasAnyPermission, hasAllPermissions],
  )
}
