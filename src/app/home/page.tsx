"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
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

        <HomePanels router={router} />
      </div>
    </div>
  )
}

type PanelKey = "vive" | "haz"

function HomePanels({ router }: { router: ReturnType<typeof useRouter> }) {
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)

  const togglePanel = (key: PanelKey) => {
    setOpenPanel((prev) => (prev === key ? null : key))
  }

  return (
    <>
      <section className={styles.section}>
        <div
          className={`${styles.panelCard} ${styles.viveCard} ${
            openPanel === "vive" ? styles.panelOpen : ""
          }`}
          onClick={() => togglePanel("vive")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") togglePanel("vive")
          }}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelLogoSection}>
              <Image
                src="/images/logos/ViveCine-Logo-FC.png"
                alt="Vive Cine Logo"
                width={240}
                height={150}
                className={styles.panelLogo}
              />
            </div>
            <div className={styles.panelContent}>
              <div className={styles.panelTitleRow}>
                <h2 className={`${styles.sectionTitle} ${styles.viveTitle}`}>
                  Vive Cine
                </h2>
              </div>
              <p
                className={`${styles.panelDescription} ${styles.viveDescription}`}
              >
                Registra tu espacio audiovisual y accede a otros beneficios de
                Vive Cine.
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push("/rea-spaces/register")
                }}
                variant="primary"
                className={styles.panelCta}
              >
                Haz clic y regístra un espacio audiovisual
              </Button>
            </div>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.footerText}>Otras opciones</span>
            <span
              className={`${styles.chevron} ${styles.chevronVive} ${
                openPanel === "vive" ? styles.chevronOpen : ""
              }`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </div>

        {openPanel === "vive" && (
          <div className={styles.optionsGrid}>
            <Card title="Espacios Audiovisuales de Vive Cine (REA)">
              <p className={styles.cardContent}>
                Registra y accede a tus espacios audiovisuales para formar parte
                de Vive Cine (Red de Espacios Audiovisuales)
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
                Accede al préstamo de obras cinematográficas para gestores con
                proyectos de exhibición itinerante o espacios en el exterior
                como misiones diplomáticas de Ecuador en el mundo.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>

            <Card title="Banco de Contenidos">
              <p className={styles.cardContent}>
                Plataforma de acceso a obras cinematográficas para exhibición de
                Espacios Audiovisuales y Gestores registrados en Vive Cine.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>

            <Card title="Talleres y Capacitaciones">
              <p className={styles.cardContent}>
                Accede a talleres, capacitaciones y recursos educativos para
                Espacios Audiovisuales y Gestores registrados en Vive Cine.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div
          className={`${styles.panelCard} ${styles.hazCard} ${
            openPanel === "haz" ? styles.panelOpen : ""
          }`}
          onClick={() => togglePanel("haz")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") togglePanel("haz")
          }}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelContent}>
              <div className={styles.panelTitleRow}>
                <h2 className={`${styles.sectionTitle} ${styles.hazTitle}`}>
                  Haz Cine
                </h2>
                <span className={`${styles.badge} ${styles.hazBadge}`}>
                  Próximamente
                </span>
              </div>
              <p
                className={`${styles.panelDescription} ${styles.hazDescription}`}
              >
                Gestiona y registrate en los catálogos de profesionales,
                productoras, locaciones del cine ecuatoriano. (próximamente)
              </p>
            </div>
          </div>
          <div className={styles.panelFooter}>
            <span className={styles.footerText}>Otras opciones</span>
            <span
              className={`${styles.chevron} ${styles.chevronHaz} ${
                openPanel === "haz" ? styles.chevronOpen : ""
              }`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </div>

        {openPanel === "haz" && (
          <div className={styles.optionsGrid}>
            <Card title="Catálogo de Locaciones">
              <p className={styles.cardContent}>
                Registra y gestiona tus locaciones para producciones
                audiovisuales en la web de la Ecuador Film Commission.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>

            <Card title="Directorio de Empresas Productoras">
              <p className={styles.cardContent}>
                Registra y gestiona tu empresa productora en el directorio de
                empresas de la Ecuador Film Commission.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>

            <Card title="Perfil de Profesionales">
              <p className={styles.cardContent}>
                Registra tu perfil como profesional del audiovisual en el
                directorio de profesionales ecuatorianos.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>

            <Card title="Catálogo de Películas Ecuatorianas">
              <p className={styles.cardContent}>
                Explora y consulta el catálogo de películas ecuatorianas
                producidas y reconocidas internacionalmente.
              </p>
              <p className={styles.tag}>Próximamente</p>
            </Card>
          </div>
        )}
      </section>
    </>
  )
}
