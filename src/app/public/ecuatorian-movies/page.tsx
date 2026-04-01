"use client"

import Link from "next/link"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import styles from "./page.module.css"

export default function EcuatorianMoviesPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
          <h1 className={styles.title}>Películas Ecuatorianas</h1>
          <p className={styles.subtitle}>
            Contenido audiovisual de realizadores ecuatorianos
          </p>
        </div>

        <div className={styles.developmentBox}>
          <div className={styles.iconBox}>🎬</div>
          <h2 className={styles.developmentTitle}>Página en Desarrollo</h2>
          <p className={styles.developmentText}>
            Esta sección estará disponible muy pronto. Aquí podrás explorar el
            contenido audiovisual producido por realizadores ecuatorianos.
          </p>
          <div className={styles.features}>
            <h3 className={styles.featuresTitle}>Próximas Funcionalidades:</h3>
            <ul className={styles.featuresList}>
              <li>Catálogo de películas ecuatorianas</li>
              <li>Filtrar por género, año y directores</li>
              <li>Información detallada de cada película</li>
              <li>Detalles del equipo y producción</li>
              <li>Premios y reconocimientos</li>
              <li>Enlaces a plataformas de distribución</li>
            </ul>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>Información</h3>
          <p>
            Las Películas Ecuatorianas es una colección del contenido audiovisual
            destacado de realizadores y productoras ecuatorianas, que permite
            conocer y promover el cine local a nivel nacional e internacional.
          </p>
        </div>
      </main>
    </div>
  )
}
