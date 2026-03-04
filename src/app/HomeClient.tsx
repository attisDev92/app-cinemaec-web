"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/features/auth/hooks"
import { Navbar } from "@/shared/components/Navbar"
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

        <div className={styles.groupsGrid}>
          <article className={`${styles.serviceGroup} ${styles.viveGroup}`}>
            <div className={styles.logoFrame}>
              <Image
                src="/images/logos/vivecine-horizontal-oscuro.png"
                alt="Vive Cine"
                width={240}
                height={120}
                className={styles.groupLogo}
              />
            </div>
            <p className={styles.groupIntro}>
              Exhibiciones de cine y formación de públicos
            </p>
            <ul className={styles.serviceList}>
              <li>
                Registra tu espacio audiovisual y accede al Banco de Películas
                del ICCA.
              </li>
            </ul>
          </article>

          <article className={`${styles.serviceGroup} ${styles.hazGroup}`}>
            <div className={styles.logoFrame}>
              <Image
                src="/images/logos/hazcine-horizontal-oscuro.png"
                alt="Haz Cine"
                width={240}
                height={120}
                className={styles.groupLogo}
              />
            </div>
            <p className={styles.groupIntro}>
              Registro de creadores y proyectos cinematográficos.
            </p>
            <ul className={styles.serviceList}>
              <li>Regístrate como profesional de la industria audiovisual.</li>
              <li>Registra tu película o proyecto cinematográfico.</li>
            </ul>
          </article>
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
