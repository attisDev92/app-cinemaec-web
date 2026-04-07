"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { assetService } from "@/features/assets/services/asset.service"
import { professionalsService, type Professional } from "@/features/professionals"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import styles from "./page.module.css"

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "PR"

const getPhotoUrl = (professional: Professional) => {
  const photo = professional.profilePhotoAsset

  if (!photo?.url) {
    return null
  }

  return assetService.getPublicAssetUrl({
    id: photo.id ?? 0,
    url: photo.url,
  } as Parameters<typeof assetService.getPublicAssetUrl>[0])
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setIsLoading(true)
        const data = await professionalsService.getPublic()
        setProfessionals(data)
        setError(null)
      } catch (err) {
        setError(
          (err as { message?: string })?.message ||
            "No se pudo cargar el directorio de profesionales",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProfessionals()
  }, [])

  const publicProfessionals = useMemo(
    () => professionals.filter((professional) => professional.isPublic),
    [professionals],
  )

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

        {error && (
          <div className={styles.alert} data-type="error">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>Cargando profesionales públicos...</p>
          </div>
        ) : publicProfessionals.length === 0 ? (
          <div className={styles.emptyBox}>
            <div className={styles.iconBox}>👥</div>
            <h2 className={styles.emptyTitle}>Aún no hay perfiles públicos</h2>
            <p className={styles.emptyText}>
              Cuando existan perfiles marcados como públicos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <section className={styles.grid}>
            {publicProfessionals.map((professional) => {
              const photoUrl = getPhotoUrl(professional)

              return (
                <Link
                  key={professional.id}
                  href={`/public/professionals/${professional.id}`}
                  className={styles.cardLink}
                >
                  <article className={styles.card}>
                    <div className={styles.cardMedia}>
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={professional.name}
                          className={styles.cardImage}
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          <span>{getInitials(professional.name)}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{professional.name}</h3>

                      {professional.bio && <p className={styles.bio}>{professional.bio}</p>}
                    </div>
                  </article>
                </Link>
              )
            })}
          </section>
        )}

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
