"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { UserRole } from "@/shared/types"
import { Navbar } from "@/shared/components/Navbar"
import styles from "../page.module.css"

export default function RolesAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== UserRole.ADMIN) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, user, router])

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
          <h1>🔐 Roles y Permisos</h1>
        </div>

        <div className={styles.developmentNotice}>
          <div className={styles.constructionIcon}>🚧</div>
          <h2>Módulo en Desarrollo</h2>
          <p>
            Esta sección está actualmente en construcción y estará disponible
            próximamente.
          </p>
          <p className={styles.features}>Funcionalidades planificadas:</p>
          <ul className={styles.featuresList}>
            <li>Gestión de roles de usuario</li>
            <li>Asignación de permisos granulares</li>
            <li>Control de acceso a módulos</li>
            <li>Auditoría de cambios de permisos</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
