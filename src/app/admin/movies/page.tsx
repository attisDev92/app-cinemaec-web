"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { movieService } from "@/features/movies"
import {
  CreateMoviePayload,
  MovieClassification,
  MovieGenre,
  MovieType,
  ProjectStatus,
} from "@/features/movies/types"
import { ecuadorProvinces } from "@/shared/data/ecuador-locations"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card, Input } from "@/shared/components/ui"
import { UserRole } from "@/shared/types"
import styles from "./movies.module.css"

interface FormState {
  title: string
  titleEn: string
  durationMinutes: string
  type: MovieType
  genres: MovieGenre[]
  languages: string[]
  countryCode: string
  provinces: string[]
  cities: string[]
  releaseYear: string
  synopsis: string
  synopsisEn: string
  logLine: string
  logLineEn: string
  classification: MovieClassification
  projectStatus: ProjectStatus
}

const GENRES: MovieGenre[] = [
  "animacion",
  "antropologico",
  "aventura",
  "biografico",
  "ciencia_ficcion",
  "cine_guerrilla",
  "comedia",
  "deportivo",
  "drama",
  "etnografico",
  "experimental",
  "familiar",
  "fantastico",
  "genero",
  "historico",
  "infantil",
  "medioambiente",
  "musical",
  "policial",
  "religioso",
  "resistencia",
  "romance",
  "suspenso",
  "terror",
  "thriller",
  "vida_rural",
  "western",
  "otros",
]

const LANGUAGES = [
  "es",
  "en",
  "fr",
  "pt",
  "qu",
  "de",
  "it",
  "zh",
  "ja",
  "ru",
  "ar",
  "hi",
  "sw",
  "nl",
  "sv",
  "no",
  "da",
  "fi",
  "tr",
  "pl",
  "el",
  "he",
  "ko",
  "th",
  "vi",
]

const COUNTRIES = [
  "EC",
  "US",
  "AR",
  "CO",
  "MX",
  "ES",
  "BR",
  "CL",
  "PE",
  "BO",
  "PY",
  "UY",
  "VE",
  "CA",
  "GB",
  "IE",
  "FR",
  "DE",
  "IT",
  "NL",
  "BE",
  "SE",
  "NO",
  "DK",
  "FI",
  "CH",
  "PT",
  "AU",
  "NZ",
  "ZA",
  "NG",
  "KE",
  "JP",
  "CN",
  "KR",
  "IN",
  "SG",
  "AE",
  "SA",
  "IL",
]

const COUNTRY_LABELS: Record<string, string> = {
  EC: "Ecuador",
  US: "Estados Unidos",
  AR: "Argentina",
  CO: "Colombia",
  MX: "Mexico",
  ES: "Espana",
  BR: "Brasil",
  CL: "Chile",
  PE: "Peru",
  BO: "Bolivia",
  PY: "Paraguay",
  UY: "Uruguay",
  VE: "Venezuela",
  CA: "Canada",
  GB: "Reino Unido",
  IE: "Irlanda",
  FR: "Francia",
  DE: "Alemania",
  IT: "Italia",
  NL: "Paises Bajos",
  BE: "Belgica",
  SE: "Suecia",
  NO: "Noruega",
  DK: "Dinamarca",
  FI: "Finlandia",
  CH: "Suiza",
  PT: "Portugal",
  AU: "Australia",
  NZ: "Nueva Zelanda",
  ZA: "Sudafrica",
  NG: "Nigeria",
  KE: "Kenia",
  JP: "Japon",
  CN: "China",
  KR: "Corea del Sur",
  IN: "India",
  SG: "Singapur",
  AE: "Emiratos Arabes Unidos",
  SA: "Arabia Saudita",
  IL: "Israel",
}

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Espanol",
  en: "Ingles",
  fr: "Frances",
  pt: "Portugues",
  qu: "Kichwa",
  de: "Aleman",
  it: "Italiano",
  zh: "Chino",
  ja: "Japones",
  ru: "Ruso",
  ar: "Arabe",
  hi: "Hindi",
  sw: "Suajili",
  nl: "Neerlandes",
  sv: "Sueco",
  no: "Noruego",
  da: "Danes",
  fi: "Filandes",
  tr: "Turco",
  pl: "Polaco",
  el: "Griego",
  he: "Hebreo",
  ko: "Coreano",
  th: "Tailandes",
  vi: "Vietnamita",
}

const CLASSIFICATION_OPTIONS: { label: string; value: MovieClassification }[] =
  [
    { value: "todo_publico", label: "Todo publico" },
    { value: "recomendado_0_6", label: "Recomendado 0 a 6" },
    { value: "recomendado_6_12", label: "Recomendado 6 a 12" },
    {
      value: "menores_12_supervision",
      label: "Menores de 12 con supervision",
    },
    { value: "mayores_12", label: "Publico mayor de 12" },
    { value: "mayores_15", label: "Publico mayor de 15" },
    { value: "solo_mayores_18", label: "Solo mayores de 18" },
  ]

const PROJECT_STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { value: "desarrollo", label: "Desarrollo" },
  { value: "produccion", label: "Produccion" },
  { value: "post_produccion", label: "Post produccion" },
  { value: "distribucion", label: "Distribucion" },
  { value: "finalizado", label: "Finalizado" },
]

const initialState: FormState = {
  title: "",
  titleEn: "",
  durationMinutes: "",
  type: "cortometraje",
  genres: [],
  languages: [],
  countryCode: "EC",
  provinces: [],
  cities: [],
  releaseYear: "",
  synopsis: "",
  synopsisEn: "",
  logLine: "",
  logLineEn: "",
  classification: "todo_publico",
  projectStatus: "desarrollo",
}

export default function MoviesAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== UserRole.ADMIN) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, user, router])

  const sortedCountries = useMemo(
    () => COUNTRIES.map((code) => ({ code, name: COUNTRY_LABELS[code] })),
    [],
  )

  const sortedLanguages = useMemo(
    () => LANGUAGES.map((code) => ({ code, name: LANGUAGE_LABELS[code] })),
    [],
  )

  const availableCities = useMemo(() => {
    const citiesByProvince = form.provinces.flatMap((provinceName) => {
      const province = ecuadorProvinces.find((p) => p.name === provinceName)
      return province ? province.cities : []
    })
    return Array.from(new Set(citiesByProvince)).sort()
  }, [form.provinces])

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={`${styles.main} ${styles.status}`}>
          <div className={styles.badge}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={`${styles.main} ${styles.status}`}>
          <div className={styles.badge}>No autenticado. Redirigiendo...</div>
        </div>
      </div>
    )
  }

  if (user.role !== UserRole.ADMIN) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={`${styles.main} ${styles.status}`}>
          <Card className={styles.card}>
            <h2 className={styles.title}>Acceso Denegado</h2>
            <p className={styles.subtitle}>
              No tienes permisos para acceder a esta página.
            </p>
            <p className={styles.subtitle}>Tu rol actual: {user.role}</p>
            <Button onClick={() => router.push("/admin")}>
              Volver al Panel Admin
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const handleChange = (key: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleListValue = (
    key: "genres" | "languages" | "provinces" | "cities",
    value: string,
  ) => {
    setForm((prev) => {
      const exists = prev[key].includes(value as never)
      return {
        ...prev,
        [key]: exists
          ? (prev[key].filter((item) => item !== value) as never)
          : ([...prev[key], value] as never),
      }
    })
  }

  const clearCitiesIfMissingProvince = (provinces: string[]) => {
    const allowedCities = new Set(
      provinces.flatMap((provinceName) => {
        const province = ecuadorProvinces.find((p) => p.name === provinceName)
        return province ? province.cities : []
      }),
    )
    setForm((prev) => ({
      ...prev,
      provinces,
      cities: prev.cities.filter((city) => allowedCities.has(city)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)
    setSuccess(null)

    if (!form.title.trim()) {
      setErrors("El titulo es obligatorio")
      return
    }
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) {
      setErrors("La duracion debe ser mayor a 0")
      return
    }
    if (!form.genres.length) {
      setErrors("Selecciona al menos un genero")
      return
    }
    if (!form.languages.length) {
      setErrors("Selecciona al menos un idioma")
      return
    }
    if (!form.countryCode) {
      setErrors("Selecciona un pais de origen")
      return
    }
    if (!form.releaseYear || Number(form.releaseYear) < 1888) {
      setErrors("Ingresa un ano de estreno valido")
      return
    }
    if (!form.synopsis.trim()) {
      setErrors("La sinopsis es obligatoria")
      return
    }

    const payload: CreateMoviePayload = {
      title: form.title.trim(),
      titleEn: form.titleEn.trim() || undefined,
      durationMinutes: Number(form.durationMinutes),
      type: form.type,
      genres: form.genres,
      languages: form.languages,
      countryCode: form.countryCode,
      provinces: form.provinces,
      cities: form.cities,
      releaseYear: Number(form.releaseYear),
      synopsis: form.synopsis.trim(),
      synopsisEn: form.synopsisEn.trim() || undefined,
      logLine: form.logLine.trim() || undefined,
      logLineEn: form.logLineEn.trim() || undefined,
      classification: form.classification,
      projectStatus: form.projectStatus,
    }

    setSubmitting(true)

    try {
      const response = await movieService.create(payload)
      setSuccess("Pelicula guardada. Puedes continuar con casting y archivos.")
      if (response?.id) {
        setForm(initialState)
      }
    } catch (error) {
      const message =
        (error as { message?: string })?.message ||
        "No se pudo guardar la pelicula"
      setErrors(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion de peliculas</h1>
            <p className={styles.subtitle}>
              Completa los datos base de la pelicula (etapa 1)
            </p>
          </div>
          <span className={styles.badge}>Formulario inicial</span>
        </div>

        <Card className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Datos generales</h2>
                <p className={styles.sectionDescription}>
                  Informacion base para crear la pelicula.
                </p>
              </div>

              <div className={styles.grid}>
                <Input
                  label="Titulo original *"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ej: La frontera invisible"
                />

                <Input
                  label="Titulo en ingles"
                  value={form.titleEn}
                  onChange={(e) => handleChange("titleEn", e.target.value)}
                  placeholder="Ej: The invisible border"
                />

                <div className={styles.field}>
                  <label className={styles.label}>Duracion (minutos) *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      handleChange("durationMinutes", e.target.value)
                    }
                    placeholder="Ej: 95"
                    className={styles.durationInput}
                  />
                  <p className={styles.helper}>
                    Aproximado para proyectos no finalizados.
                  </p>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Tipo *</label>
                  <select
                    className={styles.select}
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="cortometraje">Cortometraje</option>
                    <option value="mediometraje">Mediometraje</option>
                    <option value="largometraje">Largometraje</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Pais de origen *</label>
                  <select
                    className={styles.select}
                    value={form.countryCode}
                    onChange={(e) =>
                      handleChange("countryCode", e.target.value)
                    }
                  >
                    <option value="">Selecciona un pais</option>
                    {sortedCountries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Ano de estreno *"
                  type="number"
                  min={1888}
                  value={form.releaseYear}
                  onChange={(e) => handleChange("releaseYear", e.target.value)}
                  placeholder="Ej: 2025"
                />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Ubicacion y rodaje</h2>
                <p className={styles.sectionDescription}>
                  Provincias y ciudades donde se filmo o tiene alcance la
                  pelicula.
                </p>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Provincias</div>
                <div className={styles.optionGrid}>
                  {ecuadorProvinces.map((province) => {
                    const checked = form.provinces.includes(province.name)
                    return (
                      <label
                        key={province.code}
                        className={`${styles.optionItem} ${checked ? styles.optionSelected : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? form.provinces.filter(
                                  (p) => p !== province.name,
                                )
                              : [...form.provinces, province.name]
                            clearCitiesIfMissingProvince(next)
                          }}
                        />
                        <span className={styles.optionLabel}>
                          {province.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <p className={styles.helper}>
                  Puedes seleccionar multiples provincias.
                </p>
              </div>

              {availableCities.length > 0 && (
                <div className={styles.field}>
                  <div className={styles.label}>Ciudades</div>
                  <div className={styles.optionGrid}>
                    {availableCities.map((city) => {
                      const checked = form.cities.includes(city)
                      return (
                        <label
                          key={city}
                          className={`${styles.optionItem} ${checked ? styles.optionSelected : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleListValue("cities", city)}
                          />
                          <span className={styles.optionLabel}>{city}</span>
                        </label>
                      )
                    })}
                  </div>
                  <p className={styles.helper}>
                    Filtra ciudades segun las provincias elegidas.
                  </p>
                </div>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Contenidos</h2>
                <p className={styles.sectionDescription}>
                  Generos, idiomas y sinopsis principal.
                </p>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Generos *</div>
                <div className={styles.optionGrid}>
                  {GENRES.map((genre) => {
                    const checked = form.genres.includes(genre)
                    return (
                      <label
                        key={genre}
                        className={`${styles.optionItem} ${checked ? styles.optionSelected : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleListValue("genres", genre)}
                        />
                        <span className={styles.optionLabel}>
                          {genre.replace(/_/g, " ")}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <p className={styles.helper}>Selecciona al menos un genero.</p>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Idiomas originales *</div>
                <div className={styles.optionGrid}>
                  {sortedLanguages.map((lang) => {
                    const checked = form.languages.includes(lang.code)
                    return (
                      <label
                        key={lang.code}
                        className={`${styles.optionItem} ${checked ? styles.optionSelected : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleListValue("languages", lang.code)
                          }
                        />
                        <span className={styles.optionLabel}>{lang.name}</span>
                      </label>
                    )
                  })}
                </div>
                <p className={styles.helper}>
                  Marca los idiomas tal y como se rodo la pelicula.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Sinopsis *</label>
                  <textarea
                    className={styles.textarea}
                    value={form.synopsis}
                    onChange={(e) => handleChange("synopsis", e.target.value)}
                    placeholder="Describe brevemente la trama principal"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Sinopsis en ingles</label>
                  <textarea
                    className={styles.textarea}
                    value={form.synopsisEn}
                    onChange={(e) => handleChange("synopsisEn", e.target.value)}
                    placeholder="Brief synopsis in English"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Log line</label>
                  <textarea
                    className={styles.textarea}
                    value={form.logLine}
                    onChange={(e) => handleChange("logLine", e.target.value)}
                    placeholder="Frase que resuma el gancho"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Log line en ingles</label>
                  <textarea
                    className={styles.textarea}
                    value={form.logLineEn}
                    onChange={(e) => handleChange("logLineEn", e.target.value)}
                    placeholder="English log line"
                  />
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Clasificacion y estado</h2>
                <p className={styles.sectionDescription}>
                  Define el avance del proyecto y la restriccion de publico.
                </p>
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Clasificacion *</label>
                  <select
                    className={styles.select}
                    value={form.classification}
                    onChange={(e) =>
                      handleChange("classification", e.target.value)
                    }
                  >
                    {CLASSIFICATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Estado del proyecto *</label>
                  <select
                    className={styles.select}
                    value={form.projectStatus}
                    onChange={(e) =>
                      handleChange("projectStatus", e.target.value)
                    }
                  >
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className={styles.actions}>
              {errors && <div className={styles.errorBanner}>{errors}</div>}
              {success && <div className={styles.badge}>{success}</div>}
              <div className={styles.actionButtons}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin")}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Guardar y continuar
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
