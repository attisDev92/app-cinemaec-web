"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { notificationService } from "@/shared/services/notification.service"
import { Notification, NotificationType } from "@/shared/types"
import styles from "./NotificationDropdown.module.css"

export const NotificationDropdown = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cargar contador de notificaciones no leídas al montar
  useEffect(() => {
    loadUnreadCount()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error("Error al cargar contador de notificaciones:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getAllNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marcar como leída si no lo está
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id)
        setUnreadCount((prev) => Math.max(0, prev - 1))
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ),
        )
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  const handleDeleteNotification = async (
    notificationId: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation()
    try {
      await notificationService.deleteNotification(notificationId)
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId,
      )
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("Error al eliminar notificación:", error)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm("¿Estás seguro de eliminar todas las notificaciones?")) {
      try {
        await notificationService.deleteAllNotifications()
        setNotifications([])
        setUnreadCount(0)
      } catch (error) {
        console.error("Error al eliminar todas las notificaciones:", error)
      }
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return "✓"
      case NotificationType.INFO:
        return "ℹ"
      case NotificationType.WARNING:
        return "⚠"
      case NotificationType.ERROR:
        return "✕"
      default:
        return "•"
    }
  }

  const getNotificationTypeClass = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return styles.success
      case NotificationType.INFO:
        return styles.info
      case NotificationType.WARNING:
        return styles.warning
      case NotificationType.ERROR:
        return styles.error
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return "Ahora"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    if (diffInDays < 7) return `Hace ${diffInDays}d`
    return date.toLocaleDateString("es-EC", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notificaciones</h3>
            {notifications.length > 0 && (
              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button
                    className={styles.markAllButton}
                    onClick={handleMarkAllAsRead}
                  >
                    Marcar todo como leído
                  </button>
                )}
                <button
                  className={styles.clearAllButton}
                  onClick={handleClearAll}
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

          <div className={styles.content}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📭</div>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className={styles.list}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notification} ${
                      !notification.isRead ? styles.unread : ""
                    } ${getNotificationTypeClass(notification.type)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationTitle}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className={styles.unreadDot}></span>
                        )}
                      </div>
                      <div className={styles.notificationMessage}>
                        {notification.message}
                      </div>
                      <div className={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) =>
                        handleDeleteNotification(notification.id, e)
                      }
                      aria-label="Eliminar notificación"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              className={styles.viewAllButton}
              onClick={() => {
                router.push("/notifications")
                setIsOpen(false)
              }}
            >
              Ver todas las notificaciones →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
