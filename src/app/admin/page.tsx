"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { UserRole } from "@/shared/types/auth"
import { Navbar } from "@/shared/components/Navbar"
import { Card, Button } from "@/shared/components/ui"
import styles from "./page.module.css"

export default function AdminPage() {
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
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.content}>
        <h1 className={styles.title}>Panel de Administración</h1>

        <div className={styles.grid}>
          <Card title="Usuarios">
            <p className={styles.cardContent}>
              Gestiona los usuarios del sistema
            </p>
            <Button
              onClick={() => router.push("/admin/users")}
              variant="secondary"
              className={styles.cardButton}
            >
              Administrar Usuarios →
            </Button>
          </Card>

          <Card title="Películas">
            <p className={styles.cardContent}>
              Administra el catálogo de películas
            </p>
            <Button
              onClick={() => router.push("/admin/movies")}
              variant="secondary"
              className={styles.cardButton}
            >
              Gestionar Películas →
            </Button>
          </Card>

          <Card title="Salas">
            <p className={styles.cardContent}>Configura las salas de cine</p>
            <Button
              onClick={() => router.push("/admin/rooms")}
              variant="secondary"
              className={styles.cardButton}
            >
              Gestionar Salas →
            </Button>
          </Card>

          <Card title="Funciones">
            <p className={styles.cardContent}>Programa las funciones de cine</p>
            <Button
              onClick={() => router.push("/admin/showings")}
              variant="secondary"
              className={styles.cardButton}
            >
              Programar Funciones →
            </Button>
          </Card>

          <Card title="Reservas">
            <p className={styles.cardContent}>
              Monitorea las reservas del sistema
            </p>
            <Button
              onClick={() => router.push("/admin/bookings")}
              variant="secondary"
              className={styles.cardButton}
            >
              Ver Reservas →
            </Button>
          </Card>

          <Card title="Promociones">
            <p className={styles.cardContent}>Crea y gestiona promociones</p>
            <Button
              onClick={() => router.push("/admin/promotions")}
              variant="secondary"
              className={styles.cardButton}
            >
              Gestionar Promociones →
            </Button>
          </Card>

          <Card title="Reportes">
            <p className={styles.cardContent}>Genera reportes y estadísticas</p>
            <Button
              onClick={() => router.push("/admin/reports")}
              variant="secondary"
              className={styles.cardButton}
            >
              Ver Reportes →
            </Button>
          </Card>

          <Card title="Configuración">
            <p className={styles.cardContent}>
              Ajusta la configuración del sistema
            </p>
            <Button
              onClick={() => router.push("/admin/settings")}
              variant="secondary"
              className={styles.cardButton}
            >
              Configurar Sistema →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
