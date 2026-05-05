"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { PermissionEnum, UserRole } from "@/shared/types"
import { AdminCatalogForm } from "@/features/admin-catalogs"
import styles from "@/features/admin-catalogs/admin-catalogs.module.css"

export default function AdminEditCatalogPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()

  const hasCatalogPermission = hasPermission(PermissionEnum.ADMIN_CATALOGS)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && (user.role !== UserRole.ADMIN || !hasCatalogPermission)) {
        router.push("/home")
      }
    }
  }, [isAuthenticated, isLoading, user, hasCatalogPermission, router])

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingMessage}>Cargando...</div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated || (user && (user.role !== UserRole.ADMIN || !hasCatalogPermission))) {
    return null
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Editar Catálogo</h1>
            <p className={styles.subtitle}>Actualiza la información del catálogo.</p>
          </div>
        </div>
        <section className={styles.card}>
          <AdminCatalogForm catalogId={params.id} />
        </section>
      </main>
    </div>
  )
}
