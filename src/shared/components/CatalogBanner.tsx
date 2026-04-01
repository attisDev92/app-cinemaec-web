"use client"

import Link from "next/link"
import styles from "./CatalogBanner.module.css"

interface CatalogOption {
  title: string
  description: string
  href: string
  icon: string
}

const catalogOptions: CatalogOption[] = [
  {
    title: "Catálogo de Proyectos",
    description: "Descubre todos los proyectos audiovisuales en desarrollo",
    href: "/public/catalog",
    icon: "📽️",
  },
  {
    title: "Profesionales",
    description: "Red de profesionales del sector audiovisual ecuatoriano",
    href: "/public/professionals",
    icon: "👥",
  },
  {
    title: "Películas Ecuatorianas",
    description: "Contenido audiovisual de realizadores ecuatorianos",
    href: "/public/ecuatorian-movies",
    icon: "🎬",
  },
]

export function CatalogBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContent}>
        <h2 className={styles.bannerTitle}>Accede a Contenido Público</h2>
        <p className={styles.bannerSubtitle}>
          Explora nuestras colecciones sin necesidad de crear una cuenta
        </p>

        <div className={styles.optionsGrid}>
          {catalogOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className={styles.optionCard}
            >
              <div className={styles.iconBox}>{option.icon}</div>
              <h3 className={styles.optionTitle}>{option.title}</h3>
              <p className={styles.optionDescription}>{option.description}</p>
              <div className={styles.arrowIcon}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
