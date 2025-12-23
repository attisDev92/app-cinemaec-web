// Notification Types

export enum NotificationType {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export enum NotificationReferenceType {
  SPACE = "space",
  MOVIE = "movie",
  USER = "user",
  CONTRACT = "contract",
  REQUEST = "request",
  GENERAL = "general",
}

export interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  link?: string
  referenceType?: NotificationReferenceType
  referenceId?: number
  createdAt: string
  updatedAt: string
}

export interface NotificationCountResponse {
  count: number
}
