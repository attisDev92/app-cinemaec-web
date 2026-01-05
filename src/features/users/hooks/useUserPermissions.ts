"use client"

import { useState, useCallback } from "react"
import { userService } from "../services"
import type {
  User,
  UpdateUserPermissionsDto,
  UpdateUserRoleDto,
  UserRole,
} from "@/shared/types"

interface UseUserPermissionsReturn {
  user: User | null
  loading: boolean
  error: string | null
  success: boolean
  fetchUser: (userId: number) => Promise<void>
  updatePermissions: (userId: number, permissions: string[]) => Promise<void>
  updateRole: (
    userId: number,
    role: UserRole,
    permissions?: string[],
  ) => Promise<void>
  clearError: () => void
  clearSuccess: () => void
}

export function useUserPermissions(): UseUserPermissionsReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchUser = useCallback(async (userId: number) => {
    setLoading(true)
    setError(null)
    try {
      const userData = await userService.getUserById(userId)
      setUser(userData)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al cargar usuario"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePermissions = useCallback(
    async (userId: number, permissions: string[]) => {
      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const data: UpdateUserPermissionsDto = { permissions }
        const updatedUser = await userService.updateUserPermissions(
          userId,
          data,
        )
        setUser(updatedUser)
        setSuccess(true)

        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar permisos"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const updateRole = useCallback(
    async (userId: number, role: UserRole, permissions?: string[]) => {
      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const data: UpdateUserRoleDto = { role, permissions }
        const updatedUser = await userService.updateUserRole(userId, data)
        setUser(updatedUser)
        setSuccess(true)

        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar rol"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => setError(null), [])
  const clearSuccess = useCallback(() => setSuccess(false), [])

  return {
    user,
    loading,
    error,
    success,
    fetchUser,
    updatePermissions,
    updateRole,
    clearError,
    clearSuccess,
  }
}
