"use client"

import { useState, useCallback, useEffect } from "react"
import { userService } from "../services"
import type { UserListItem } from "@/shared/types"

interface UseUserListReturn {
  users: UserListItem[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  clearError: () => void
}

export function useUserList(): UseUserListReturn {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al cargar usuarios"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar usuarios automáticamente cuando se monta el componente
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const clearError = useCallback(() => setError(null), [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    clearError,
  }
}
