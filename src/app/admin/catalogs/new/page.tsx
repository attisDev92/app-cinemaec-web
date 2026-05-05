"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { PermissionEnum, UserRole } from "@/shared/types"
import { AdminCatalogForm } from "@/features/admin-catalogs"
import styles from "@/features/admin-catalogs/admin-catalogs.module.css"

export default function AdminNewCatalogPage() {
  const router = useRouter()
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
            <h1 className={styles.title}>Nuevo Catálogo</h1>
            <p className={styles.subtitle}>Registra un nuevo catálogo administrativo.</p>
          </div>
        </div>
        <section className={styles.card}>
          <AdminCatalogForm catalogId="new" />
        </section>
      </main>
    </div>
  )
}
