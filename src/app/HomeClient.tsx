"use client"

import Link from "next/link"
import { useAuth } from "@/features/auth/hooks"
import { Navbar } from "@/shared/components/Navbar"
import { Card } from "@/shared/components/ui"
import styles from "./home.module.css"

export default function HomeClient() {
  const { isAuthenticated } = useAuth()

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido a Cinema EC</h1>
          <p className={styles.subtitle}>
            La plataforma de servicios del Cine Ecuatoriano
          </p>
          <div className={styles.buttonGroup}>
            {!isAuthenticated ? (
              <>
                <Link href="/login" className={styles.primaryLink}>
                  Iniciar Sesión
                </Link>
                <Link href="/register" className={styles.secondaryLink}>
                  Registrarse
                </Link>
              </>
            ) : (
              <Link href="/home" className={styles.primaryLink}>
                Ir a menú de servicios
              </Link>
            )}
          </div>
        </div>

        <div className={styles.grid}>
          <Card>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🎬</div>
              <h3 className={styles.featureTitle}>
                Catálogo de empresas productoras
              </h3>
              <p className={styles.featureDescription}>
                Registra tu empresa en el catálogo de servicios cinematográficos
                de la Ecuador Film Commission.
              </p>
            </div>
          </Card>

          <Card>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🎟️</div>
              <h3 className={styles.featureTitle}>Préstamo de Obras</h3>
              <p className={styles.featureDescription}>
                Accede al prestamo de obras para la exhibición cinematográfica
                en espacios de la REA y gestores culturales.
              </p>
            </div>
          </Card>

          <Card>
            <div className={styles.featureCard}>
              <div className={styles.icon}>⭐</div>
              <h3 className={styles.featureTitle}>
                Accede a otros servicos del ICCA
              </h3>
              <p className={styles.featureDescription}>
                Accede a registro de espacios, gestores culturales, catálogo de
                películas, registro de locaciones y otros servicios del ICCA.
              </p>
            </div>
          </Card>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            ¿Por qué ser parte de CinemaEC?
          </h2>
          <div className={styles.sectionContent}>
            <p className={styles.sectionText}>
              Somos una plataforma del Instituto de Cine y Creación Audiovisual,
              que brinda diferentes servicios al sector cinematográfico y al
              público en general.
            </p>
            <p className={styles.sectionText}>
              Únete a nuestra comunidad y disfruta de todos los servicios que
              ofrecemos desde un solo lugar.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
