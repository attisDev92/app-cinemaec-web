"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { UserRole } from "@/shared/types/auth"
import { LegalStatus } from "@/features/profile/types"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card } from "@/shared/components/ui"
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
          <div>
            <p className={styles.welcome}>Bienvenido</p>
            <h1 className={styles.title}>{displayName}</h1>
          </div>
          <Button
            onClick={() => router.push("/profile")}
            variant="secondary"
            className={styles.profileButton}
          >
            Ver y editar perfil
          </Button>
        </div>

        <HomePanels
          router={router}
          isLegalEntity={profile?.legalStatus === LegalStatus.LEGAL_ENTITY}
        />
      </div>
    </div>
  )
}

function HomePanels({
  router,
  isLegalEntity,
}: {
  router: ReturnType<typeof useRouter>
  isLegalEntity: boolean
}) {
  const [openGroup, setOpenGroup] = useState<"vive" | "haz" | null>(null)

  const toggleGroup = (group: "vive" | "haz") => {
    setOpenGroup((prev) => (prev === group ? null : group))
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.groupsGrid}>
          <article
            className={`${styles.serviceGroup} ${styles.viveGroup} ${
              openGroup === "vive"
                ? `${styles.panelOpen} ${styles.expanded}`
                : openGroup === "haz"
                  ? styles.collapsed
                  : ""
            }`}
            onClick={() => toggleGroup("vive")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleGroup("vive")
            }}
          >
            <div className={styles.logoFrame}>
              <Image
                src="/images/logos/vivecine-horizontal-oscuro1.png"
                alt="Vive Cine"
                width={240}
                height={120}
                className={styles.groupLogo}
              />
            </div>

            <p className={styles.groupIntro}>
              Servicios disponibles para espacios, gestores y usuarios de la
              Red de Espacios Audiovisuales.
            </p>

            <ul className={styles.serviceList}>
              <li>Registro y gestión de Espacios REA</li>
              <li>Acceso al Banco de Contenidos</li>
              <li>Talleres y capacitaciones</li>
            </ul>

            {openGroup === "vive" && (
              <div
                className={styles.panelModules}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`${styles.moduleCard} ${styles.viveModule}`}>
                  <Card title="Espacios Audiovisuales de Vive Cine (REA)">
                    <p className={styles.cardContent}>
                      Registra y accede a tus espacios audiovisuales para formar
                      parte de Vive Cine (Red de Espacios Audiovisuales).
                    </p>
                    <Button
                      onClick={() => router.push("/rea-spaces")}
                      variant="secondary"
                      className={styles.cardButton}
                    >
                      Gestionar Espacios →
                    </Button>
                  </Card>
                </div>

                <div className={`${styles.moduleCard} ${styles.viveModule}`}>
                  <Card title="Usuario del Banco de Contenidos">
                    <p className={styles.cardContent}>
                      Accede al préstamo de obras cinematográficas para
                      exhibición en espacios de la REA y gestores culturales.
                    </p>
                    <p className={styles.tag}>Próximamente</p>
                  </Card>
                </div>

                <div className={`${styles.moduleCard} ${styles.viveModule}`}>
                  <Card title="Banco de Contenidos">
                    <p className={styles.cardContent}>
                      Plataforma de acceso a obras cinematográficas para
                      exhibición de Espacios Audiovisuales y Gestores
                      registrados en Vive Cine.
                    </p>
                    <Button
                      onClick={() => router.push("/content-bank")}
                      variant="secondary"
                      className={styles.cardButton}
                    >
                      Solicitar películas →
                    </Button>
                  </Card>
                </div>

                <div className={`${styles.moduleCard} ${styles.viveModule}`}>
                  <Card title="Talleres y Capacitaciones">
                    <p className={styles.cardContent}>
                      Accede a talleres, capacitaciones y recursos educativos
                      para Espacios Audiovisuales y Gestores registrados.
                    </p>
                    <p className={styles.tag}>Próximamente</p>
                  </Card>
                </div>
              </div>
            )}
          </article>

          <article
            className={`${styles.serviceGroup} ${styles.hazGroup} ${
              openGroup === "haz"
                ? `${styles.panelOpen} ${styles.expanded}`
                : openGroup === "vive"
                  ? styles.collapsed
                  : ""
            }`}
            onClick={() => toggleGroup("haz")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleGroup("haz")
            }}
          >
            <div className={styles.logoFrame}>
              <Image
                src="/images/logos/hazcine-horizontal-oscuro1.png"
                alt="Haz Cine"
                width={240}
                height={120}
                className={styles.groupLogo}
              />
            </div>

            <p className={styles.groupIntro}>
              Herramientas para profesionales, empresas y proyectos del sector
              audiovisual ecuatoriano.
            </p>

            <ul className={styles.serviceList}>
              <li>Perfil profesional o directorio de empresas</li>
              <li>Gestión integral de películas</li>
              <li>Registro y actualización de información audiovisual</li>
            </ul>

            {openGroup === "haz" && (
              <div
                className={styles.panelModules}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`${styles.moduleCard} ${styles.hazModule}`}>
                  <Card
                    title={
                      isLegalEntity
                        ? "Directorio de Empresas"
                        : "Perfil Profesional"
                    }
                  >
                    <p className={styles.cardContent}>
                      {isLegalEntity
                        ? "Registra y gestiona tu empresa productora en el directorio de empresas de la Ecuador Film Commission."
                        : "Registra y gestiona tu perfil como profesional del audiovisual."}
                    </p>
                    {isLegalEntity ? (
                      <p className={styles.tag}>Próximamente</p>
                    ) : (
                      <Button
                        onClick={() => router.push("/professional-profile")}
                        variant="secondary"
                        className={styles.cardButton}
                      >
                        Gestionar Perfil →
                      </Button>
                    )}
                  </Card>
                </div>

                <div className={`${styles.moduleCard} ${styles.hazModule}`}>
                  <Card title="Gestión de Películas">
                    <p className={styles.cardContent}>
                      Registra, organiza y actualiza la información de tus
                      producciones audiovisuales.
                    </p>
                    <Button
                      onClick={() => router.push("/movies-management")}
                      variant="secondary"
                      className={styles.cardButton}
                    >
                      Gestionar Películas →
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  )
}
