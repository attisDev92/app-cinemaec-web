"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PermissionManager } from "@/features/users/components"
import { PermissionEnum, UserRole } from "@/shared/types"
import styles from "./permissions.module.css"

export default function UserPermissionsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const userId = Number(params?.id)

  // Verificar permisos
  useEffect(() => {
    if (!isLoading && user) {
      // Solo admins con permiso assign_roles pueden acceder
      if (
        user.role !== UserRole.ADMIN ||
        !user.permissions?.includes(PermissionEnum.ASSIGN_ROLES)
      ) {
        router.push("/admin")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  if (
    !user ||
    user.role !== UserRole.ADMIN ||
    !user.permissions?.includes(PermissionEnum.ASSIGN_ROLES)
  ) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Acceso denegado</h2>
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
      </>
    )
  }

  if (!userId || isNaN(userId)) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Usuario no encontrado</h2>
            <p>El ID de usuario proporcionado no es válido</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <PermissionManager
            userId={userId}
            onClose={() => router.push("/admin/users")}
          />
        </div>
      </div>
    </>
  )
}
