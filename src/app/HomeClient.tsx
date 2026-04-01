"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/features/auth/hooks"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import { CatalogBanner } from "@/shared/components/CatalogBanner"
import styles from "./home.module.css"

export default function HomeClient() {
  const { isAuthenticated } = useAuth()

  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

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
                src="/images/logos/vivecine-horizontal-oscuro1.png"
                alt="Vive Cine"
                width={240}
                height={120}
                className={styles.groupLogo}
              />
            </div>
            <p className={styles.groupIntro}>
              Servicios para espacios, gestores y usuarios de la Red de
              Espacios Audiovisuales.
            </p>
            <ul className={styles.serviceList}>
              <li>
                Registro y gestión de Espacios REA para exhibición audiovisual.
              </li>
              <li>
                Acceso al Banco de Contenidos para programación en territorio.
              </li>
              <li>
                Talleres y capacitaciones para fortalecer la gestión cultural.
              </li>
            </ul>
          </article>

          <article className={`${styles.serviceGroup} ${styles.hazGroup}`}>
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
              <li>Perfil profesional o directorio de empresas del sector.</li>
              <li>Gestión integral de películas y proyectos audiovisuales.</li>
              <li>Actualización de datos para circulación y visibilidad.</li>
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

        <CatalogBanner />
      </main>
    </div>
  )
}
