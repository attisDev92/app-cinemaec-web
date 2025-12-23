import { apiClient } from "@/lib/api-client"
import {
  Notification,
  NotificationCountResponse,
} from "@/shared/types/notification"

class NotificationService {
  /**
   * Obtener todas las notificaciones del usuario autenticado
   */
  async getAllNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications")
  }

  /**
   * Obtener solo notificaciones no leídas
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications/unread")
  }

  /**
   * Obtener el contador de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<NotificationCountResponse>(
      "/notifications/unread/count",
    )
    return response.count
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    return apiClient.patch<Notification>(
      `/notifications/${notificationId}/read`,
      {},
    )
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch<void>("/notifications/read-all", {})
  }

  /**
   * Eliminar una notificación específica
   */
  async deleteNotification(notificationId: number): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`)
  }

  /**
   * Eliminar todas las notificaciones del usuario
   */
  async deleteAllNotifications(): Promise<void> {
    return apiClient.delete<void>("/notifications")
  }
}

export const notificationService = new NotificationService()
