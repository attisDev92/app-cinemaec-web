"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import { MovieInfoSheetSection } from "../../../../features/movies/components/MovieInfoSheetSection"
import { publicMovieService } from "@/features/movies/services/movie.service"
import styles from "./page.module.css"

type BasicEntity = { id?: number; code?: string | null; name?: string | null; nameEn?: string | null }

type ProfessionalEntry = {
  cinematicRoleId?: number
  cinematicRole?: BasicEntity
  professional?: {
    id?: number
    name?: string | null
    fullName?: string | null
    email?: string | null
    phone?: string | null
    mobile?: string | null
    bio?: string | null
    bioEn?: string | null
    profilePhotoAssetId?: number | null
    profilePhotoAsset?: Asset | null
  }
}

type MovieCompany = {
  company?: BasicEntity
  participation?: string | null
}

type MovieCoproduction = {
  companyName?: string | null
  country?: BasicEntity
}

type MovieFunding = {
  fund?: BasicEntity
  year?: number | null
  amountGranted?: number | string | null
  fundingStage?: string | null
}

type MovieNationalRelease = {
  exhibitionSpace?: BasicEntity
  city?: BasicEntity
  year?: number | null
  type?: string | null
}

type MovieInternationalRelease = {
  country?: BasicEntity
  spaceName?: string | null
  year?: number | null
  type?: string | null
}

type MovieFestivalNomination = {
  fund?: BasicEntity
  year?: number | null
  category?: string | null
  result?: string | null
}

type MoviePlatform = {
  platform?: BasicEntity
  link?: string | null
}

type MovieContact = {
  name?: string | null
  role?: string | null
  phone?: string | null
  email?: string | null
}

type MovieContentBank = {
  exhibitionWindow?: string | null
  licensingStartDate?: string | null
  licensingEndDate?: string | null
  geolocationRestrictionCountryIds?: number[] | null
}

type Asset = {
  id?: number
  url?: string | null
}

type PublicMovieDetail = {
  id: number
  title?: string | null
  titleEn?: string | null
  durationMinutes?: number | null
  type?: string | null
  genre?: string | null
  releaseYear?: number | null
  synopsis?: string | null
  synopsisEn?: string | null
  logline?: string | null
  loglineEn?: string | null
  classification?: string | null
  projectStatus?: string | null
  status?: string | null
  isPublishedToCatalog?: boolean
  totalBudget?: number | string | null
  economicRecovery?: number | string | null
  spectatorsCount?: number | null
  crewTotal?: number | null
  actorsTotal?: number | null
  projectNeed?: string | null
  projectNeedEn?: string | null
  trailerLink?: string | null
  makingOfLink?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  country?: BasicEntity
  cities?: BasicEntity[]
  subgenres?: BasicEntity[]
  languages?: BasicEntity[]
  subtitles?: Array<{ language?: BasicEntity }>
  professionals?: ProfessionalEntry[]
  companies?: MovieCompany[]
  internationalCoproductions?: MovieCoproduction[]
  filmingCountries?: Array<{ country?: BasicEntity }>
  funding?: MovieFunding[]
  nationalReleases?: MovieNationalRelease[]
  internationalReleases?: MovieInternationalRelease[]
  festivalNominations?: MovieFestivalNomination[]
  platforms?: MoviePlatform[]
  contacts?: MovieContact[]
  contentBank?: MovieContentBank[]
  posterAsset?: Asset | null
  dossierAsset?: Asset | null
  dossierAssetEn?: Asset | null
  pedagogicalSheetAsset?: Asset | null
  frameAssets?: Asset[]
}

const EMPTY_LABEL = "No completado"

const textValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return EMPTY_LABEL
  }

  const printable = String(value).trim()
  return printable.length ? printable : EMPTY_LABEL
}

const listValue = (values: string[]): string => {
  const clean = values.map((item) => item.trim()).filter(Boolean)
  return clean.length ? clean.join(", ") : EMPTY_LABEL
}

const relationName = (entity?: BasicEntity): string => textValue(entity?.name)

const professionalPhotoUrl = (entry?: ProfessionalEntry): string | null => {
  return entry?.professional?.profilePhotoAsset?.url || null
}

const professionalBio = (entry?: ProfessionalEntry): string | null => {
  const p = entry?.professional
  const text = String(p?.bio || p?.bioEn || "").trim()
  return text || null
}

const roleIdOf = (entry?: ProfessionalEntry): number | undefined => {
  return entry?.cinematicRoleId ?? entry?.cinematicRole?.id
}

const isDirectorEntry = (entry?: ProfessionalEntry): boolean => {
  if (!entry) return false
  const roleId = roleIdOf(entry)
  if (roleId === 1) return true

  const roleName = normalizeForMap(entry.cinematicRole?.name)
  return roleName.includes("director") || roleName.includes("direccion")
}

const isProducerEntry = (entry?: ProfessionalEntry): boolean => {
  if (!entry) return false
  const roleId = roleIdOf(entry)
  if (roleId === 2) return true

  const roleName = normalizeForMap(entry.cinematicRole?.name)
  return roleName.includes("productor") || roleName.includes("produccion") || roleName.includes("producer")
}

const professionalIdentityKey = (entry?: ProfessionalEntry): string => {
  const professional = entry?.professional
  if (professional?.id) return `id:${professional.id}`

  const normalizedName = normalizeForMap(professional?.fullName || professional?.name)
  if (normalizedName) return `name:${normalizedName}`

  const normalizedEmail = normalizeForMap(professional?.email)
  if (normalizedEmail) return `email:${normalizedEmail}`

  const normalizedPhone = normalizeForMap(professional?.phone || professional?.mobile)
  if (normalizedPhone) return `phone:${normalizedPhone}`

  return `role:${roleIdOf(entry) || "unknown"}`
}

type ProfessionalSlot = {
  entry: ProfessionalEntry
  roleEs: string
  roleEn: string
}

const buildDirectorProducerSlots = (entries?: ProfessionalEntry[]): ProfessionalSlot[] => {
  const relevant = (entries || []).filter((entry) => isDirectorEntry(entry) || isProducerEntry(entry))
  if (!relevant.length) return []

  type Group = {
    key: string
    entry: ProfessionalEntry
    hasDirector: boolean
    hasProducer: boolean
    firstIndex: number
  }

  const grouped = new Map<string, Group>()

  for (let index = 0; index < relevant.length; index += 1) {
    const entry = relevant[index]
    const key = professionalIdentityKey(entry)
    const hasDirector = isDirectorEntry(entry)
    const hasProducer = isProducerEntry(entry)
    const existing = grouped.get(key)

    if (!existing) {
      grouped.set(key, {
        key,
        entry,
        hasDirector,
        hasProducer,
        firstIndex: index,
      })
      continue
    }

    existing.hasDirector = existing.hasDirector || hasDirector
    existing.hasProducer = existing.hasProducer || hasProducer

    // Prefer an entry with profile photo when merging same person roles.
    if (!professionalPhotoUrl(existing.entry) && professionalPhotoUrl(entry)) {
      existing.entry = entry
    }
  }

  const groups = Array.from(grouped.values()).sort((a, b) => a.firstIndex - b.firstIndex)
  const slots: Group[] = []

  const mergedRolePerson = groups.find((group) => group.hasDirector && group.hasProducer)
  if (mergedRolePerson) {
    slots.push(mergedRolePerson)
    const nextDifferent = groups.find((group) => group.key !== mergedRolePerson.key)
    if (nextDifferent) slots.push(nextDifferent)
  } else {
    const firstDirector = groups.find((group) => group.hasDirector)
    if (firstDirector) slots.push(firstDirector)

    const firstProducer = groups.find((group) => group.hasProducer && group.key !== slots[0]?.key)
    if (firstProducer) slots.push(firstProducer)

    if (slots.length < 2) {
      const fallback = groups.find((group) => group.key !== slots[0]?.key)
      if (fallback) slots.push(fallback)
    }
  }

  return slots.slice(0, 2).map((group) => {
    if (group.hasDirector && group.hasProducer) {
      return {
        entry: group.entry,
        roleEs: "Dirección / Producción",
        roleEn: "Direction / Production",
      }
    }

    if (group.hasDirector) {
      return {
        entry: group.entry,
        roleEs: "Dirección",
        roleEn: "Direction",
      }
    }

    return {
      entry: group.entry,
      roleEs: "Producción",
      roleEn: "Production",
    }
  })
}

const normalizeForMap = (value: unknown): string =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

const translateByMap = (value: unknown, map: Record<string, string>): string => {
  const base = textValue(value)
  if (base === EMPTY_LABEL) return EMPTY_LABEL
  const translated = map[normalizeForMap(base)]
  return translated || base
}

const GENRE_TRANSLATIONS: Record<string, string> = {
  // Backend GenreType enum values (normalized)
  ficcion: "Fiction",
  documental: "Documentary",
  "docu-ficcion": "Docu-fiction",
  docuficcion: "Docu-fiction",
  "falso documental": "Mockumentary",
  "sin catalogar": "Uncategorized",
  // Additional genre/subgenre values
  accion: "Action",
  aventura: "Adventure",
  animacion: "Animation",
  biografico: "Biographical",
  biopico: "Biopic",
  "ciencia ficcion": "Science Fiction",
  "ciencia-ficcion": "Science Fiction",
  comedia: "Comedy",
  "comedia dramatica": "Dramedy",
  crimen: "Crime",
  docudrama: "Docudrama",
  drama: "Drama",
  "drama historico": "Historical Drama",
  "drama social": "Social Drama",
  experimental: "Experimental",
  fantasia: "Fantasy",
  fantastico: "Fantastic",
  historico: "Historical",
  horror: "Horror",
  infantil: "Children",
  musical: "Musical",
  misterio: "Mystery",
  noir: "Noir",
  policial: "Crime/Police",
  "realismo magico": "Magic Realism",
  romance: "Romance",
  suspenso: "Thriller",
  thriller: "Thriller",
  terror: "Horror",
  western: "Western",
  "coming of age": "Coming of Age",
  guerra: "War",
  deportivo: "Sports",
  familiar: "Family",
  erotico: "Erotic",
  poetico: "Poetic",
  surrealista: "Surrealist",
}

const LANGUAGE_TRANSLATIONS: Record<string, string> = {
  espanol: "Spanish",
  castellano: "Spanish",
  ingles: "English",
  frances: "French",
  portugues: "Portuguese",
  italiano: "Italian",
  aleman: "German",
  quichua: "Kichwa",
  kichwa: "Kichwa",
}

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  ecuador: "Ecuador",
  colombia: "Colombia",
  peru: "Peru",
  chile: "Chile",
  argentina: "Argentina",
  mexico: "Mexico",
  espana: "Spain",
  "estados unidos": "United States",
  uruguay: "Uruguay",
  brasil: "Brazil",
  bolivia: "Bolivia",
  venezuela: "Venezuela",
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  // Backend MovieType enum values (normalized)
  cortometraje: "Short Film",
  mediometraje: "Medium-length Film",
  largometraje: "Feature Film",
  series: "Series",
  videojuegos: "Video Games",
  "sin catalogar": "Uncategorized",
  // Additional
  documental: "Documentary",
  serie: "Series",
  webserie: "Web Series",
  telefilm: "TV Movie",
  videoclip: "Music Video",
  animacion: "Animation",
}

const ROLE_TRANSLATIONS: Record<string, string> = {
  direccion: "Direction",
  produccion: "Production",
  "direccion de fotografia": "Cinematography",
  guion: "Screenplay",
  montaje: "Editing",
  "direccion de arte": "Art Direction",
  sonido: "Sound",
  musica: "Music",
  actuacion: "Acting",
  "actuacion (actor / actriz / actore)": "Acting (Actor / Actress / Actor)",
  "actuacion de voz": "Voice Acting",
  "diseno sonoro": "Sound Design",
  maquillaje: "Makeup",
  vestuario: "Costume Design",
  animacion: "Animation",
}

const translateLanguageEntity = (entity?: BasicEntity): string => {
  const fromNameEn = textValue(entity?.nameEn)
  if (fromNameEn !== EMPTY_LABEL) return fromNameEn

  const code = String(entity?.code || "").trim().toLowerCase()
  if (code) {
    try {
      const byCode = new Intl.DisplayNames(["en"], { type: "language" }).of(code)
      if (byCode) return byCode
    } catch {
      // Fallback to name map when code is not valid/available.
    }
  }

  return translateByMap(entity?.name, LANGUAGE_TRANSLATIONS)
}

const translateCountryEntity = (entity?: BasicEntity): string => {
  const fromNameEn = textValue(entity?.nameEn)
  if (fromNameEn !== EMPTY_LABEL) return fromNameEn

  const code = String(entity?.code || "").trim().toUpperCase()
  if (code.length === 2) {
    try {
      const byCode = new Intl.DisplayNames(["en"], { type: "region" }).of(code)
      if (byCode) return byCode
    } catch {
      // Fallback to name map when code is not valid/available.
    }
  }

  return translateByMap(entity?.name, COUNTRY_TRANSLATIONS)
}

const translateRoleEntity = (entity?: BasicEntity): string => {
  const fromNameEn = textValue(entity?.nameEn)
  if (fromNameEn !== EMPTY_LABEL) return fromNameEn

  return translateByMap(entity?.name, ROLE_TRANSLATIONS)
}

const roleLabel = (value?: string | null): string => {
  const raw = textValue(value)
  const map: Record<string, string> = {
    desarrollo: "Desarrollo",
    produccion: "Producción",
    postproduccion: "Postproducción",
    distribucion: "Distribución",
    finalizado: "Finalizado",
    no_especificada: "No especificada",
    in_review: "En revisión",
    approved: "Aprobada",
    rejected: "Rechazada",
    draft: "Borrador",
    archived: "Archivada",
  }

  return map[raw] || raw
}

const getStatusColor = (status?: string | null): string => {
  const map: Record<string, string> = {
    desarrollo: "#FF9500",
    produccion: "#007AFF",
    postproduccion: "#5856D6",
    distribucion: "#34C759",
    finalizado: "#00B894",
    no_especificada: "#8E8E93",
  }
  return map[String(status).toLowerCase()] || "#666"
}

const extractVideoId = (url?: string | null): { type: "youtube" | "vimeo" | null; id: string } | null => {
  if (!url) return null

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
  if (youtubeMatch) return { type: "youtube", id: youtubeMatch[1] }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: "vimeo", id: vimeoMatch[1] }

  return null
}

const normalizeExternalUrl = (url?: string | null): string | null => {
  const raw = String(url || "").trim()
  if (!raw) return null

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  return `https://${raw}`
}

const platformNameFromUrl = (url?: string | null): string | null => {
  const normalized = normalizeExternalUrl(url)
  if (!normalized) return null

  try {
    const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "")
    const base = hostname.split(".")[0]
    if (!base) return null
    return base.charAt(0).toUpperCase() + base.slice(1)
  } catch {
    return null
  }
}

const VideoEmbed = ({ videoUrl }: { videoUrl?: string | null }) => {
  const video = extractVideoId(videoUrl)
  if (!video) return null

  return (
    <div className={styles.videoContainer}>
      {video.type === "youtube" ? (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${video.id}`}
          title="Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${video.id}`}
          title="Trailer"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}

export default function PublicCatalogMoviePage() {
  const params = useParams()
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const movieId = Number(rawId)

  const [movie, setMovie] = useState<PublicMovieDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [frameSelected, setFrameSelected] = useState<string | null>(null)

  useEffect(() => {
    const loadMovie = async () => {
      if (!movieId || Number.isNaN(movieId)) {
        setError("ID de película inválido")
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        setIsLoading(true)
        const data = await publicMovieService.getPublicById(movieId)
        setMovie(data as unknown as PublicMovieDetail)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la película")
      } finally {
        setIsLoading(false)
      }
    }

    loadMovie()
  }, [movieId])

  const directors = useMemo(() => {
    const fromRoles =
      movie?.professionals
        ?.filter((entry) => entry?.cinematicRole?.id === 1 || entry?.cinematicRoleId === 1)
        .map((entry) => entry?.professional?.fullName || entry?.professional?.name || "")
        .filter(Boolean) || []

    const fromContacts =
      movie?.contacts
        ?.filter((contact) => (contact.role || "").toLowerCase().includes("director"))
        .map((contact) => contact.name || "")
        .filter(Boolean) || []

    return listValue(Array.from(new Set([...fromRoles, ...fromContacts])))
  }, [movie])

  const producers = useMemo(() => {
    const fromRoles =
      movie?.professionals
        ?.filter((entry) => entry?.cinematicRole?.id === 2 || entry?.cinematicRoleId === 2)
        .map((entry) => entry?.professional?.fullName || entry?.professional?.name || "")
        .filter(Boolean) || []

    const fromContacts =
      movie?.contacts
        ?.filter((contact) => (contact.role || "").toLowerCase().includes("productor"))
        .map((contact) => contact.name || "")
        .filter(Boolean) || []

    return listValue(Array.from(new Set([...fromRoles, ...fromContacts])))
  }, [movie])

  const contactRows = useMemo(() => {
    return (movie?.contacts || [])
      .map((contact) => {
        const role = textValue(contact?.role)
        const name = textValue(contact?.name)
        const phone = textValue(contact?.phone)
        const email = textValue(contact?.email)

        const hasUsefulData = [name, phone, email].some((value) => value !== EMPTY_LABEL)
        if (!hasUsefulData) return null

        const parts: string[] = []
        if (name !== EMPTY_LABEL) parts.push(name)
        if (phone !== EMPTY_LABEL) parts.push(phone)
        if (email !== EMPTY_LABEL) parts.push(email)

        return {
          role,
          value: parts.join(" · "),
        }
      })
      .filter((row): row is { role: string; value: string } => Boolean(row))
  }, [movie])

  const directorEntry = useMemo(() => {
    return (movie?.professionals || []).find((entry) => isDirectorEntry(entry))
  }, [movie])

  const producerEntry = useMemo(() => {
    return (movie?.professionals || []).find((entry) => isProducerEntry(entry))
  }, [movie])

  const professionalSlots = useMemo(() => {
    return buildDirectorProducerSlots(movie?.professionals)
  }, [movie])

  const directorPhotoUrl = useMemo(() => professionalPhotoUrl(directorEntry), [directorEntry])
  const producerPhotoUrl = useMemo(() => professionalPhotoUrl(producerEntry), [producerEntry])

  const mainProductionCompany = useMemo(() => {
    const producerCompanies = (movie?.companies || []).filter((company) =>
      String(company.participation || "").toLowerCase().includes("produ") &&
      !String(company.participation || "").toLowerCase().includes("coprodu")
    )

    const firstProducer = producerCompanies[0]
    const companyName = firstProducer ? relationName(firstProducer.company) : EMPTY_LABEL

    return companyName !== EMPTY_LABEL ? companyName : null
  }, [movie])

  const internationalCoproducers = useMemo(() => {
    return (movie?.internationalCoproductions || [])
      .map((company) => {
        const name = textValue(company.companyName)
        const country = relationName(company.country)

        if (name === EMPTY_LABEL && country === EMPTY_LABEL) {
          return EMPTY_LABEL
        }

        if (country === EMPTY_LABEL) {
          return name
        }

        return `${name} (${country})`
      })
      .filter((value) => value !== EMPTY_LABEL)
  }, [movie])

  const coproducers = useMemo(() => {
    const national = (movie?.companies || [])
      .filter((company) =>
        String(company.participation || "").toLowerCase().includes("coprodu")
      )
      .map((company) => relationName(company.company))
      .filter((name) => name !== EMPTY_LABEL)

    return Array.from(new Set([...national, ...internationalCoproducers]))
  }, [movie, internationalCoproducers])

  const fillingCountriesText = useMemo(() => {
    return listValue((movie?.filmingCountries || []).map((f) => relationName(f.country)))
  }, [movie])

  const fillingCountriesTextEn = useMemo(() => {
    return listValue((movie?.filmingCountries || []).map((f) => translateCountryEntity(f.country)))
  }, [movie])

  const typeEn = useMemo(() => translateByMap(movie?.type, TYPE_TRANSLATIONS), [movie])

  const genreEn = useMemo(() => translateByMap(movie?.genre, GENRE_TRANSLATIONS), [movie])

  const subgenresEn = useMemo(() => {
    return listValue((movie?.subgenres || []).map((subgenre) => {
      const fromNameEn = textValue(subgenre?.nameEn)
      if (fromNameEn !== EMPTY_LABEL) return fromNameEn
      return translateByMap(subgenre?.name, GENRE_TRANSLATIONS)
    }))
  }, [movie])

  const languagesEn = useMemo(() => {
    return listValue((movie?.languages || []).map((language) => translateLanguageEntity(language)))
  }, [movie])

  const subtitlesEn = useMemo(() => {
    return listValue((movie?.subtitles || []).map((subtitle) => translateLanguageEntity(subtitle?.language)))
  }, [movie])

  const posterImageId = movie ? `public-movie-poster-${movie.id}` : "public-movie-poster"
  const directorImageId = movie ? `public-director-photo-${movie.id}` : "public-director-photo"
  const producerImageId = movie ? `public-producer-photo-${movie.id}` : "public-producer-photo"

  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        {/* Botón de volver al catálogo eliminado por solicitud */}

        {isLoading && (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>Cargando información de la película...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className={`${styles.stateBox} ${styles.errorBox}`}>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && movie && (
          <>
            {/* HERO SECTION */}
            <section className={styles.heroNew}>
              <div className={styles.posterColumn}>
                {movie.posterAsset?.url ? (
                  <Image
                    id={posterImageId}
                    data-poster-image="true"
                    src={movie.posterAsset.url}
                    alt={textValue(movie.title)}
                    width={300}
                    height={450}
                    className={styles.posterImage}
                  />
                ) : (
                  <div className={styles.posterPlaceholder}>SIN AFICHE</div>
                )}

                {(String(movie.logline || "").trim() || String(movie.loglineEn || "").trim()) && (
                  <div className={styles.posterLoglines}>
                    {String(movie.logline || "").trim() && (
                      <p className={styles.posterLogline}>{textValue(movie.logline)}</p>
                    )}
                    {String(movie.loglineEn || "").trim() && (
                      <p className={`${styles.posterLogline} ${styles.posterLoglineEn}`}>
                        {textValue(movie.loglineEn)}
                      </p>
                    )}
                  </div>
                )}

                <MovieInfoSheetSection
                  movie={movie}
                  posterElementId={posterImageId}
                  directorPhotoElementId={directorImageId}
                  producerPhotoElementId={producerImageId}
                />
              </div>

              <div className={styles.infoColumn}>
                {/* Estado del proyecto */}
                <div className={styles.statusRow}>
                  <span className={styles.statusCaption}>Estado del proyecto</span>
                  <span
                    className={styles.statusTag}
                    style={{ "--status-color": getStatusColor(movie.projectStatus) } as CSSProperties}
                  >
                    {roleLabel(movie.projectStatus)}
                  </span>
                </div>

                {/* Titulo */}
                <h1 className={styles.movieTitle}>{textValue(movie.title)}</h1>

                {/* Título en inglés (solo si está disponible) */}
                {String(movie.titleEn || "").trim() && (
                  <p className={styles.titleEn}>{movie.titleEn}</p>
                )}

                {relationName(movie.country) !== EMPTY_LABEL && (
                  <p className={styles.titleCountry}>{relationName(movie.country)}</p>
                )}

                {/* Director, Productor, Empresas */}
                <div className={styles.creditsRow}>
                  <div className={styles.creditItem}>
                    <span className={styles.creditLabel}>Dirección</span>
                    <span className={styles.creditLabelSecondary}>Direction</span>
                    <p className={styles.creditValue}>{directors}</p>
                  </div>
                  <div className={styles.creditItem}>
                    <span className={styles.creditLabel}>Producción</span>
                    <span className={styles.creditLabelSecondary}>Production</span>
                    <p className={styles.creditValue}>{producers}</p>
                  </div>
                </div>

                {contactRows.length > 0 && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Contacto</span>
                    <span className={styles.creditLabelSecondary}>Contact</span>
                    <ul className={styles.coproducersList}>
                      {contactRows.map((row, idx) => (
                        <li key={`contact-${idx}`}>
                          <strong>{row.role !== EMPTY_LABEL ? `${row.role}: ` : ""}</strong>
                          {row.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {movie.posterAsset?.url && (
                  <img
                    src={movie.posterAsset.url}
                    alt=""
                    aria-hidden="true"
                    className={styles.posterPreload}
                  />
                )}

                {directorPhotoUrl && (
                  <img
                    data-director-photo="true"
                    src={directorPhotoUrl}
                    alt=""
                    aria-hidden="true"
                    className={styles.posterPreload}
                  />
                )}

                {producerPhotoUrl && (
                  <img
                    data-producer-photo="true"
                    src={producerPhotoUrl}
                    alt=""
                    aria-hidden="true"
                    className={styles.posterPreload}
                  />
                )}

                {/* Empresa productora principal */}
                {mainProductionCompany && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Empresa Productora</span>
                    <span className={styles.creditLabelSecondary}>Production Company</span>
                    <p className={styles.creditValue}>{mainProductionCompany}</p>
                  </div>
                )}

                {/* Coproducción */}
                {coproducers.length > 0 && (
                  <div className={styles.companyRow}>
                    <span className={styles.creditLabel}>Coproducción</span>
                    <span className={styles.creditLabelSecondary}>Coproduction</span>
                    <ul className={styles.coproducersList}>
                      {coproducers.map((copro, idx) => (
                        <li key={idx}>{copro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata Row 1: Año, Tipo, Duración */}
                <div className={styles.metaRow}>
                  {String(movie.releaseYear || "").trim() && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Año</span>
                      <span className={styles.metaLabelSecondary}>Year</span>
                      <p className={styles.metaValue}>{textValue(movie.releaseYear)}</p>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Tipo</span>
                    <span className={styles.metaLabelSecondary}>Type</span>
                    <p className={styles.metaValue}>
                      {textValue(movie.type)}
                      {typeEn !== EMPTY_LABEL && typeEn !== textValue(movie.type) && (
                        <span className={styles.metaValueTranslation}> · {typeEn}</span>
                      )}
                    </p>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Duración</span>
                    <span className={styles.metaLabelSecondary}>Duration</span>
                    <p className={styles.metaValue}>
                      {movie.durationMinutes ? `${movie.durationMinutes} min` : EMPTY_LABEL}
                    </p>
                  </div>
                </div>

                {/* Metadata Row 2: Género, Subgénero */}
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Género</span>
                    <span className={styles.metaLabelSecondary}>Genre</span>
                    <p className={styles.metaValue}>
                      {textValue(movie.genre)}
                      {genreEn !== EMPTY_LABEL && genreEn !== textValue(movie.genre) && (
                        <span className={styles.metaValueTranslation}> · {genreEn}</span>
                      )}
                    </p>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Subgénero</span>
                    <span className={styles.metaLabelSecondary}>Subgenre</span>
                    <p className={styles.metaValue}>
                      {listValue((movie.subgenres || []).map((s) => textValue(s?.name)))}
                      {subgenresEn !== EMPTY_LABEL && subgenresEn !== listValue((movie.subgenres || []).map((s) => textValue(s?.name))) && (
                        <span className={styles.metaValueTranslation}> · {subgenresEn}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Países coproductores */}
                {fillingCountriesText !== EMPTY_LABEL && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaItemFull}>
                      <span className={styles.metaLabel}>Países de Coproducción</span>
                      <span className={styles.metaLabelSecondary}>Coproduction Countries</span>
                      <p className={styles.metaValue}>
                        {fillingCountriesText}
                        {fillingCountriesTextEn !== EMPTY_LABEL && fillingCountriesTextEn !== fillingCountriesText && (
                          <span className={styles.metaValueTranslation}> · {fillingCountriesTextEn}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Idioma */}
                <div className={styles.metaRow}>
                  <div className={styles.metaItemFull}>
                    <span className={styles.metaLabel}>Idioma</span>
                    <span className={styles.metaLabelSecondary}>Language</span>
                    <p className={styles.metaValue}>
                      {listValue((movie.languages || []).map((language) => textValue(language?.name)))}
                      {languagesEn !== EMPTY_LABEL && languagesEn !== listValue((movie.languages || []).map((language) => textValue(language?.name))) && (
                        <span className={styles.metaValueTranslation}> · {languagesEn}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Subtítulos (solo si está disponible) */}
                {(movie.subtitles || []).length > 0 && (
                  <div className={styles.metaRow}>
                    <div className={styles.metaItemFull}>
                      <span className={styles.metaLabel}>Subtítulos</span>
                      <span className={styles.metaLabelSecondary}>Subtitles</span>
                      <p className={styles.metaValue}>
                        {listValue((movie.subtitles || []).map((subtitle) => textValue(subtitle?.language?.name)))}
                        {subtitlesEn !== EMPTY_LABEL && subtitlesEn !== listValue((movie.subtitles || []).map((subtitle) => textValue(subtitle?.language?.name))) && (
                          <span className={styles.metaValueTranslation}> · {subtitlesEn}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SYNOPSIS SECTION */}
            <section className={styles.contentSection}>
              <div className={styles.contentBlock}>
                <h3 className={styles.sectionTitle}>
                  Sinopsis
                  <span className={styles.sectionTitleSecondary}>Synopsis</span>
                </h3>
                <p className={styles.contentText}>{textValue(movie.synopsis)}</p>
                {String(movie.synopsisEn || "").trim() && (
                  <p className={styles.contentTextEn}>{textValue(movie.synopsisEn)}</p>
                )}
              </div>
            </section>

            {/* DIRECTOR / PRODUCER SECTION */}
            {professionalSlots.length > 0 && (
              <section className={styles.professionalsSection}>
                <h3 className={styles.sectionTitle}>
                  Dirección y Producción
                  <span className={styles.sectionTitleSecondary}>Direction &amp; Production</span>
                </h3>
                <div className={styles.professionalsGrid}>
                  {professionalSlots.map(({ entry, roleEs, roleEn }, index) => {
                      const photoUrl = professionalPhotoUrl(entry)
                      const bio = professionalBio(entry)
                      const name = textValue(entry?.professional?.fullName || entry?.professional?.name)
                      const photoElementId = index === 0 ? directorImageId : producerImageId
                      return (
                        <div key={`${professionalIdentityKey(entry)}-${roleEs}`} className={styles.professionalCard}>
                          {photoUrl ? (
                            <Image
                              id={photoElementId}
                              src={photoUrl}
                              alt={name}
                              width={1200}
                              height={1600}
                              quality={100}
                              className={styles.professionalPhoto}
                            />
                          ) : (
                            <div className={styles.professionalPhotoPlaceholder}>SIN<br />FOTO</div>
                          )}
                          <div className={styles.professionalInfo}>
                            <p className={styles.professionalRole}>{roleEs}</p>
                            <p className={styles.professionalRoleEn}>{roleEn}</p>
                            {entry?.professional?.id ? (
                              <Link href={`/public/professionals/${entry.professional.id}`} className={`${styles.professionalName} ${styles.professionalNameLink}`}>
                                {name}
                              </Link>
                            ) : (
                              <p className={styles.professionalName}>{name}</p>
                            )}
                            {bio && <p className={styles.professionalBio}>{bio}</p>}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </section>
            )}

            {/* TRAILER SECTION */}
            {extractVideoId(movie.trailerLink) && (
              <section className={styles.trailerSection}>
                <h3 className={styles.sectionTitle}>
                  Trailer
                  <span className={styles.sectionTitleSecondary}>Trailer</span>
                </h3>
                <VideoEmbed videoUrl={movie.trailerLink} />
              </section>
            )}

            {/* PROJECT NEEDS SECTION */}
            {(movie.projectNeed || movie.projectNeedEn) && (
              <section className={styles.contentSection}>
                <div className={styles.contentBlock}>
                  <h3 className={styles.sectionTitle}>
                    Necesidades del Proyecto
                    <span className={styles.sectionTitleSecondary}>Project Needs</span>
                  </h3>
                  {String(movie.projectNeed || "").trim() && (
                    <p className={styles.contentText}>{textValue(movie.projectNeed)}</p>
                  )}
                  {String(movie.projectNeedEn || "").trim() && (
                    <p className={styles.contentTextEn}>{textValue(movie.projectNeedEn)}</p>
                  )}
                </div>
              </section>
            )}

            {/* FRAMES GALLERY SECTION */}
            {(movie.frameAssets || []).length > 0 && (
              <section className={styles.gallerySection}>
                <h3 className={styles.sectionTitle}>
                  Fotogramas
                  <span className={styles.sectionTitleSecondary}>Stills</span>
                </h3>

                <div className={styles.galleryMain}>
                  {frameSelected && (
                    <Image
                      src={frameSelected}
                      alt="Selected frame"
                      width={800}
                      height={450}
                      className={styles.galleryMainImage}
                    />
                  )}
                  {!frameSelected && (movie.frameAssets?.[0]?.url) && (
                    <Image
                      src={movie.frameAssets[0].url}
                      alt="Frame"
                      width={800}
                      height={450}
                      className={styles.galleryMainImage}
                    />
                  )}
                </div>

                <div className={styles.galleryThumbnails}>
                  {(movie.frameAssets || []).map((frame, idx) => (
                    <div
                      key={idx}
                      className={`${styles.thumbnail} ${frameSelected === frame.url ? styles.active : ""}`}
                      onClick={() => setFrameSelected(frame.url || null)}
                    >
                      {frame.url && (
                        <Image
                          src={frame.url}
                          alt={`Frame ${idx + 1}`}
                          width={120}
                          height={80}
                          className={styles.thumbnailImage}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CREDITED TEAM SECTION */}
            {(movie.professionals || []).length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Equipo Acreditado
                  <span className={styles.sectionTitleSecondary}>Credited Team</span>
                </h3>
                <ul className={styles.creditedList}>
                  {(movie.professionals || []).map((entry, index) => {
                    const roleName = textValue(entry.cinematicRole?.name)
                    const roleNameEn = translateRoleEntity(entry.cinematicRole)

                    return (
                      <li key={`${entry.professional?.id || "p"}-${index}`} className={styles.creditedItem}>
                        {entry.professional?.id ? (
                          <Link href={`/public/professionals/${entry.professional.id}`} className={styles.creditedNameLink}>
                            <strong>{textValue(entry.professional?.fullName || entry.professional?.name)}</strong>
                          </Link>
                        ) : (
                          <strong>{textValue(entry.professional?.fullName || entry.professional?.name)}</strong>
                        )}
                        <span>
                          {roleName}
                          {roleNameEn !== EMPTY_LABEL && roleNameEn !== roleName && (
                            <span className={styles.creditedRoleTranslation}> · {roleNameEn}</span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {/* NOMINATIONS SECTION */}
            {(movie.festivalNominations || []).length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Nominaciones y Selección
                  <span className={styles.sectionTitleSecondary}>Nominations and Selection</span>
                </h3>
                <ul className={styles.creditedList}>
                  {(movie.festivalNominations || []).map((entry, index) => (
                    <li key={`festival-${index}`} className={styles.creditedItem}>
                      <strong>{relationName(entry.fund)}</strong>
                      <span>
                        {textValue(entry.category)} · {textValue(entry.year)} · {textValue(entry.result)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FUNDING SECTION */}
            {(movie.funding || []).length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Fondos recibidos
                  <span className={styles.sectionTitleSecondary}>Funds Received</span>
                </h3>
                <ul className={styles.creditedList}>
                  {(movie.funding || []).map((entry, index) => (
                    <li key={`funding-${index}`} className={styles.creditedItem}>
                      <strong>{relationName(entry.fund)}</strong>
                      <span>
                        {textValue(entry.fundingStage)} · {textValue(entry.year)} · {textValue(entry.amountGranted)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* PLATFORMS SECTION */}
            {(movie.platforms || []).length > 0 && (
              <section className={styles.listSection}>
                <h3 className={styles.sectionTitle}>
                  Plataformas
                  <span className={styles.sectionTitleSecondary}>Platforms</span>
                </h3>
                <ul className={styles.creditedList}>
                  {(movie.platforms || []).map((entry, index) => (
                    <li key={`platform-${index}`} className={styles.creditedItem}>
                      <strong>{relationName(entry.platform) !== EMPTY_LABEL ? relationName(entry.platform) : (platformNameFromUrl(entry.link) || EMPTY_LABEL)}</strong>
                      {normalizeExternalUrl(entry.link) && (
                        <a
                          href={normalizeExternalUrl(entry.link) || ""}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Ver en plataforma
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* DOWNLOAD DOSSIER SECTION */}
            {(movie.dossierAsset?.url || movie.dossierAssetEn?.url) && (
              <section className={styles.downloadSection}>
                <h3 className={styles.sectionTitle}>
                  Descargar Dossier
                  <span className={styles.sectionTitleSecondary}>Download Dossier</span>
                </h3>
                <div className={styles.downloadButtons}>
                  {movie.dossierAsset?.url && (
                    <a href={movie.dossierAsset.url} download className={styles.downloadBtn}>
                      📄 Dossier Español
                    </a>
                  )}
                  {movie.dossierAssetEn?.url && (
                    <a href={movie.dossierAssetEn.url} download className={styles.downloadBtn}>
                      📄 Dossier English
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* MAKING OF SECTION */}
            {extractVideoId(movie.makingOfLink) && (
              <section className={styles.trailerSection}>
                <h3 className={styles.sectionTitle}>
                  Making Of
                  <span className={styles.sectionTitleSecondary}>Behind the Scenes</span>
                </h3>
                <VideoEmbed videoUrl={movie.makingOfLink} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
