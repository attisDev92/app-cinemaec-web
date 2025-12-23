import { apiClient } from "@/lib/api-client"
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "@/features/auth/types"
import { ExtendedUser } from "@/shared/types"
import {
  CompleteProfileData,
  UpdateProfileData,
  ChangePasswordData,
} from "@/features/profile/types"
import { ApiResponse } from "@/shared/types/api"

export const authService = {
  // Duración de la sesión: 7 días (en milisegundos)
  TOKEN_EXPIRATION_TIME: 7 * 24 * 60 * 60 * 1000,

  // Transformar claves snake_case a camelCase y asegurar permisos
  transformUserFromBackend(backendUser: Record<string, unknown>): ExtendedUser {
    const permissions = Array.isArray(backendUser.permissions)
      ? (backendUser.permissions as string[])
      : []

    return {
      id: backendUser.id as number,
      email: backendUser.email as string,
      cedula: backendUser.cedula as string,
      role: backendUser.role as ExtendedUser["role"],
      permissions: permissions as ExtendedUser["permissions"],
      isActive:
        (backendUser.is_active as boolean) ?? (backendUser.isActive as boolean),
      hasProfile:
        (backendUser.has_profile as boolean) ??
        (backendUser.hasProfile as boolean),
      emailVerificationToken:
        (backendUser.email_verification_token as string | null) ?? null,
      passwordResetToken:
        (backendUser.password_reset_token as string | null) ?? null,
      passwordResetExpires:
        (backendUser.password_reset_expires as string | null) ?? undefined,
      profileId: (backendUser.profile_id as number | null) ?? null,
      lastLogin: (backendUser.last_login as string | null) ?? undefined,
      createdAt: backendUser.created_at as string | undefined,
      firstName: backendUser.first_name as string | undefined,
      lastName: backendUser.last_name as string | undefined,
      phone: backendUser.phone as string | undefined,
      hasLocation: backendUser.has_location as boolean | undefined,
      hasCompany: backendUser.has_company as boolean | undefined,
      hasSpace: backendUser.has_space as boolean | undefined,
      isUserCB: backendUser.is_user_cb as boolean | undefined,
      userCBApproved: backendUser.user_cb_approved as boolean | undefined,
      hasUploadedAgreement: backendUser.has_uploaded_agreement as
        | boolean
        | undefined,
      updatedAt: backendUser.updated_at as string | undefined,
    }
  },

  saveSession(token: string, user: ExtendedUser): void {
    const expiresAt = Date.now() + this.TOKEN_EXPIRATION_TIME
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("tokenExpiresAt", expiresAt.toString())

    // Guardar también en cookie para el middleware
    const expirationDate = new Date(expiresAt)
    document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`
  },

  clearSession(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("tokenExpiresAt")

    // Limpiar también la cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  },

  isSessionValid(): boolean {
    const token = localStorage.getItem("token")
    const expiresAtStr = localStorage.getItem("tokenExpiresAt")

    if (!token || !expiresAtStr) {
      return false
    }

    const expiresAt = parseInt(expiresAtStr, 10)
    const now = Date.now()

    // Verificar si el token ha expirado
    if (now >= expiresAt) {
      this.clearSession()
      return false
    }

    return true
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{
      accessToken: string
      user: Record<string, unknown>
    }>("/users/login", credentials, false)

    if (response.accessToken && response.user) {
      const transformedUser = this.transformUserFromBackend(response.user)

      this.saveSession(response.accessToken, transformedUser)
      return {
        accessToken: response.accessToken,
        user: transformedUser,
      }
    }

    throw new Error("Error en el inicio de sesión")
  },

  async register(
    data: RegisterData,
  ): Promise<{ message: string; userId: number }> {
    const response = await apiClient.post<{ message: string; userId: number }>(
      "/users/register",
      data,
      false,
    )

    return response
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {})
    } finally {
      this.clearSession()
    }
  },

  async getCurrentUser(): Promise<ExtendedUser> {
    const response = await apiClient.get<
      ApiResponse<Record<string, unknown>> | Record<string, unknown>
    >("/users/me")

    // El backend puede devolver el usuario directamente o dentro de un objeto data
    const userData =
      "data" in response && response.data ? response.data : response

    // Mantener permisos previos si /users/me no los envía
    const storedUser = this.getStoredUser()

    if (userData) {
      const transformedUser = this.transformUserFromBackend(
        userData as Record<string, unknown>,
      )

      if (
        (!transformedUser.permissions ||
          transformedUser.permissions.length === 0) &&
        storedUser?.permissions &&
        storedUser.permissions.length > 0
      ) {
        transformedUser.permissions = storedUser.permissions
      }

      localStorage.setItem("user", JSON.stringify(transformedUser))
      return transformedUser
    }

    throw new Error("No se recibieron datos del usuario")
  },

  async completeProfile(data: CompleteProfileData): Promise<ExtendedUser> {
    // Crear el perfil en el backend
    await apiClient.post("/profiles", data)

    // Obtener el usuario actualizado con el perfil completo
    const updatedUser = await this.getCurrentUser()

    // Actualizar el usuario en localStorage
    const storedUser = this.getStoredUser()
    if (storedUser) {
      const userWithProfile = {
        ...storedUser,
        hasProfile: true,
      }
      localStorage.setItem("user", JSON.stringify(userWithProfile))
    }

    return updatedUser
  },

  getStoredUser(): ExtendedUser | null {
    if (!this.isSessionValid()) {
      return null
    }
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  getStoredToken(): string | null {
    if (!this.isSessionValid()) {
      return null
    }
    return localStorage.getItem("token")
  },

  isAuthenticated(): boolean {
    return this.isSessionValid() && !!this.getStoredToken()
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/forgot-password",
      { email },
      false,
    )
    return response
  },

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/reset-password",
      { token, newPassword },
      false,
    )
    return response
  },
}

export const userService = {
  // Transformar profile del backend (snake_case) a camelCase
  transformProfileFromBackend(backendProfile: Record<string, unknown>) {
    return {
      id: backendProfile.id as number,
      fullName: (backendProfile.fullName || backendProfile.full_name) as string,
      legalName: (backendProfile.legalName ?? backendProfile.legal_name) as
        | string
        | null,
      tradeName: (backendProfile.tradeName ?? backendProfile.trade_name) as
        | string
        | null,
      legalStatus: (backendProfile.legalStatus ??
        backendProfile.legal_status) as string,
      birthdate: (backendProfile.birthdate ?? null) as string | null,
      province: (backendProfile.province ?? null) as string | null,
      city: (backendProfile.city ?? null) as string | null,
      address: (backendProfile.address ?? null) as string | null,
      phone: (backendProfile.phone ?? null) as string | null,
      userId: (backendProfile.userId ?? backendProfile.user_id) as number,
      createdAt: (backendProfile.createdAt ??
        backendProfile.created_at) as string,
      updatedAt: (backendProfile.updatedAt ??
        backendProfile.updated_at) as string,
    }
  },

  async getProfile() {
    const response = await apiClient.get<Record<string, unknown>>("/profiles")
    console.log("📦 Respuesta del backend (getProfile):", response)
    const transformed = this.transformProfileFromBackend(response)
    console.log("✅ Perfil transformado:", transformed)
    return transformed
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await apiClient.request<Record<string, unknown>>(
      "/profiles",
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    )
    return this.transformProfileFromBackend(response)
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await apiClient.request<{ message: string }>(
      "/users/change-password",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    )
    return response
  },
}
