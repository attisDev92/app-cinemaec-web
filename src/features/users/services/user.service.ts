import { apiClient } from "@/lib/api-client"
import type {
  User,
  UpdateUserPermissionsDto,
  UpdateUserRoleDto,
  UserListItem,
} from "@/shared/types"

class UserService {
  /**
   * Obtener información de un usuario específico
   * GET /users/:id
   */
  async getUserById(userId: number): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`)
  }

  /**
   * Actualizar permisos de un usuario
   * PUT /users/:id/permissions
   * Requiere: Token JWT + Ser ADMIN + Tener permiso assign_roles
   */
  async updateUserPermissions(
    userId: number,
    data: UpdateUserPermissionsDto,
  ): Promise<User> {
    return apiClient.put<User>(`/users/${userId}/permissions`, data)
  }

  /**
   * Actualizar rol de un usuario
   * PUT /users/:id/role
   * Requiere: Token JWT + Ser ADMIN + Tener permiso assign_roles
   */
  async updateUserRole(userId: number, data: UpdateUserRoleDto): Promise<User> {
    return apiClient.put<User>(`/users/${userId}/role`, data)
  }

  /**
   * Obtener lista de todos los usuarios (para administradores)
   * GET /users
   * Requiere: Token JWT + Ser ADMIN + Tener permiso admin_users
   */
  async getAllUsers(): Promise<UserListItem[]> {
    return apiClient.get<UserListItem[]>("/users")
  }
}

export const userService = new UserService()
