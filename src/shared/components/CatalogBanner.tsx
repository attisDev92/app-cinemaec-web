"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { adminCatalogService } from "@/features/admin-catalogs/services/admin-catalog.service"
import { assetService } from "@/features/assets/services/asset.service"
import type { AdminCatalog } from "@/features/admin-catalogs/types"
import styles from "./CatalogBanner.module.css"

export function CatalogBanner() {
  const router = useRouter()
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([])
  const [current, setCurrent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminCatalogService
      .getPublicActive()
      .then(setCatalogs)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? catalogs.length - 1 : i - 1))
  }, [catalogs.length])

  const next = useCallback(() => {
    setCurrent((i) => (i === catalogs.length - 1 ? 0 : i + 1))
  }, [catalogs.length])

  useEffect(() => {
    if (catalogs.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [catalogs.length, next])

  if (isLoading) {
    return (
      <section
        className={`${styles.slider} ${styles.sliderSkeleton}`}
        aria-label="Cargando catálogos"
        aria-busy="true"
      >
        <div className={styles.skeletonBadge} />
        <div className={styles.overlay} />
        <div className={styles.sliderContent}>
          <div className={styles.skeletonYear} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonDescription} />
        </div>
        <div className={`${styles.navBtn} ${styles.navPrev} ${styles.skeletonNav}`} />
        <div className={`${styles.navBtn} ${styles.navNext} ${styles.skeletonNav}`} />
        <div className={styles.dots}>
          <div className={`${styles.dot} ${styles.skeletonDot}`} />
          <div className={`${styles.dot} ${styles.skeletonDot}`} />
          <div className={`${styles.dot} ${styles.skeletonDot}`} />
        </div>
      </section>
    )
  }

  if (catalogs.length === 0) return null

  const catalog = catalogs[current]
  const imageUrl = catalog.imageAsset
    ? assetService.getPublicAssetUrl(catalog.imageAsset)
    : null

  const openCatalog = () => {
    router.push(`/public/catalogs/${catalog.id}`)
  }

  return (
    <section
      className={styles.slider}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      onClick={openCatalog}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openCatalog()
        }
      }}
      aria-label={`Abrir catálogo ${catalog.name}`}
    >
      <div className={styles.overlay} />
      <div className={styles.cornerLabel}>
        Catálogo de proyectos y profesionales
      </div>
      <div className={styles.sliderContent}>
        <p className={styles.sliderYear}>{catalog.year}</p>
        <h2 className={styles.sliderTitle}>{catalog.name}</h2>
        {catalog.description && (
          <p className={styles.sliderDescription}>{catalog.description}</p>
        )}
      </div>
      {catalogs.length > 1 && (
        <>
          <button
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={(event) => {
              event.stopPropagation()
              prev()
            }}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={(event) => {
              event.stopPropagation()
              next()
            }}
            aria-label="Siguiente"
          >
            ›
          </button>
          <div className={styles.dots}>
            {catalogs.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setCurrent(i)
                }}
                aria-label={`Ir al catálogo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
