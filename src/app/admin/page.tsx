"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { UserRole, PermissionEnum } from "@/shared/types"
import { Navbar } from "@/shared/components/Navbar"
import styles from "./page.module.css"

interface AdminModule {
  id: string
  title: string
  description: string
  icon: string
  route: string
  permission: PermissionEnum
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== UserRole.ADMIN) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, user, router])

  const modules: AdminModule[] = [
    {
      id: "spaces",
      title: "Gestión de Espacios",
      description: "Administrar espacios REA y solicitudes",
      icon: "🎬",
      route: "/admin/spaces",
      permission: PermissionEnum.ADMIN_SPACES,
    },
    {
      id: "movies",
      title: "Gestión de Películas",
      description: "Crear y administrar películas del catálogo",
      icon: "🎥",
      route: "/admin/movies-management",
      permission: PermissionEnum.ADMIN_MOVIES,
    },
    {
      id: "movie-requests",
      title: "Solicitudes de Películas",
      description: "Aprobar o rechazar solicitudes (En desarrollo)",
      icon: "📋",
      route: "/admin/movie-requests",
      permission: PermissionEnum.APPROVE_MOVIES_REQUEST,
    },
    {
      id: "users",
      title: "Gestión de Usuarios",
      description: "Administrar usuarios del sistema",
      icon: "👥",
      route: "/admin/users",
      permission: PermissionEnum.ADMIN_USERS,
    },
    {
      id: "roles",
      title: "Roles y Permisos",
      description: "Asignar roles y permisos (En desarrollo)",
      icon: "🔐",
      route: "/admin/roles",
      permission: PermissionEnum.ASSIGN_ROLES,
    },
    {
      id: "reports",
      title: "Reportes",
      description: "Ver reportes y estadísticas (En desarrollo)",
      icon: "📊",
      route: "/admin/reports",
      permission: PermissionEnum.VIEW_REPORTS,
    },
    {
      id: "export",
      title: "Exportar Datos",
      description: "Exportar información del sistema (En desarrollo)",
      icon: "📥",
      route: "/admin/export",
      permission: PermissionEnum.EXPORT_DATA,
    },
  ]

  // Filtrar módulos según permisos
  const allowedModules = modules.filter((module) =>
    hasPermission(module.permission),
  )

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingPage}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Panel de Administración</h1>
          <p className={styles.welcome}>
            Bienvenido, {user.firstName || user.email}
          </p>
        </div>

        {allowedModules.length === 0 ? (
          <div className={styles.noPermissions}>
            <p>No tienes permisos asignados para acceder a ningún módulo.</p>
            <p>Contacta al administrador principal para solicitar acceso.</p>
          </div>
        ) : (
          <div className={styles.modulesGrid}>
            {allowedModules.map((module) => (
              <div
                key={module.id}
                className={styles.moduleCard}
                onClick={() => router.push(module.route)}
              >
                <div className={styles.moduleIcon}>{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
