"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button } from "@/shared/components/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { spaceService } from "@/features/spaces/services/space.service"
import { Space, SpaceStatus } from "@/shared/types"
import Image from "next/image"
import styles from "./space-detail.module.css"

export default function SpaceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const spaceId = Number(params?.id)

  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !spaceId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const spaceData = await spaceService.getSpaceById(spaceId)

        if (spaceData.userId !== user.id) {
          router.push("/rea-spaces")
          return
        }

        setSpace(spaceData)
      } catch (error) {
        console.error("Error al cargar espacio:", error)
        router.push("/rea-spaces")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, spaceId, router])

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className={styles.shell}>Cargando espacio...</div>
      </>
    )
  }

  if (!space) {
    return (
      <>
        <Navbar />
        <div className={styles.shell}>Espacio no encontrado</div>
      </>
    )
  }

  const statusLabel: Record<string, string> = {
    [SpaceStatus.VERIFIED]: "Aprobado",
    [SpaceStatus.UNDER_REVIEW]: "Bajo revisión",
    [SpaceStatus.PENDING]: "Pendiente",
    [SpaceStatus.REJECTED]: "Rechazado",
    active: "Activo",
    inactive: "Inactivo",
  }
  const statusLabelText = statusLabel[space.status as string] || "Desconocido"

  const statusClass =
    {
      verified: styles.approved,
      under_review: styles.underReview,
      pending: styles.pending,
      rejected: styles.rejected,
    }[space.status as string] || ""

  const formatList = (items?: string[]) =>
    items && items.length ? items.join(", ") : "No especificado"

  return (
    <>
      <Navbar />
      <div className={styles.shell}>
        <div className={styles.pageHeader}>
          <button className={styles.back} onClick={() => router.back()}>
            ← Volver
          </button>
          <div className={styles.headerActions}>
            <div className={`${styles.status} ${statusClass}`}>
              {statusLabelText}
            </div>
            <Button
              variant="primary"
              onClick={() => router.push(`/rea-spaces/${space.id}/edit`)}
            >
              Editar espacio
            </Button>
          </div>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={styles.kicker}>Espacio REA</p>
            <h1 className={styles.title}>{space.name}</h1>
            <p className={styles.subtitle}>
              {space.description || "Sin descripción"}
            </p>

            <div className={styles.tags}>
              <span className={styles.tag}>Tipo: {space.type}</span>
              <span className={styles.tag}>
                📍 {space.city}, {space.province}
              </span>
              <span className={styles.tag}>Capacidad: {space.capacity}</span>
            </div>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Estado</span>
              <span className={`${styles.statValue} ${statusClass}`}>
                {statusLabelText}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Correo</span>
              <span className={styles.statValue}>{space.email}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Teléfono</span>
              <span className={styles.statValue}>{space.phone}</span>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Información básica</h2>
              <span className={styles.pill}>Ubicación</span>
            </div>
            <div className={styles.twoCols}>
              <div>
                <p className={styles.label}>Provincia</p>
                <p className={styles.value}>{space.province}</p>
              </div>
              <div>
                <p className={styles.label}>Ciudad</p>
                <p className={styles.value}>{space.city}</p>
              </div>
              <div>
                <p className={styles.label}>Dirección</p>
                <p className={styles.value}>{space.address}</p>
              </div>
              <div>
                <p className={styles.label}>Capacidad</p>
                <p className={styles.value}>{space.capacity} personas</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Equipo</h2>
              <span className={styles.pill}>Contactos</span>
            </div>
            <div className={styles.twoCols}>
              <div>
                <p className={styles.label}>Responsable</p>
                <p className={styles.value}>{space.managerName}</p>
                <p className={styles.hint}>{space.managerEmail}</p>
                <p className={styles.hint}>{space.managerPhone}</p>
              </div>
              <div>
                <p className={styles.label}>Técnico a cargo</p>
                <p className={styles.value}>{space.technicianInCharge}</p>
                <p className={styles.hint}>{space.technicianEmail}</p>
                <p className={styles.hint}>{space.technicianPhone}</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Infraestructura</h2>
              <span className={styles.pill}>Sala</span>
            </div>
            <div className={styles.listGrid}>
              <div>
                <p className={styles.label}>Equipos de proyección</p>
                <p className={styles.value}>
                  {formatList(space.projectionEquipment)}
                </p>
              </div>
              <div>
                <p className={styles.label}>Equipos de sonido</p>
                <p className={styles.value}>
                  {formatList(space.soundEquipment)}
                </p>
              </div>
              <div>
                <p className={styles.label}>Pantalla</p>
                <p className={styles.value}>{formatList(space.screen)}</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Servicios y operación</h2>
              <span className={styles.pill}>Operación</span>
            </div>
            <div className={styles.listGrid}>
              <div>
                <p className={styles.label}>Registro de taquilla</p>
                <p className={styles.value}>{space.boxofficeRegistration}</p>
              </div>
              <div>
                <p className={styles.label}>Accesibilidades</p>
                <p className={styles.value}>
                  {formatList(space.accessibilities)}
                </p>
              </div>
              <div>
                <p className={styles.label}>Servicios</p>
                <p className={styles.value}>{formatList(space.services)}</p>
              </div>
              <div>
                <p className={styles.label}>Historial operativo</p>
                <p className={styles.value}>{space.operatingHistory}</p>
              </div>
            </div>
          </section>

          <section className={`${styles.card} ${styles.mediaCard}`}>
            <div className={styles.cardHeader}>
              <h2>Logo y fotos</h2>
              <span className={styles.pill}>Multimedia</span>
            </div>
            <div className={styles.mediaGrid}>
              <div>
                <p className={styles.label}>Logo</p>
                {space.assets?.logo?.url ? (
                  <Image
                    src={space.assets.logo.url}
                    alt="Logo del espacio"
                    width={180}
                    height={180}
                    sizes="(max-width: 768px) 140px, 180px"
                    className={styles.logo}
                  />
                ) : (
                  <p className={styles.hint}>Sin logo</p>
                )}
              </div>
              <div>
                <p className={styles.label}>Galería</p>
                <div className={styles.photosGrid}>
                  {space.assets?.photos?.length ? (
                    space.assets.photos.map((photo) => (
                      <Image
                        key={photo.id}
                        src={photo.url}
                        alt="Foto del espacio"
                        width={320}
                        height={200}
                        sizes="(max-width: 768px) 45vw, 240px"
                        className={styles.photo}
                      />
                    ))
                  ) : (
                    <p className={styles.hint}>Sin fotos</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Documentos</h2>
              <span className={styles.pill}>PDF</span>
            </div>
            <div className={styles.docsList}>
              {[
                { label: "CI", url: space.assets?.documents?.ci?.url },
                { label: "RUC", url: space.assets?.documents?.ruc?.url },
                {
                  label: "Administrador",
                  url: space.assets?.documents?.manager?.url,
                },
                {
                  label: "Planilla",
                  url: space.assets?.documents?.serviceBill?.url,
                },
                {
                  label: "Licencia",
                  url: space.assets?.documents?.operatingLicense?.url,
                },
              ].map((doc) => (
                <div key={doc.label} className={styles.docRow}>
                  <span className={styles.label}>{doc.label}</span>
                  {doc.url ? (
                    <a
                      className={styles.docLink}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <span className={styles.hint}>No subido</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
