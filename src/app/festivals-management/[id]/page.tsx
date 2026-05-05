"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { festivalService } from "@/features/festivals/services/festival.service"
import { useCities } from "@/features/catalog/hooks/useCities"
import { useCompanies } from "@/features/companies/hooks/useCompanies"
import { useProfessionals } from "@/features/professionals/hooks/useProfessionals"
import { assetService } from "@/features/assets/services/asset.service"
import { FestivalInfoSheetSection } from "@/features/festivals/components/FestivalInfoSheetSection"
import type { Festival } from "@/features/festivals/types"
import styles from "./page.module.css"

/* ---- Helpers ---- */

const EMPTY = "No completado"


const lv = (arr: string[]): string => {
  const clean = arr.map((s) => s.trim()).filter(Boolean)
  return clean.length ? clean.join(", ") : EMPTY
}

const normalizeUrl = (url?: string | null): string | null => {
  const raw = String(url ?? "").trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

const extractVideoId = (url?: string | null): { type: "youtube" | "vimeo"; id: string } | null => {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  if (yt) return { type: "youtube", id: yt[1] }
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return { type: "vimeo", id: vm[1] }
  return null
}

/* ---- Video embed ---- */
function VideoEmbed({ url }: { url?: string | null }) {
  const v = extractVideoId(url)
  if (!v) return null
  return (
    <div className={styles.videoContainer}>
      {v.type === "youtube" ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${v.id}`}
          title="Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${v.id}`}
          title="Trailer"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}

/* ---- Page ---- */
export default function FestivalDetailPage() {
  const params = useParams()
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const festivalId = Number(rawId)

  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [stillUrls, setStillUrls] = useState<string[]>([])
  const [dossierEsUrl, setDossierEsUrl] = useState<string | null>(null)
  const [dossierEnUrl, setDossierEnUrl] = useState<string | null>(null)
  const [selectedStill, setSelectedStill] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { cities } = useCities()
  const { companies } = useCompanies()
  const { professionals } = useProfessionals()

  /* ---- Load festival + assets ---- */
  useEffect(() => {
    const load = async () => {
      if (!festivalId || Number.isNaN(festivalId)) {
        setError("ID de festival inválido")
        setIsLoading(false)
        return
      }

      const isPublicFestivalDetailRoute =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/public/festivals/")

      try {
        setIsLoading(true)
        const data = isPublicFestivalDetailRoute
          ? await festivalService.getPublicById(festivalId)
          : await festivalService
              .getById(festivalId)
              .catch(async () => festivalService.getPublicById(festivalId))
        setFestival(data)

        if (data.posterUrl) {
          setPosterUrl(
            assetService.getPublicAssetUrl({
              id: data.posterId ?? 0,
              url: data.posterUrl,
            } as Parameters<typeof assetService.getPublicAssetUrl>[0]),
          )
        } else if (data.posterId) {
          try {
            const a = await assetService.getAsset(data.posterId)
            setPosterUrl(a.url ?? null)
          } catch { /* ignore */ }
        }

        if (data.stillUrls?.length) {
          setStillUrls(
            data.stillUrls.map((url) =>
              assetService.getPublicAssetUrl({
                id: 0,
                url,
              } as Parameters<typeof assetService.getPublicAssetUrl>[0]),
            ),
          )
        } else if (data.stillsIds?.length) {
          const urls = await Promise.all(
            data.stillsIds.map(async (id) => {
              try {
                const a = await assetService.getAsset(id)
                return a.url ?? null
              } catch { return null }
            })
          )
          setStillUrls(urls.filter((u): u is string => Boolean(u)))
        }

        if (data.dossierEsUrl) {
          setDossierEsUrl(
            assetService.getPublicAssetUrl({
              id: data.dossierEsId ?? 0,
              url: data.dossierEsUrl,
            } as Parameters<typeof assetService.getPublicAssetUrl>[0]),
          )
        } else if (data.dossierEsId) {
          try {
            const a = await assetService.getAsset(data.dossierEsId)
            setDossierEsUrl(a.url ?? null)
          } catch { /* ignore */ }
        }

        if (data.dossierEnUrl) {
          setDossierEnUrl(
            assetService.getPublicAssetUrl({
              id: data.dossierEnId ?? 0,
              url: data.dossierEnUrl,
            } as Parameters<typeof assetService.getPublicAssetUrl>[0]),
          )
        } else if (data.dossierEnId) {
          try {
            const a = await assetService.getAsset(data.dossierEnId)
            setDossierEnUrl(a.url ?? null)
          } catch { /* ignore */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el festival")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [festivalId])

  /* ---- Resolve names from IDs ---- */
  const cityNames = useMemo(
    () =>
      (festival?.hostCities ?? [])
        .map((id) => cities.find((c) => c.id === id)?.name ?? null)
        .filter((n): n is string => Boolean(n)),
    [festival, cities]
  )

  const mainVenueName = useMemo(
    () => (festival?.mainVenue ? (cities.find((c) => c.id === festival.mainVenue)?.name ?? null) : null),
    [festival, cities]
  )

  const companyNames = useMemo(
    () =>
      (festival?.producerCompanyIds ?? [])
        .map((id) => companies.find((c) => c.id === id)?.name ?? null)
        .filter((n): n is string => Boolean(n)),
    [festival, companies]
  )

  const directorNames = useMemo(
    () =>
      (festival?.directors ?? [])
        .map((id) => professionals.find((p) => p.id === id)?.name ?? null)
        .filter((n): n is string => Boolean(n)),
    [festival, professionals]
  )

  const producerNames = useMemo(
    () =>
      (festival?.producerIds ?? [])
        .map((id) => professionals.find((p) => p.id === id)?.name ?? null)
        .filter((n): n is string => Boolean(n)),
    [festival, professionals]
  )

  const programmerNames = useMemo(
    () =>
      (festival?.programmers ?? [])
        .map((id) => professionals.find((p) => p.id === id)?.name ?? null)
        .filter((n): n is string => Boolean(n)),
    [festival, professionals]
  )

  const firstDirector = useMemo(
    () => festival?.directorObjects?.[0] ?? null,
    [festival]
  )

  const firstProducer = useMemo(
    () => festival?.producerObjects?.[0] ?? null,
    [festival]
  )

  const modalityLabel = useMemo(() => {
    const map: Record<string, string> = { onsite: "Presencial", online: "En línea" }
    return lv((festival?.modality ?? []).map((m) => map[m] || m))
  }, [festival])

  /* ---- Render ---- */
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>Cargando información del festival...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={`${styles.stateBox} ${styles.errorBox}`}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && festival && (
          <>
            {/* HERO */}
            <section className={styles.heroNew}>
              {/* Poster column */}
              <div className={styles.posterColumn}>
                {posterUrl ? (
                  <Image
                    id={`festival-poster-${festival.id}`}
                    src={posterUrl}
                    alt={festival.name}
                    width={300}
                    height={450}
                    className={styles.posterImage}
                    priority
                  />
                ) : (
                  <div className={styles.posterPlaceholder}>SIN AFICHE</div>
                )}

                <button
                  type="button"
                  className={styles.fichaBtn}
                  onClick={() => setIsModalOpen(true)}
                >
                  📄 Ver ficha técnica
                </button>
              </div>

              {/* Info column */}
              <div className={styles.infoColumn}>
                {/* Solo tipo: Festival, Muestra, Ciclo, etc. */}
                {festival.type && (
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>{festival.type}</span>
                  </div>
                )}

                {/* Title */}
                <h1 className={styles.festivalTitle}>{festival.name}</h1>

                {/* Directors / Producers row */}
                {(directorNames.length > 0 || producerNames.length > 0) && (
                  <div className={styles.creditsRow}>
                    {directorNames.length > 0 && (
                      <div className={styles.creditItem}>
                        <span className={styles.creditLabel}>Dirección</span>
                        <span className={styles.creditLabelSecondary}>Direction</span>
                        <p className={styles.creditValue}>{lv(directorNames)}</p>
                      </div>
                    )}
                    {producerNames.length > 0 && (
                      <div className={styles.creditItem}>
                        <span className={styles.creditLabel}>Producción</span>
                        <span className={styles.creditLabelSecondary}>Production</span>
                        <p className={styles.creditValue}>{lv(producerNames)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Companies */}
                {companyNames.length > 0 && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Empresa(s) Productora(s)</span>
                    <span className={styles.creditLabelSecondary}>Production Company</span>
                    <p className={styles.creditValue}>{lv(companyNames)}</p>
                  </div>
                )}

                {/* Programmers */}
                {programmerNames.length > 0 && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Programación</span>
                    <span className={styles.creditLabelSecondary}>Programming</span>
                    <p className={styles.creditValue}>{lv(programmerNames)}</p>
                  </div>
                )}

                {/* Meta grid */}
                <div className={styles.metaRow}>
                  {festival.firstEditionYear && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Primera edición</span>
                      <span className={styles.metaLabelSecondary}>First Edition</span>
                      <p className={styles.metaValue}>{festival.firstEditionYear}</p>
                    </div>
                  )}
                  {festival.editionCount && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Ediciones</span>
                      <span className={styles.metaLabelSecondary}>Editions</span>
                      <p className={styles.metaValue}>{festival.editionCount}</p>
                    </div>
                  )}
                  {festival.modality?.length > 0 && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Modalidad</span>
                      <span className={styles.metaLabelSecondary}>Modality</span>
                      <p className={styles.metaValue}>{modalityLabel}</p>
                    </div>
                  )}
                  {mainVenueName && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Sede principal</span>
                      <span className={styles.metaLabelSecondary}>Main Venue</span>
                      <p className={styles.metaValue}>{mainVenueName}</p>
                    </div>
                  )}
                </div>

                {/* Theme */}
                {festival.theme && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaItemFull}>
                      <span className={styles.metaLabel}>Tema</span>
                      <span className={styles.metaLabelSecondary}>Theme</span>
                      <p className={styles.metaValue}>{festival.theme}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {festival.website && normalizeUrl(festival.website) && (
                  <div className={styles.companyRow}>
                    <span className={styles.metaLabel}>Sitio web</span>
                    <span className={styles.metaLabelSecondary}>Website</span>
                    <a
                      href={normalizeUrl(festival.website)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {festival.website}
                    </a>
                  </div>
                )}

                {/* Contact */}
                {(festival.contactName || festival.contactEmail || festival.contactPhone) && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Contacto</span>
                    <span className={styles.creditLabelSecondary}>Contact</span>
                    <ul className={styles.infoList}>
                      {festival.contactName && <li><strong>{festival.contactName}</strong></li>}
                      {festival.contactEmail && (
                        <li>
                          <a href={`mailto:${festival.contactEmail}`} className={styles.link}>
                            {festival.contactEmail}
                          </a>
                        </li>
                      )}
                      {festival.contactPhone && <li>{festival.contactPhone}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* DIRECTOR / PRODUCER */}
            {(firstDirector || firstProducer) && (
              <section className={styles.professionalsSection}>
                <h3 className={styles.sectionTitle}>
                  Dirección y Producción
                  <span className={styles.sectionTitleSecondary}>Direction &amp; Production</span>
                </h3>
                <div className={styles.professionalsGrid}>
                  {firstDirector && (
                    <div className={styles.professionalCard}>
                      {firstDirector.photoUrl ? (
                        <Image
                          id={`festival-director-photo-${festival.id}`}
                          src={firstDirector.photoUrl}
                          alt={firstDirector.name ?? "Director"}
                          width={100}
                          height={120}
                          loading="eager"
                          priority
                          className={styles.professionalPhoto}
                        />
                      ) : (
                        <div className={styles.professionalPhotoPlaceholder}>SIN<br />FOTO</div>
                      )}
                      <div className={styles.professionalInfo}>
                        <p className={styles.professionalRole}>Dirección</p>
                        <p className={styles.professionalRoleEn}>Direction</p>
                        <Link href={`/public/professionals/${firstDirector.id}`} className={`${styles.professionalName} ${styles.professionalNameLink}`}>
                          {firstDirector.name}
                        </Link>
                        {firstDirector.filmography && (
                          <p className={styles.professionalBio}>{firstDirector.filmography}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {firstProducer && (
                    <div className={styles.professionalCard}>
                      {firstProducer.photoUrl ? (
                        <Image
                          id={`festival-producer-photo-${festival.id}`}
                          src={firstProducer.photoUrl}
                          alt={firstProducer.name ?? "Productor"}
                          width={100}
                          height={120}
                          loading="eager"
                          priority
                          className={styles.professionalPhoto}
                        />
                      ) : (
                        <div className={styles.professionalPhotoPlaceholder}>SIN<br />FOTO</div>
                      )}
                      <div className={styles.professionalInfo}>
                        <p className={styles.professionalRole}>Producción</p>
                        <p className={styles.professionalRoleEn}>Production</p>
                        <Link href={`/public/professionals/${firstProducer.id}`} className={`${styles.professionalName} ${styles.professionalNameLink}`}>
                          {firstProducer.name}
                        </Link>
                        {firstProducer.filmography && (
                          <p className={styles.professionalBio}>{firstProducer.filmography}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            {(festival.description || festival.descriptionEn) && (
              <section className={styles.contentSection}>
                <div className={styles.contentBlock}>
                  <h3 className={styles.sectionTitle}>
                    Descripción
                    <span className={styles.sectionTitleSecondary}>Description</span>
                  </h3>
                  {festival.description && (
                    <p className={styles.contentText}>{festival.description}</p>
                  )}
                  {festival.descriptionEn && (
                    <p className={styles.contentTextEn}>{festival.descriptionEn}</p>
                  )}
                </div>
              </section>
            )}

            {/* SECTIONS */}
            {festival.sections?.length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Secciones
                  <span className={styles.sectionTitleSecondary}>Sections</span>
                </h3>
                <ul className={styles.creditedList}>
                  {festival.sections.map((sec, idx) => (
                    <li key={idx} className={styles.creditedItem}>
                      <strong>{sec.name}</strong>
                      <span>{sec.competitive ? "Competitiva" : "No competitiva"}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* NEEDS */}
            {(festival.needs || festival.needsEn) && (
              <section className={styles.contentSection}>
                <div className={styles.contentBlock}>
                  <h3 className={styles.sectionTitle}>
                    Necesidades del Festival
                    <span className={styles.sectionTitleSecondary}>Festival Needs</span>
                  </h3>
                  {festival.needs && <p className={styles.contentText}>{festival.needs}</p>}
                  {festival.needsEn && <p className={styles.contentTextEn}>{festival.needsEn}</p>}
                </div>
              </section>
            )}

            {/* GALLERY */}
            {stillUrls.length > 0 && (
              <section className={styles.gallerySection}>
                <h3 className={styles.sectionTitle}>
                  Fotografías
                  <span className={styles.sectionTitleSecondary}>Stills</span>
                </h3>
                <div className={styles.galleryMain}>
                  <Image
                    src={selectedStill ?? stillUrls[0]}
                    alt="Still"
                    width={900}
                    height={506}
                    className={styles.galleryMainImage}
                  />
                </div>
                {stillUrls.length > 1 && (
                  <div className={styles.galleryThumbnails}>
                    {stillUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`${styles.thumbnail}${(selectedStill ?? stillUrls[0]) === url ? ` ${styles.active}` : ""}`}
                        onClick={() => setSelectedStill(url)}
                      >
                        <Image
                          src={url}
                          alt={`Still ${idx + 1}`}
                          width={120}
                          height={80}
                          className={styles.thumbnailImage}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* TRAILER */}
            {extractVideoId(festival.trailer) && (
              <section className={styles.trailerSection}>
                <h3 className={styles.sectionTitle}>
                  Trailer
                  <span className={styles.sectionTitleSecondary}>Trailer</span>
                </h3>
                <VideoEmbed url={festival.trailer} />
              </section>
            )}

            {/* CALL FOR ENTRIES */}
            {festival.hasCall && (
              <div className={styles.callBox}>
                <p className={styles.callBoxTitle}>🎬 Convocatoria</p>
                {festival.callProcess && (
                  <p className={styles.callBoxText}>{festival.callProcess}</p>
                )}
                {festival.callLink && normalizeUrl(festival.callLink) && (
                  <a
                    href={normalizeUrl(festival.callLink)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadBtn}
                  >
                    Postular ahora
                  </a>
                )}
              </div>
            )}

            {/* CIUDADES SEDE */}
            {cityNames.length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Ciudades sede
                  <span className={styles.sectionTitleSecondary}>Host Cities</span>
                </h3>
                <ul className={styles.creditedList}>
                  {cityNames.map((city, idx) => (
                    <li key={idx} className={styles.creditedItem}>
                      <strong>{city}</strong>
                      <span>{mainVenueName && cityNames[idx] === mainVenueName ? "Sede principal" : ""}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* DOSSIER DOWNLOAD */}
            {(dossierEsUrl || dossierEnUrl) && (
              <section className={styles.downloadSection}>
                <h3 className={styles.sectionTitle}>
                  Descargar Dossier
                  <span className={styles.sectionTitleSecondary}>Download Dossier</span>
                </h3>
                <div className={styles.downloadButtons}>
                  {dossierEsUrl && (
                    <a href={dossierEsUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                      📄 Dossier Español
                    </a>
                  )}
                  {dossierEnUrl && (
                    <a href={dossierEnUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                      📄 Dossier English
                    </a>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ---- FICHA TÉCNICA MODAL ---- */}
      {isModalOpen && festival && (
        <FestivalInfoSheetSection
          festivalId={festival.id}
          name={festival.name}
          type={festival.type}
          classification={festival.classification}
          description={festival.description}
          descriptionEn={festival.descriptionEn}
          needs={festival.needs}
          needsEn={festival.needsEn}
          firstEditionYear={festival.firstEditionYear}
          editionCount={festival.editionCount}
          website={festival.website}
          contactName={festival.contactName}
          contactEmail={festival.contactEmail}
          contactPhone={festival.contactPhone}
          directorNames={directorNames}
          directorPhotoUrl={firstDirector?.photoUrl ?? null}
          directorFilmography={firstDirector?.filmography ?? null}
          producerNames={producerNames}
          producerPhotoUrl={firstProducer?.photoUrl ?? null}
          producerFilmography={firstProducer?.filmography ?? null}
          companyNames={companyNames}
          cityNames={cityNames}
          mainVenueName={mainVenueName}
          sections={festival.sections ?? []}
          posterUrl={posterUrl}
          posterElementId={posterUrl ? `festival-poster-${festival.id}` : undefined}
          directorPhotoElementId={firstDirector?.photoUrl ? `festival-director-photo-${festival.id}` : undefined}
          producerPhotoElementId={firstProducer?.photoUrl ? `festival-producer-photo-${festival.id}` : undefined}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
