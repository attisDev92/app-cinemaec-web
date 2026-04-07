"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { assetService } from "@/features/assets/services/asset.service"
import { professionalsService, type Professional, type ProfessionalAsset } from "@/features/professionals"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import styles from "./page.module.css"

const EMPTY_LABEL = "No disponible"

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "PR"

const getAssetUrl = (asset?: ProfessionalAsset | null) => {
  if (!asset?.url) {
    return null
  }

  return assetService.getPublicAssetUrl({
    id: asset.id ?? 0,
    url: asset.url,
  } as Parameters<typeof assetService.getPublicAssetUrl>[0])
}

const normalizeExternalUrl = (value?: string | null) => {
  const raw = String(value || "").trim()
  if (!raw) {
    return null
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  return `https://${raw}`
}

const getReelEmbedUrl = (value?: string | null) => {
  const normalized = normalizeExternalUrl(value)
  if (!normalized) {
    return null
  }

  try {
    const url = new URL(normalized)
    const host = url.hostname.toLowerCase()

    const isYouTube =
      host.includes("youtube.com") ||
      host.includes("youtu.be")

    if (isYouTube) {
      let videoId = ""

      if (host.includes("youtu.be")) {
        videoId = url.pathname.split("/").filter(Boolean)[0] || ""
      } else if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || ""
      } else {
        const parts = url.pathname.split("/").filter(Boolean)
        const embedIndex = parts.findIndex((part) => part === "embed" || part === "shorts")
        if (embedIndex >= 0) {
          videoId = parts[embedIndex + 1] || ""
        }
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    const isVimeo = host.includes("vimeo.com")
    if (isVimeo) {
      const parts = url.pathname.split("/").filter(Boolean)
      const videoId =
        parts.find((part) => /^\d+$/.test(part)) ||
        ""

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
  } catch {
    return null
  }

  return null
}

const textValue = (value?: string | number | null) => {
  const text = String(value ?? "").trim()
  return text || EMPTY_LABEL
}

export default function PublicProfessionalProfilePage() {
  const params = useParams<{ id: string }>()
  const professionalId = Number(params?.id)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!professionalId || Number.isNaN(professionalId)) {
      setError("El perfil solicitado no es válido")
      setIsLoading(false)
      return
    }

    const loadProfessional = async () => {
      try {
        setIsLoading(true)
        const data = await professionalsService.getPublicById(professionalId)
        setProfessional(data)
        setError(null)
      } catch (err) {
        setProfessional(null)
        setError(
          (err as { message?: string })?.message ||
            "No se pudo cargar el perfil público del profesional",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProfessional()
  }, [professionalId])

  const profilePhotoUrl = useMemo(
    () => getAssetUrl(professional?.profilePhotoAsset),
    [professional?.profilePhotoAsset],
  )

  const portfolioUrls = useMemo(
    () => (professional?.portfolioImages || []).map((asset) => getAssetUrl(asset)).filter(Boolean) as string[],
    [professional?.portfolioImages],
  )

  useEffect(() => {
    setSelectedImage(portfolioUrls[0] || null)
  }, [portfolioUrls])

  const primaryRoles = professional?.primaryActivityRoles || []
  const secondaryRoles = professional?.secondaryActivityRoles || []
  const hasNickName = Boolean(String(professional?.nickName || "").trim())
  const primaryDisplayName = hasNickName
    ? String(professional?.nickName).trim()
    : String(professional?.name || "")

  const reelEmbedUrl = useMemo(
    () => getReelEmbedUrl(professional?.reelLink),
    [professional?.reelLink],
  )

  const rrssUrl = useMemo(
    () => normalizeExternalUrl(professional?.rrss),
    [professional?.rrss],
  )

  const linkedinUrl = useMemo(
    () => normalizeExternalUrl(professional?.linkedin),
    [professional?.linkedin],
  )

  const websiteUrl = useMemo(
    () => normalizeExternalUrl(professional?.website),
    [professional?.website],
  )

  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        <div className={styles.topActions}>
          <Link href="/public/professionals" className={styles.backLink}>
            ← Volver a profesionales
          </Link>
        </div>

        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>Cargando perfil profesional...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={`${styles.stateBox} ${styles.errorBox}`}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && professional && professional.isPublic === false && (
          <>
          <section className={styles.hero}>
            <div className={styles.portraitColumn}>
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={professional.name}
                  className={styles.portrait}
                />
              ) : (
                <div className={styles.portraitPlaceholder}>{getInitials(professional.name)}</div>
              )}
            </div>

            <div className={styles.infoColumn}>
              {hasNickName && (
                <p className={styles.titleEyebrow}>Nombre artístico</p>
              )}
              <h1 className={styles.title}>{primaryDisplayName}</h1>
              {hasNickName && (
                <p className={styles.professionalNameSecondary}>{professional.name}</p>
              )}

              {(primaryRoles.length > 0 || secondaryRoles.length > 0) && (
                <>
                  {primaryRoles.length > 0 && (
                    <div className={styles.roleBlock}>
                      <span className={styles.blockLabel}>Actividad principal</span>
                      <span className={styles.blockLabelSecondary}>Primary activity</span>
                      <div className={styles.chips}>
                        {primaryRoles.map((role) => (
                          <span key={`primary-${role.id}`} className={styles.chip}>
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {secondaryRoles.length > 0 && (
                    <div className={styles.roleBlock}>
                      <span className={styles.blockLabel}>Actividad secundaria</span>
                      <span className={styles.blockLabelSecondary}>Secondary activity</span>
                      <div className={styles.chips}>
                        {secondaryRoles.map((role) => (
                          <span key={`secondary-${role.id}`} className={styles.chipMuted}>
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </section>

          {(professional.movieParticipations?.length ?? 0) > 0 && (
            <section className={styles.filmographySection}>
              <h2 className={styles.sectionTitle}>Filmografía pública</h2>
              <div className={styles.moviesGrid}>
                {professional.movieParticipations!.map((entry) => {
                  const posterUrl = getAssetUrl(entry.posterAsset)
                  return (
                    <Link
                      key={entry.id}
                      href={`/public/catalog/${entry.movieId}`}
                      className={styles.movieLink}
                    >
                      <article className={styles.movieCard}>
                        <div className={styles.moviePosterWrap}>
                          {posterUrl ? (
                            <img src={posterUrl} alt={entry.movieTitle} className={styles.moviePoster} />
                          ) : (
                            <div className={styles.moviePosterPlaceholder}>SIN AFICHE</div>
                          )}
                        </div>
                        <div className={styles.movieBody}>
                          <span className={styles.movieRole}>
                            {entry.cinematicRole?.name || `Rol #${entry.cinematicRoleId}`}
                          </span>
                          <h3 className={styles.movieTitle}>{entry.movieTitle}</h3>
                          {entry.movieTitleEn && entry.movieTitleEn !== entry.movieTitle && (
                            <p className={styles.movieTitleEn}>{entry.movieTitleEn}</p>
                          )}
                          {entry.releaseYear && (
                            <p className={styles.movieYear}>{entry.releaseYear}</p>
                          )}
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
          </>
        )}

        {!isLoading && !error && professional && professional.isPublic !== false && (
          <>
            <section className={styles.hero}>
              <div className={styles.portraitColumn}>
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={professional.name}
                    className={styles.portrait}
                  />
                ) : (
                  <div className={styles.portraitPlaceholder}>{getInitials(professional.name)}</div>
                )}
              </div>

              <div className={styles.infoColumn}>
                {hasNickName && (
                  <p className={styles.titleEyebrow}>Nombre artístico</p>
                )}
                <h1 className={styles.title}>{primaryDisplayName}</h1>
                {hasNickName && (
                  <p className={styles.professionalNameSecondary}>{professional.name}</p>
                )}

                {professional.companyNameCEO && (
                  <p className={styles.subtitle}>{professional.companyNameCEO}</p>
                )}

                {primaryRoles.length > 0 && (
                  <div className={styles.roleBlock}>
                    <span className={styles.blockLabel}>Actividad principal</span>
                    <span className={styles.blockLabelSecondary}>Primary activity</span>
                    <div className={styles.chips}>
                      {primaryRoles.map((role) => (
                        <span key={`primary-${role.id}`} className={styles.chip}>
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {secondaryRoles.length > 0 && (
                  <div className={styles.roleBlock}>
                    <span className={styles.blockLabel}>Actividad secundaria</span>
                    <span className={styles.blockLabelSecondary}>Secondary activity</span>
                    <div className={styles.chips}>
                      {secondaryRoles.map((role) => (
                        <span key={`secondary-${role.id}`} className={styles.chipMuted}>
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Email</span>
                    <span className={styles.metaLabelSecondary}>Email</span>
                    <p className={styles.metaValue}>{textValue(professional.email)}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Empresa</span>
                    <span className={styles.metaLabelSecondary}>Company</span>
                    <p className={styles.metaValue}>{textValue(professional.companyNameCEO)}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Participaciones</span>
                    <span className={styles.metaLabelSecondary}>Participations</span>
                    <p className={styles.metaValue}>{professional.movieParticipations?.length || 0}</p>
                  </div>
                </div>

                {(professional.bio || professional.bioEn) && (
                  <div className={styles.contentBlock}>
                    <h2 className={styles.sectionTitle}>
                      Biofilmografia
                      <span className={styles.sectionTitleSecondary}>Biofilmography</span>
                    </h2>
                    {professional.bio && <p className={styles.contentText}>{professional.bio}</p>}
                    {professional.bioEn && <p className={styles.contentTextEn}>{professional.bioEn}</p>}
                  </div>
                )}

              </div>
            </section>

            {(reelEmbedUrl || rrssUrl || linkedinUrl || websiteUrl) && (
              <section className={`${styles.linksBlock} ${styles.linksBlockFullWidth}`}>
                {(rrssUrl || linkedinUrl || websiteUrl) && (
                  <div className={styles.linksActions}>
                    {rrssUrl && (
                      <a
                        href={rrssUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.actionButton}
                      >
                        Redes sociales
                      </a>
                    )}

                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.actionButton}
                      >
                        LinkedIn
                      </a>
                    )}

                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.actionButton}
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}

                {reelEmbedUrl && (
                  <div className={styles.reelBlock}>
                    <p className={styles.reelTitle}>Reel Link</p>
                    <div className={styles.reelFrameWrap}>
                      <iframe
                        src={reelEmbedUrl}
                        title={`Reel de ${professional.name}`}
                        className={styles.reelFrame}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {portfolioUrls.length > 0 && (
              <section className={styles.gallerySection}>
                <h2 className={styles.sectionTitle}>Portafolio</h2>

                {selectedImage && (
                  <div className={styles.galleryMain}>
                    <img src={selectedImage} alt={professional.name} className={styles.galleryMainImage} />
                  </div>
                )}

                <div className={styles.galleryThumbs}>
                  {portfolioUrls.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      className={`${styles.thumb} ${selectedImage === url ? styles.thumbActive : ""}`}
                      onClick={() => setSelectedImage(url)}
                    >
                      <img src={url} alt={`${professional.name} ${index + 1}`} className={styles.thumbImage} />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.filmographySection}>
              <h2 className={styles.sectionTitle}>Filmografía pública</h2>

              {professional.movieParticipations?.length ? (
                <div className={styles.moviesGrid}>
                  {professional.movieParticipations.map((entry) => {
                    const posterUrl = getAssetUrl(entry.posterAsset)

                    return (
                      <Link
                        key={entry.id}
                        href={`/public/catalog/${entry.movieId}`}
                        className={styles.movieLink}
                      >
                        <article className={styles.movieCard}>
                          <div className={styles.moviePosterWrap}>
                            {posterUrl ? (
                              <img src={posterUrl} alt={entry.movieTitle} className={styles.moviePoster} />
                            ) : (
                              <div className={styles.moviePosterPlaceholder}>SIN AFICHE</div>
                            )}
                          </div>
                          <div className={styles.movieBody}>
                            <span className={styles.movieRole}>
                              {entry.cinematicRole?.name || `Rol #${entry.cinematicRoleId}`}
                            </span>
                            <h3 className={styles.movieTitle}>{entry.movieTitle}</h3>
                            {entry.movieTitleEn && entry.movieTitleEn !== entry.movieTitle && (
                              <p className={styles.movieTitleEn}>{entry.movieTitleEn}</p>
                            )}
                            {entry.releaseYear && (
                              <p className={styles.movieYear}>{entry.releaseYear}</p>
                            )}
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.emptyPanel}>
                  <p>Este perfil aún no tiene participaciones públicas asociadas.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}