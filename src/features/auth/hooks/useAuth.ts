"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks"
import {
  loginAsync,
  registerAsync,
  logoutAsync,
  refreshUserAsync,
  updateUser as updateUserAction,
  clearError,
} from "../store/authSlice"
import { ExtendedUser, UserRole } from "@/shared/types"

export function useAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, isLoading, isAuthenticated, error } = useAppSelector(
    (state) => state.auth,
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginAsync({ email, password }))

      if (loginAsync.fulfilled.match(result)) {
        const user = result.payload

        // Verificar si el usuario está activo (email verificado)
        if (!user.isActive) {
          window.location.href = `/verify-email?email=${encodeURIComponent(user.email)}`
          throw new Error("Debes verificar tu email antes de continuar.")
        }

        // Redirigir según el estado del perfil
        if (!user.hasProfile) {
          window.location.href = "/complete-profile"
        } else if (!user.hasUploadedAgreement) {
          window.location.href = "/media-agreement"
        } else if (user.role === UserRole.ADMIN) {
          window.location.href = "/admin"
        } else {
          window.location.href = "/home"
        }
      } else {
        throw new Error((result.payload as string) || "Error al iniciar sesión")
      }
    },
    [dispatch, router],
  )

  const register = useCallback(
    async (email: string, cedula: string, password: string) => {
      const result = await dispatch(registerAsync({ email, cedula, password }))

      if (registerAsync.fulfilled.match(result)) {
        // Registro exitoso - mostrar página de verificación de email
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        throw new Error((result.payload as string) || "Error al registrarse")
      }
    },
    [dispatch, router],
  )

  const logout = useCallback(async () => {
    await dispatch(logoutAsync())
    router.push("/login")
  }, [dispatch, router])

  const updateUser = useCallback(
    (updatedUser: ExtendedUser) => {
      dispatch(updateUserAction(updatedUser))
    },
    [dispatch],
  )

  const refreshUser = useCallback(async () => {
    await dispatch(refreshUserAsync())
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    clearError: clearAuthError,
  }
}
