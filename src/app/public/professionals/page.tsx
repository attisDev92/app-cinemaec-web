"use client"

import Link from "next/link"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import styles from "./page.module.css"

export default function ProfessionalsPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
          <h1 className={styles.title}>Profesionales</h1>
          <p className={styles.subtitle}>
            Red de profesionales del sector audiovisual ecuatoriano
          </p>
        </div>

        <div className={styles.developmentBox}>
          <div className={styles.iconBox}>👥</div>
          <h2 className={styles.developmentTitle}>Página en Desarrollo</h2>
          <p className={styles.developmentText}>
            Esta sección estará disponible muy pronto. Aquí podrás conocer a los
            profesionales del sector audiovisual ecuatoriano y conectar con ellos.
          </p>
          <div className={styles.features}>
            <h3 className={styles.featuresTitle}>Próximas Funcionalidades:</h3>
            <ul className={styles.featuresList}>
              <li>Directorio de profesionales del audiovisual</li>
              <li>Filtrar por especialidad y experiencia</li>
              <li>Búsqueda por nombre y área de trabajo</li>
              <li>Perfiles detallados con portafolio</li>
              <li>Información de contacto</li>
              <li>Sistema de recomendaciones</li>
            </ul>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>Información</h3>
          <p>
            La Red de Profesionales es un espacio para que realizadores,
            técnicos, productores y otros profesionales del audiovisual registren
            su experiencia y se conecten para colaborar en proyectos.
          </p>
        </div>
      </main>
    </div>
  )
}
