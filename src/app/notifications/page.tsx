"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks"
import { notificationService } from "@/shared/services/notification.service"
import { Notification, NotificationType } from "@/shared/types"
import styles from "./notifications.module.css"

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      let data: Notification[]
      if (filter === "unread") {
        data = await notificationService.getUnreadNotifications()
      } else {
        data = await notificationService.getAllNotifications()
      }

      if (filter === "read") {
        data = data.filter((n) => n.isRead)
      }

      setNotifications(data)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filter])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      )
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId)
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

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginPrompt}>
          <p>Debes iniciar sesión para ver tus notificaciones</p>
          <Link href="/login" className={styles.loginLink}>
            Ir a login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href="/home" className={styles.backLink}>
            ← Volver
          </Link>
          <h1 className={styles.title}>📬 Notificaciones</h1>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.tab} ${filter === "all" ? styles.active : ""}`}
            onClick={() => setFilter("all")}
          >
            Todas ({notifications.length})
          </button>
          <button
            className={`${styles.tab} ${filter === "unread" ? styles.active : ""}`}
            onClick={() => setFilter("unread")}
          >
            Sin leer ({unreadCount})
          </button>
          <button
            className={`${styles.tab} ${filter === "read" ? styles.active : ""}`}
            onClick={() => setFilter("read")}
          >
            Leídas ({notifications.filter((n) => n.isRead).length})
          </button>
        </div>

        <div className={styles.actions}>
          {unreadCount > 0 && (
            <button
              className={styles.markAllButton}
              onClick={handleMarkAllAsRead}
            >
              Marcar todo como leído
            </button>
          )}
          {notifications.length > 0 && (
            <button className={styles.clearAllButton} onClick={handleClearAll}>
              Limpiar todo
            </button>
          )}
        </div>

        <div className={styles.notificationsList}>
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
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notification} ${
                  !notification.isRead ? styles.unread : ""
                } ${getNotificationTypeClass(notification.type)}`}
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
                <div className={styles.notificationActions}>
                  {!notification.isRead && (
                    <button
                      className={styles.markReadButton}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      ✓ Marcar como leído
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteNotification(notification.id)}
                    aria-label="Eliminar notificación"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
