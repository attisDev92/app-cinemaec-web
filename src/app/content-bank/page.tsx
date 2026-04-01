"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button } from "@/shared/components/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole } from "@/shared/types"
import styles from "./page.module.css"

export default function ContentBankPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    } else if (
      !isLoading &&
      user &&
      user.hasProfile &&
      !user.hasUploadedAgreement
    ) {
      router.push("/media-agreement")
    } else if (
      !isLoading &&
      user &&
      user.role !== UserRole.USER &&
      user.role !== UserRole.EDITOR
    ) {
      router.push("/admin")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🎬</span>
            Banco de Contenidos
          </h1>
          <p className={styles.subtitle}>
            Solicita obras cinematográficas para tus exhibiciones
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.actionBar}>
          <Button variant="secondary" onClick={() => router.push("/home")}>
            ← Volver
          </Button>
        </div>

        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>ℹ️</span>
          <div className={styles.infoText}>
            <h2 className={styles.infoTitle}>¿Qué es el Banco de Contenidos?</h2>
            <p>
              Es la plataforma del ICCA que permite a Espacios Audiovisuales y
              Gestores registrados en Vive Cine acceder a obras
              cinematográficas ecuatorianas para su exhibición cultural y
              comunitaria. Completa el formulario para solicitar una película
              y el equipo revisará tu solicitud.
            </p>
            <ul className={styles.requirementsList}>
              <li>
                Debes ser gestor o espacio registrado en la REA (Red de
                Espacios Audiovisuales).
              </li>
              <li>
                La exhibición debe ser sin fines de lucro, salvo autorización
                expresa del titular.
              </li>
              <li>
                Las solicitudes se procesan en un plazo de 5 días hábiles.
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.requestCards}>
          <article className={styles.requestCard}>
            <h3 className={styles.requestCardTitle}>
              Solicitar obras como Espacio Audiovisual
            </h3>
            <p className={styles.requestCardDescription}>
              Gestiona tu solicitud de obras para funciones en espacios
              registrados dentro de la REA.
            </p>
            <div className={styles.requestCardActions}>
              <Button
                variant="secondary"
                className={styles.cardButton}
                onClick={() => router.push("/rea-spaces")}
              >
                Solicitar
              </Button>
            </div>
          </article>

          <article className={styles.requestCard}>
            <h3 className={styles.requestCardTitle}>
              Solicitar obras como Usuario del Banco de Contenidos
            </h3>
            <p className={styles.requestCardDescription}>
              Opción habilitada para el flujo de usuarios del banco en una
              siguiente etapa.
            </p>
            <div className={styles.requestCardActions}>
              <Button variant="secondary" className={styles.cardButton} disabled>
                Próximamente
              </Button>
            </div>
          </article>

          <article className={styles.requestCard}>
            <h3 className={styles.requestCardTitle}>
              Catálogo de Banco de Contenidos
            </h3>
            <p className={styles.requestCardDescription}>
              Revisa las obras del Banco de Contenidos, haz tu curaduría para
              tus exhibiciones.
            </p>
            <div className={styles.requestCardActions}>
              <Button
                variant="secondary"
                className={styles.cardButton}
                onClick={() => router.push("/content-bank/catalog")}
              >
                Ver películas
              </Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
