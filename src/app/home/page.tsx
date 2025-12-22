"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { UserRole } from "@/shared/types/auth"
import { LegalStatus } from "@/features/profile/types"
import { Navbar } from "@/shared/components/Navbar"
import { Card, Button } from "@/shared/components/ui"
import styles from "./page.module.css"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { profile, loadProfile } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    } else if (
      !isLoading &&
      user &&
      user.hasProfile &&
      !user.hasUploadedAgreement
    ) {
      // Si tiene perfil pero no ha subido el acuerdo, redirigir a media-agreement
      router.push("/media-agreement")
    } else if (!isLoading && user && user.role === UserRole.ADMIN) {
      // Los administradores deben usar el dashboard de admin
      router.push("/admin")
    } else if (!isLoading && user && user.hasProfile && !profile) {
      // Cargar el perfil si aún no está cargado
      loadProfile()
    }
  }, [isAuthenticated, isLoading, user, router, profile, loadProfile])

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  if (!user || user.role === UserRole.ADMIN) {
    return null
  }

  // Determinar el nombre a mostrar
  const displayName =
    profile?.legalStatus === LegalStatus.LEGAL_ENTITY
      ? profile?.tradeName
      : profile?.fullName || user.email

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido, {displayName}!</h1>
        </div>

        <div className={styles.grid}>
          <Card title="Mi Perfil">
            <p className={styles.cardContent}>
              Administra tu información personal
            </p>
            <Button
              onClick={() => router.push("/profile")}
              variant="secondary"
              className={styles.cardButton}
            >
              Ver Perfil →
            </Button>
          </Card>

          <Card title="Red de Espacios Audiovisuales">
            <p className={styles.cardContent}>
              Registra y accede a tus espacios de la REA
            </p>
            <Button
              onClick={() => router.push("/rea-spaces")}
              variant="secondary"
              className={styles.cardButton}
            >
              Gestionar Espacios →
            </Button>
          </Card>

          <Card title="Usuario del Banco de Contenidos">
            <p className={styles.cardContent}>
              Accede al préstamo de obras cinematográficas para proyectos
              itinerantes
            </p>
            <p
              style={{ fontStyle: "italic", width: "100%", fontWeight: "bold" }}
            >
              !Proximamente!
            </p>
          </Card>

          <Card title="Catálogo de Locaciones">
            <p className={styles.cardContent}>
              Registra y gestiona tus locaciones para producciones audiovisuales
              en la web de la Ecuador Film Commission.
            </p>
            <p
              style={{ fontStyle: "italic", width: "100%", fontWeight: "bold" }}
            >
              !Proximamente!
            </p>
          </Card>

          <Card title="Directorio de Empresas Productoras">
            <p className={styles.cardContent}>
              Registra y gestiona tu empresa productora en el directorio de
              empresas de la Ecuador Film Commission.
            </p>
            <p
              style={{ fontStyle: "italic", width: "100%", fontWeight: "bold" }}
            >
              !Proximamente!
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
