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
    description: "Conoce a los profesionales que están detrás de los proyectos",
    href: "/public/professionals",
    icon: "👥",
  },
]

export function CatalogBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContent}>
        <h2 className={styles.bannerTitle}>ECUADOR EN FESTIVAL INTERNACIONAL DE CINE DE CARTAGENA DE INDIAS - FICCI</h2>
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
