"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useAuth } from "@/features/auth/hooks"
import { movieService } from "@/features/movies"
import {
  useCinematicRoles,
  useCountries,
  useCities,
  useLanguages,
  useSubGenres,
} from "@/features/catalog"
import { useProfessionals } from "@/features/professionals"
import { useCompanies } from "@/features/companies"
import { useFunds } from "@/features/funds"
import { useExhibitionSpaces } from "@/features/exhibition-spaces"
import { usePlatforms } from "@/features/platforms"
import {
  CreateMoviePayload,
  ExhibitionWindow,
  MovieReleaseType,
  FestivalNominationResult,
  ContactPosition,
  MovieClassification,
  MovieGenre,
  MovieType,
  ProjectStatus,
} from "@/features/movies/types"
import { ecuadorProvinces } from "@/shared/data/ecuador-locations"
import { Navbar } from "@/shared/components/Navbar"
import {
  Button,
  Card,
  Checkbox,
  DocumentUpload,
  ImageUpload,
  Input,
  LinkInput,
  MultiImageUpload,
  Select,
  Textarea,
} from "@/shared/components/ui"
import { AssetOwnerEnum, AssetTypeEnum, UserRole } from "@/shared/types"
import styles from "./movies.module.css"

interface FormValues {
  title: string
  titleEn: string
  durationMinutes: number | ""
  type: MovieType
  genre: MovieGenre
  subGenres: number[]
  languages: number[]
  countryId: number | ""
  releaseYear: number | ""
  synopsis: string
  synopsisEn: string
  logLine: string
  logLineEn: string
  projectNeed: string
  projectNeedEn: string
  directors: number[]
  producers: number[]
  mainActors: number[]
  crew: Array<{ roleId: number | ""; professionalId: number | "" }>
  producerCompanyId: number | ""
  coProducerCompanyIds: number[]
  internationalCoProductions: Array<{
    companyName: string
    countryId: number | ""
  }>
  totalBudget: number | ""
  economicRecovery: number | ""
  totalAudience: number | ""
  crewTotal: number | ""
  actorsTotal: number | ""
  funding: Array<{
    fundId: number | ""
    year: number | ""
    amountGranted: number | ""
    fundingStage: ProjectStatus | ""
  }>
  nationalRelease: {
    exhibitionSpaceId: number | ""
    cityId: number | ""
    year: number | ""
    type: MovieReleaseType | ""
  }
  internationalRelease: {
    spaceName: string
    countryId: number | ""
    year: number | ""
    type: MovieReleaseType | ""
  }
  festivalNominations: Array<{
    fundId: number | ""
    year: number | ""
    category: string
    result: FestivalNominationResult | ""
  }>
  platforms: Array<{
    platformId: number | ""
    link: string
  }>
  contacts: Array<{
    name: string
    role: ContactPosition | ""
    phone: string
    email: string
  }>
  contentBank: Array<{
    exhibitionWindow: ExhibitionWindow | ""
    licensingStartDate: string
    licensingEndDate: string
    geolocationRestrictionCountryIds: number[]
  }>
  posterAssetId: number | null
  trailerLink: string
  makingOffLink: string
  dossierAssetId: number | null
  dossierEnAssetId: number | null
  pedagogicalGuideAssetId: number | null
  stillAssetIds: number[]
  filmingCitiesEc: string[]
  filmingCountries: string[]
  classification: MovieClassification
  projectStatus: ProjectStatus
}

const GENRE_OPTIONS = [
  { value: "Ficción", label: "Ficción" },
  { value: "Documental", label: "Documental" },
  { value: "Docu-ficción", label: "Docu-ficción" },
  { value: "Falso Documental", label: "Falso Documental" },
]

const CLASSIFICATION_OPTIONS: { label: string; value: MovieClassification }[] =
  [
    { value: "todo_publico", label: "Todo público" },
    { value: "recomendado_0_6", label: "Recomendado 0 a 6" },
    { value: "recomendado_6_12", label: "Recomendado 6 a 12" },
    {
      value: "menores_12_supervision",
      label: "Menores de 12 con supervisión",
    },
    { value: "mayores_12", label: "Público mayor de 12" },
    { value: "mayores_15", label: "Público mayor de 15" },
    { value: "solo_mayores_18", label: "Solo mayores de 18" },
  ]

const PROJECT_STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { value: "desarrollo", label: "Desarrollo" },
  { value: "produccion", label: "Producción" },
  { value: "postproduccion", label: "Postproducción" },
  { value: "distribucion", label: "Distribución" },
  { value: "finalizado", label: "Finalizado" },
]

const FUNDING_STAGE_OPTIONS = PROJECT_STATUS_OPTIONS.filter((option) =>
  ["desarrollo", "produccion", "postproduccion"].includes(option.value),
)

const RELEASE_TYPE_OPTIONS: { label: string; value: MovieReleaseType }[] = [
  { value: "Comercial", label: "Comercial" },
  { value: "Festival o muestra", label: "Festival o muestra" },
  { value: "Alternativo o itinerante", label: "Alternativo o itinerante" },
]

const FESTIVAL_RESULT_OPTIONS: {
  label: string
  value: FestivalNominationResult
}[] = [
  { value: "Ganador", label: "Ganador" },
  { value: "Nominado", label: "Nominado" },
  { value: "Selección oficial", label: "Selección oficial" },
]

const CONTACT_POSITION_OPTIONS: { label: string; value: ContactPosition }[] = [
  { value: "Director/a", label: "Director/a" },
  { value: "Productor/a", label: "Productor/a" },
  { value: "Agente de ventas", label: "Agente de ventas" },
  { value: "Distribuidor/a", label: "Distribuidor/a" },
]

const EXHIBITION_WINDOW_OPTIONS: { label: string; value: ExhibitionWindow }[] =
  [
    { value: "Nacional", label: "Nacional" },
    { value: "Internacional", label: "Internacional" },
    { value: "VOD", label: "VOD" },
  ]

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(255, "El título no puede exceder 255 caracteres"),
  titleEn: Yup.string().max(255, "El título no puede exceder 255 caracteres"),
  durationMinutes: Yup.number()
    .required("La duración es obligatoria")
    .positive("La duración debe ser mayor a 0")
    .integer("La duración debe ser un número entero"),
  type: Yup.string().required("El tipo de película es obligatorio"),
  genre: Yup.string().required("El género es obligatorio"),
  subGenres: Yup.array()
    .min(1, "Selecciona al menos un subgénero")
    .required("Selecciona al menos un subgénero"),
  languages: Yup.array()
    .min(1, "Selecciona al menos un subtítulo")
    .required("Selecciona al menos un subtítulo"),
  countryId: Yup.number().required("Selecciona un país de origen"),
  
  releaseYear: Yup.number()
    .required("El año de estreno es obligatorio")
    .min(1888, "Ingresa un año válido (mínimo 1888)")
    .max(
      new Date().getFullYear() + 5,
      "El año no puede estar más allá del futuro cercano",
    ),
  synopsis: Yup.string()
    .required("La sinopsis es obligatoria")
    .min(10, "La sinopsis debe tener al menos 10 caracteres"),
  synopsisEn: Yup.string(),
  logLine: Yup.string(),
  logLineEn: Yup.string(),
  projectNeed: Yup.string(),
  projectNeedEn: Yup.string(),
  directors: Yup.array()
    .min(1, "Selecciona al menos un director")
    .required("Selecciona al menos un director"),
  producers: Yup.array()
    .min(1, "Selecciona al menos un productor")
    .required("Selecciona al menos un productor"),
  mainActors: Yup.array(),
  crew: Yup.array(),
  producerCompanyId: Yup.number().required("Selecciona un productor"),
  coProducerCompanyIds: Yup.array(),
  internationalCoProductions: Yup.array(),
  totalBudget: Yup.number(),
  economicRecovery: Yup.number(),
  totalAudience: Yup.number(),
  crewTotal: Yup.number().min(0, "El total no puede ser negativo"),
  actorsTotal: Yup.number().min(0, "El total no puede ser negativo"),
  funding: Yup.array(),
  nationalRelease: Yup.object(),
  internationalRelease: Yup.object(),
  festivalNominations: Yup.array(),
  platforms: Yup.array(),
  contacts: Yup.array(),
  contentBank: Yup.array(),
  filmingCitiesEc: Yup.array(),
  filmingCountries: Yup.array(),
  classification: Yup.string(),
  projectStatus: Yup.string().required("El estado del proyecto es obligatorio"),
})

const initialValues: FormValues = {
  title: "",
  titleEn: "",
  durationMinutes: "",
  type: "Cortometraje",
  genre: "Ficción",
  subGenres: [],
  languages: [],
  countryId: "",
  releaseYear: "",
  synopsis: "",
  synopsisEn: "",
  logLine: "",
  logLineEn: "",
  projectNeed: "",
  projectNeedEn: "",
  directors: [],
  producers: [],
  mainActors: [],
  crew: [],
  producerCompanyId: "",
  coProducerCompanyIds: [],
  internationalCoProductions: [],
  totalBudget: "",
  economicRecovery: "",
  totalAudience: "",
  crewTotal: "",
  actorsTotal: "",
  funding: [],
  nationalRelease: {
    exhibitionSpaceId: "",
    cityId: "",
    year: "",
    type: "",
  },
  internationalRelease: {
    spaceName: "",
    countryId: "",
    year: "",
    type: "",
  },
  festivalNominations: [],
  platforms: [],
  contacts: [
    {
      name: "",
      role: "",
      phone: "",
      email: "",
    },
  ],
  contentBank: [
    {
      exhibitionWindow: "",
      licensingStartDate: "",
      licensingEndDate: "",
      geolocationRestrictionCountryIds: [],
    },
  ],
  posterAssetId: null,
  trailerLink: "",
  makingOffLink: "",
  dossierAssetId: null,
  dossierEnAssetId: null,
  pedagogicalGuideAssetId: null,
  stillAssetIds: [],
  filmingCitiesEc: [],
  filmingCountries: [],
  classification: "todo_publico",
  projectStatus: "desarrollo",
}

export default function MoviesAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { countries, isLoading: countriesLoading } = useCountries()
  const { cities } = useCities()
  const { languages } = useLanguages()
  const { subGenres } = useSubGenres()
  const { roles } = useCinematicRoles()
  const { professionals } = useProfessionals()
  const { companies } = useCompanies()
  const { funds } = useFunds()
  const { spaces } = useExhibitionSpaces()
  const { platforms } = usePlatforms()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [producerCompanySearch, setProducerCompanySearch] = useState("")
  const [coProducerCompanySearch, setCoProducerCompanySearch] = useState("")
  const [directorSearch, setDirectorSearch] = useState("")
  const [producerSearch, setProducerSearch] = useState("")
  const [crewSearches, setCrewSearches] = useState<string[]>([])
  const [actorSearch, setActorSearch] = useState("")
  const [languageSearch, setLanguageSearch] = useState("")
  const [fundingSearches, setFundingSearches] = useState<string[]>([])
  const [nationalReleaseSpaceSearch, setNationalReleaseSpaceSearch] =
    useState("")
  const [festivalFundSearches, setFestivalFundSearches] = useState<string[]>([])
  const [filmingCitySearch, setFilmingCitySearch] = useState("")
  const [filmingCountrySearch, setFilmingCountrySearch] = useState("")
  const [openGeoblockIndex, setOpenGeoblockIndex] = useState<number | null>(
    null,
  )

  const tabs = [
    { id: "basic", label: "Información básica" },
    { id: "media", label: "Imagenes y Links" },
    { id: "team", label: "Equipo y Actores" },
    { id: "economic", label: "Datos económicos" },
    { id: "distribution", label: "Circulación y Distribución" },
    { id: "promotion", label: "Promoción internacional" },
    { id: "content-bank", label: "Banco de Contenidos ICCA" },
  ]

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && user.role !== UserRole.ADMIN) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, user, router])

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const crewAssignments = values.crew
          .filter((item) => item.roleId && item.professionalId)
          .map((item) => ({
            cinematicRoleId: Number(item.roleId),
            professionalId: Number(item.professionalId),
          }))

        const payload: CreateMoviePayload = {
          title: values.title.trim(),
          titleEn: values.titleEn.trim() || undefined,
          durationMinutes: Number(values.durationMinutes),
          type: values.type,
          genre: values.genre,
          subGenreIds: values.subGenres,
          subtitleLanguageIds: values.languages,
          countryId: Number(values.countryId),
          releaseYear: Number(values.releaseYear),
          synopsis: values.synopsis.trim(),
          synopsisEn: values.synopsisEn.trim() || undefined,
          logLine: values.logLine.trim() || undefined,
          logLineEn: values.logLineEn.trim() || undefined,
          projectNeed: values.projectNeed.trim() || undefined,
          projectNeedEn: values.projectNeedEn.trim() || undefined,
          directors: values.directors,
          producers: values.producers,
          mainActors: values.mainActors,
          crew: crewAssignments.length > 0 ? crewAssignments : undefined,
          producerCompanyId:
            values.producerCompanyId === ""
              ? undefined
              : Number(values.producerCompanyId),
          coProducerCompanyIds: values.coProducerCompanyIds,
          internationalCoproductions:
            values.internationalCoProductions
              .filter(
                (entry) => entry.companyName.trim() && entry.countryId,
              )
              .map((entry) => ({
                companyName: entry.companyName.trim(),
                countryId: Number(entry.countryId),
              })) || undefined,
          totalBudget:
            values.totalBudget === ""
              ? undefined
              : Number(values.totalBudget),
          economicRecovery:
            values.economicRecovery === ""
              ? undefined
              : Number(values.economicRecovery),
          totalAudience:
            values.totalAudience === ""
              ? undefined
              : Number(values.totalAudience),
          crewTotal:
            values.crewTotal === "" ? undefined : Number(values.crewTotal),
          actorsTotal:
            values.actorsTotal === "" ? undefined : Number(values.actorsTotal),
          funding:
            values.funding
              .filter(
                (entry) =>
                  entry.fundId && entry.year && entry.fundingStage,
              )
              .map((entry) => ({
                fundId: Number(entry.fundId),
                year: Number(entry.year),
                amountGranted:
                  entry.amountGranted === ""
                    ? undefined
                    : Number(entry.amountGranted),
                fundingStage: entry.fundingStage as ProjectStatus,
              })) || undefined,
          nationalReleases:
            values.nationalRelease.exhibitionSpaceId &&
            values.nationalRelease.cityId &&
            values.nationalRelease.year &&
            values.nationalRelease.type
              ? [
                  {
                    exhibitionSpaceId: Number(
                      values.nationalRelease.exhibitionSpaceId,
                    ),
                    cityId: Number(values.nationalRelease.cityId),
                    year: Number(values.nationalRelease.year),
                    type: values.nationalRelease.type as MovieReleaseType,
                  },
                ]
              : undefined,
          internationalReleases:
            values.internationalRelease.countryId &&
            values.internationalRelease.year &&
            values.internationalRelease.type
              ? [
                  {
                    spaceName:
                      values.internationalRelease.spaceName.trim() || undefined,
                    countryId: Number(values.internationalRelease.countryId),
                    year: Number(values.internationalRelease.year),
                    type: values.internationalRelease.type as MovieReleaseType,
                  },
                ]
              : undefined,
          festivalNominations:
            values.festivalNominations
              .filter(
                (entry) =>
                  entry.fundId && entry.year && entry.category && entry.result,
              )
              .map((entry) => ({
                fundId: Number(entry.fundId),
                year: Number(entry.year),
                category: entry.category.trim(),
                result: entry.result as FestivalNominationResult,
              })) || undefined,
          platforms:
            values.platforms
              .filter((entry) => entry.platformId)
              .map((entry) => ({
                platformId: Number(entry.platformId),
                link: entry.link.trim() || undefined,
              })) || undefined,
          contacts:
            values.contacts
              .filter((entry) => entry.name.trim() && entry.role)
              .map((entry) => ({
                name: entry.name.trim(),
                role: entry.role as ContactPosition,
                phone: entry.phone.trim() || undefined,
                email: entry.email.trim() || undefined,
              })) || undefined,
          contentBank:
            values.contentBank
              .filter(
                (entry) =>
                  entry.exhibitionWindow &&
                  entry.licensingStartDate &&
                  entry.licensingEndDate,
              )
              .map((entry) => ({
                exhibitionWindow: entry.exhibitionWindow as ExhibitionWindow,
                licensingStartDate: entry.licensingStartDate,
                licensingEndDate: entry.licensingEndDate,
                geolocationRestrictionCountryIds:
                  entry.geolocationRestrictionCountryIds.length > 0
                    ? entry.geolocationRestrictionCountryIds
                    : undefined,
              })) || undefined,
          posterAssetId: values.posterAssetId ?? undefined,
          dossierAssetId: values.dossierAssetId ?? undefined,
          dossierEnAssetId: values.dossierEnAssetId ?? undefined,
          pedagogicalGuideAssetId: values.pedagogicalGuideAssetId ?? undefined,
          trailerLink: values.trailerLink.trim() || undefined,
          makingOfLink: values.makingOffLink.trim() || undefined,
          stillAssetIds:
            values.stillAssetIds.length > 0
              ? values.stillAssetIds
              : undefined,
          filmingCitiesEc: values.filmingCitiesEc,
          filmingCountries: values.filmingCountries,
          classification: values.classification,
          projectStatus: values.projectStatus,
        }

        await movieService.create(payload)
        formik.resetForm()
      } catch (error) {
        const message =
          (error as { message?: string })?.message ||
          "No se pudo guardar la película"
        formik.setStatus({ error: message })
      }
    },
  })

  const sortedCountries = useMemo(
    () => countries.sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  )

  const sortedLanguages = useMemo(
    () => languages.sort((a, b) => a.name.localeCompare(b.name)),
    [languages],
  )

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  )

  const filteredLanguages = useMemo(() => {
    const query = languageSearch.trim().toLowerCase()
    if (!query) return sortedLanguages
    return sortedLanguages.filter((lang) => {
      const label = `${lang.name} ${lang.code}`.toLowerCase()
      return label.includes(query)
    })
  }, [languageSearch, sortedLanguages])

  const sortedProfessionals = useMemo(
    () =>
      [...professionals].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
        ),
      ),
    [professionals],
  )

  const filteredDirectors = useMemo(() => {
    const query = directorSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) => {
      const label = `${professional.firstName} ${professional.lastName}`.toLowerCase()
      return label.includes(query)
    })
  }, [directorSearch, sortedProfessionals])

  const filteredProducers = useMemo(() => {
    const query = producerSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) => {
      const label = `${professional.firstName} ${professional.lastName}`.toLowerCase()
      return label.includes(query)
    })
  }, [producerSearch, sortedProfessionals])

  const filteredActors = useMemo(() => {
    const query = actorSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) =>
      `${professional.firstName} ${professional.lastName}`.toLowerCase().includes(query),
    )
  }, [actorSearch, sortedProfessionals])

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  )

  const sortedCompanies = useMemo(
    () =>
      [...companies].sort((a, b) =>
        `${a.commercialName ?? a.legalName ?? a.ruc}`.localeCompare(
          `${b.commercialName ?? b.legalName ?? b.ruc}`,
        ),
      ),
    [companies],
  )

  const sortedExhibitionSpaces = useMemo(
    () => [...spaces].sort((a, b) => a.name.localeCompare(b.name)),
    [spaces],
  )

  const sortedPlatforms = useMemo(
    () => [...platforms].sort((a, b) => a.name.localeCompare(b.name)),
    [platforms],
  )

  const sortedFunds = useMemo(
    () => [...funds].sort((a, b) => a.name.localeCompare(b.name)),
    [funds],
  )

  const producerCompaniesFiltered = useMemo(() => {
    const query = producerCompanySearch.trim().toLowerCase()
    if (!query) return sortedCompanies
    return sortedCompanies.filter((company) => {
      const label = `${company.commercialName ?? ""} ${
        company.legalName ?? ""
      } ${company.ruc}`.toLowerCase()
      return label.includes(query)
    })
  }, [producerCompanySearch, sortedCompanies])

  const coProducerCompaniesFiltered = useMemo(() => {
    const query = coProducerCompanySearch.trim().toLowerCase()
    if (!query) return sortedCompanies
    return sortedCompanies.filter((company) => {
      const label = `${company.commercialName ?? ""} ${
        company.legalName ?? ""
      } ${company.ruc}`.toLowerCase()
      return label.includes(query)
    })
  }, [coProducerCompanySearch, sortedCompanies])

  const getFundingOptions = (searchValue: string) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sortedFunds
    return sortedFunds.filter((fund) => {
      const label = `${fund.name} ${fund.country?.name ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }

  const getExhibitionSpaceOptions = (searchValue: string) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sortedExhibitionSpaces
    return sortedExhibitionSpaces.filter((space) => {
      const label = `${space.name} ${space.country?.name ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }

  const allEcuadorCities = useMemo(() => {
    const cities = ecuadorProvinces.flatMap((province) => province.cities)
    return Array.from(new Set(cities)).sort()
  }, [])

  const filteredFilmingCitiesEc = useMemo(() => {
    const query = filmingCitySearch.trim().toLowerCase()
    if (!query) return allEcuadorCities
    return allEcuadorCities.filter((city) =>
      city.toLowerCase().includes(query),
    )
  }, [filmingCitySearch, allEcuadorCities])

  const filteredFilmingCountries = useMemo(() => {
    const query = filmingCountrySearch.trim().toLowerCase()
    if (!query) return sortedCountries
    return sortedCountries.filter((country) =>
      country.name.toLowerCase().includes(query),
    )
  }, [filmingCountrySearch, sortedCountries])

  const handleCheckboxToggle = (
    arrayName:
      | "subGenres"
      | "languages"
      | "directors"
      | "producers"
      | "coProducerCompanyIds"
      | "mainActors"
      | "filmingCitiesEc"
      | "filmingCountries",
    value: string | number,
  ) => {
    const currentArray = formik.values[arrayName] as (string | number)[]
    const exists = currentArray.includes(value)
    const newArray = exists
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]

    formik.setFieldValue(arrayName, newArray)
  }

  const addCrewRow = () => {
    formik.setFieldValue("crew", [
      ...formik.values.crew,
      { roleId: "", professionalId: "" },
    ])
    setCrewSearches((prev) => [...prev, ""])
  }

  const updateCrewRow = (
    index: number,
    field: "roleId" | "professionalId",
    value: number | "",
  ) => {
    const next = [...formik.values.crew]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("crew", next)
  }

  const removeCrewRow = (index: number) => {
    const next = formik.values.crew.filter((_, i) => i !== index)
    formik.setFieldValue("crew", next)
    setCrewSearches((prev) => prev.filter((_, i) => i !== index))
  }

  const addActor = (id: number) => {
    if (formik.values.mainActors.includes(id)) return
    formik.setFieldValue("mainActors", [...formik.values.mainActors, id])
  }

  const removeActor = (id: number) => {
    formik.setFieldValue(
      "mainActors",
      formik.values.mainActors.filter((actorId) => actorId !== id),
    )
  }

  const addFundingRow = () => {
    formik.setFieldValue("funding", [
      ...formik.values.funding,
      { fundId: "", year: "", amountGranted: "", fundingStage: "" },
    ])
    setFundingSearches((prev) => [...prev, ""])
  }

  const updateFundingRow = (
    index: number,
    field: "fundId" | "year" | "amountGranted" | "fundingStage",
    value: number | ProjectStatus | "",
  ) => {
    const next = [...formik.values.funding]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("funding", next)
  }

  const removeFundingRow = (index: number) => {
    const next = formik.values.funding.filter((_, i) => i !== index)
    formik.setFieldValue("funding", next)
    setFundingSearches((prev) => prev.filter((_, i) => i !== index))
  }

  const updateNationalRelease = (
    field: "exhibitionSpaceId" | "cityId" | "year" | "type",
    value: number | MovieReleaseType | "",
  ) => {
    formik.setFieldValue("nationalRelease", {
      ...formik.values.nationalRelease,
      [field]: value,
    })
  }

  const updateInternationalRelease = (
    field: "spaceName" | "countryId" | "year" | "type",
    value: string | number | MovieReleaseType | "",
  ) => {
    formik.setFieldValue("internationalRelease", {
      ...formik.values.internationalRelease,
      [field]: value,
    })
  }

  const addFestivalNominationRow = () => {
    formik.setFieldValue("festivalNominations", [
      ...formik.values.festivalNominations,
      { fundId: "", year: "", category: "", result: "" },
    ])
    setFestivalFundSearches((prev) => [...prev, ""])
  }

  const updateFestivalNominationRow = (
    index: number,
    field: "fundId" | "year" | "category" | "result",
    value: number | string | FestivalNominationResult | "",
  ) => {
    const next = [...formik.values.festivalNominations]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("festivalNominations", next)
  }

  const removeFestivalNominationRow = (index: number) => {
    const next = formik.values.festivalNominations.filter((_, i) => i !== index)
    formik.setFieldValue("festivalNominations", next)
    setFestivalFundSearches((prev) => prev.filter((_, i) => i !== index))
  }

  const addPlatformRow = () => {
    formik.setFieldValue("platforms", [
      ...formik.values.platforms,
      { platformId: "", link: "" },
    ])
  }

  const addContactRow = () => {
    formik.setFieldValue("contacts", [
      ...formik.values.contacts,
      { name: "", role: "", phone: "", email: "" },
    ])
  }

  const updateContactRow = (
    index: number,
    field: "name" | "role" | "phone" | "email",
    value: string,
  ) => {
    const next = [...formik.values.contacts]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("contacts", next)
  }

  const removeContactRow = (index: number) => {
    const next = formik.values.contacts.filter((_, i) => i !== index)
    formik.setFieldValue("contacts", next)
  }

  const updatePlatformRow = (
    index: number,
    field: "platformId" | "link",
    value: number | string | "",
  ) => {
    const next = [...formik.values.platforms]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("platforms", next)
  }

  const removePlatformRow = (index: number) => {
    const next = formik.values.platforms.filter((_, i) => i !== index)
    formik.setFieldValue("platforms", next)
  }

  const addInternationalCoproductionRow = () => {
    formik.setFieldValue("internationalCoProductions", [
      ...formik.values.internationalCoProductions,
      { companyName: "", countryId: "" },
    ])
  }

  const updateInternationalCoproductionRow = (
    index: number,
    field: "companyName" | "countryId",
    value: string | number | "",
  ) => {
    const next = [...formik.values.internationalCoProductions]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("internationalCoProductions", next)
  }

  const removeInternationalCoproductionRow = (index: number) => {
    const next = formik.values.internationalCoProductions.filter(
      (_, i) => i !== index,
    )
    formik.setFieldValue("internationalCoProductions", next)
  }

  const handlePosterUpload = (id: number) => {
    formik.setFieldValue("posterAssetId", id)
  }

  const handlePosterRemove = () => {
    formik.setFieldValue("posterAssetId", null)
  }

  const handleDossierUpload = (id: number) => {
    formik.setFieldValue("dossierAssetId", id)
  }

  const handleDossierRemove = () => {
    formik.setFieldValue("dossierAssetId", null)
  }

  const handleDossierEnUpload = (id: number) => {
    formik.setFieldValue("dossierEnAssetId", id)
  }

  const handleDossierEnRemove = () => {
    formik.setFieldValue("dossierEnAssetId", null)
  }

  const handleGuideUpload = (id: number) => {
    formik.setFieldValue("pedagogicalGuideAssetId", id)
  }

  const handleGuideRemove = () => {
    formik.setFieldValue("pedagogicalGuideAssetId", null)
  }

  const addContentBankRow = () => {
    formik.setFieldValue("contentBank", [
      ...formik.values.contentBank,
      {
        exhibitionWindow: "",
        licensingStartDate: "",
        licensingEndDate: "",
        geolocationRestrictionCountryIds: [],
      },
    ])
  }

  const updateContentBankRow = (
    index: number,
    field: "exhibitionWindow" | "licensingStartDate" | "licensingEndDate",
    value: string,
  ) => {
    const next = [...formik.values.contentBank]
    next[index] = { ...next[index], [field]: value }
    formik.setFieldValue("contentBank", next)
  }

  const removeContentBankRow = (index: number) => {
    const next = formik.values.contentBank.filter((_, i) => i !== index)
    formik.setFieldValue("contentBank", next)
  }

  const getFieldError = (fieldName: keyof FormValues): string | undefined => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? String(formik.errors[fieldName])
      : undefined
  }

  const getProfessionalLabel = (professional: {
    firstName: string
    lastName: string
  }) => `${professional.firstName} ${professional.lastName}`

  const getCrewProfessionals = (searchValue: string) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) =>
      getProfessionalLabel(professional).toLowerCase().includes(query),
    )
  }

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

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de películas</h1>
            <p className={styles.subtitle}>
              Completa los datos base de la película (etapa 1)
            </p>
          </div>
          <span className={styles.badge}>Formulario inicial</span>
        </div>

        <Card className={styles.card}>
          <form className={styles.form} onSubmit={formik.handleSubmit}>
            <div className={styles.tabs}>
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabButton} ${
                    activeTab === index ? styles.tabButtonActive : ""
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 4 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Circulación y Distribución
                  </h2>
                  <p className={styles.sectionDescription}>
                    Información sobre la circulación y distribución del
                    proyecto.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Estreno nacional</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <div className={styles.field}>
                        <Input
                          label="Buscar espacio"
                          name="national-release-space-search"
                          value={nationalReleaseSpaceSearch}
                          onChange={(event) =>
                            setNationalReleaseSpaceSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre"
                        />
                        <div className={styles.optionGrid}>
                          {getExhibitionSpaceOptions(
                            nationalReleaseSpaceSearch,
                          ).map((space) => (
                            <Checkbox
                              key={`national-space-${space.id}`}
                              label={
                                space.country?.name
                                  ? `${space.name} (${space.country.name})`
                                  : space.name
                              }
                              variant="pill"
                              checked={
                                formik.values.nationalRelease
                                  .exhibitionSpaceId === space.id
                              }
                              onChange={() =>
                                updateNationalRelease(
                                  "exhibitionSpaceId",
                                  space.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <Select
                        label="Ciudad"
                        name="national-release-city"
                        value={formik.values.nationalRelease.cityId}
                        onChange={(event) =>
                          updateNationalRelease(
                            "cityId",
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                      >
                        <option value="">Selecciona una ciudad</option>
                        {sortedCities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Año"
                        name="national-release-year"
                        type="number"
                        min={1900}
                        value={formik.values.nationalRelease.year}
                        onChange={(event) =>
                          updateNationalRelease(
                            "year",
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                        placeholder="Ej: 2023"
                      />

                      <Select
                        label="Tipo"
                        name="national-release-type"
                        value={formik.values.nationalRelease.type}
                        onChange={(event) =>
                          updateNationalRelease(
                            "type",
                            event.target.value as MovieReleaseType,
                          )
                        }
                      >
                        <option value="">Selecciona un tipo</option>
                        {RELEASE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Estreno internacional</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <Input
                        label="Nombre del espacio"
                        name="international-release-space"
                        value={formik.values.internationalRelease.spaceName}
                        onChange={(event) =>
                          updateInternationalRelease(
                            "spaceName",
                            event.target.value,
                          )
                        }
                        placeholder="Nombre del espacio"
                      />

                      <Select
                        label="País"
                        name="international-release-country"
                        value={formik.values.internationalRelease.countryId}
                        onChange={(event) =>
                          updateInternationalRelease(
                            "countryId",
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                      >
                        <option value="">Selecciona un país</option>
                        {sortedCountries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.name}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Año"
                        name="international-release-year"
                        type="number"
                        min={1900}
                        value={formik.values.internationalRelease.year}
                        onChange={(event) =>
                          updateInternationalRelease(
                            "year",
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                        placeholder="Ej: 2024"
                      />

                      <Select
                        label="Tipo"
                        name="international-release-type"
                        value={formik.values.internationalRelease.type}
                        onChange={(event) =>
                          updateInternationalRelease(
                            "type",
                            event.target.value as MovieReleaseType,
                          )
                        }
                      >
                        <option value="">Selecciona un tipo</option>
                        {RELEASE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Festivales y nominaciones</div>
                  <div className={styles.crewList}>
                    {formik.values.festivalNominations.map((entry, index) => (
                      <div
                        key={`festival-nomination-${index}`}
                        className={styles.crewRow}
                      >
                        <div className={styles.field}>
                          <Input
                            label="Buscar espacio"
                            name={`festival-fund-search-${index}`}
                            value={festivalFundSearches[index] ?? ""}
                            onChange={(event) =>
                              setFestivalFundSearches((prev) => {
                                const next = [...prev]
                                next[index] = event.target.value
                                return next
                              })
                            }
                            placeholder="Buscar por nombre"
                          />
                          <div className={styles.optionGrid}>
                            {getFundingOptions(
                              festivalFundSearches[index] ?? "",
                            ).map((fund) => (
                              <Checkbox
                                key={`festival-fund-${index}-${fund.id}`}
                                label={
                                  fund.country?.name
                                    ? `${fund.name} (${fund.country.name})`
                                    : fund.name
                                }
                                variant="pill"
                                checked={entry.fundId === fund.id}
                                onChange={() =>
                                  updateFestivalNominationRow(
                                    index,
                                    "fundId",
                                    fund.id,
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <Input
                          label="Año"
                          name={`festival-year-${index}`}
                          type="number"
                          min={1900}
                          value={entry.year}
                          onChange={(event) =>
                            updateFestivalNominationRow(
                              index,
                              "year",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                          placeholder="Ej: 2022"
                        />

                        <Input
                          label="Categoría"
                          name={`festival-category-${index}`}
                          value={entry.category}
                          onChange={(event) =>
                            updateFestivalNominationRow(
                              index,
                              "category",
                              event.target.value,
                            )
                          }
                          placeholder="Ej: Mejor película"
                        />

                        <Select
                          label="Resultado"
                          name={`festival-result-${index}`}
                          value={entry.result}
                          onChange={(event) =>
                            updateFestivalNominationRow(
                              index,
                              "result",
                              event.target.value as FestivalNominationResult,
                            )
                          }
                        >
                          <option value="">Selecciona un resultado</option>
                          {FESTIVAL_RESULT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeFestivalNominationRow(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addFestivalNominationRow}
                  >
                    Agregar festival o nominación
                  </Button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Plataformas</div>
                  <div className={styles.crewList}>
                    {formik.values.platforms.map((entry, index) => (
                      <div
                        key={`platform-${index}`}
                        className={styles.crewRow}
                      >
                        <Select
                          label="Plataforma"
                          name={`platform-id-${index}`}
                          value={entry.platformId}
                          onChange={(event) =>
                            updatePlatformRow(
                              index,
                              "platformId",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                        >
                          <option value="">Selecciona una plataforma</option>
                          {sortedPlatforms.map((platform) => (
                            <option key={platform.id} value={platform.id}>
                              {platform.name}
                            </option>
                          ))}
                        </Select>

                        <Input
                          label="Link"
                          name={`platform-link-${index}`}
                          value={entry.link}
                          onChange={(event) =>
                            updatePlatformRow(
                              index,
                              "link",
                              event.target.value,
                            )
                          }
                          placeholder="https://"
                        />

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removePlatformRow(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addPlatformRow}
                  >
                    Agregar plataforma
                  </Button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Contacto</div>
                  <div className={styles.crewList}>
                    {formik.values.contacts.map((entry, index) => (
                      <div
                        key={`contact-${index}`}
                        className={styles.crewRow}
                      >
                        <Input
                          label="Nombre y apellido"
                          name={`contact-name-${index}`}
                          value={entry.name}
                          onChange={(event) =>
                            updateContactRow(
                              index,
                              "name",
                              event.target.value,
                            )
                          }
                          placeholder="Nombre del contacto"
                        />

                        <Select
                          label="Cargo"
                          name={`contact-role-${index}`}
                          value={entry.role}
                          onChange={(event) =>
                            updateContactRow(
                              index,
                              "role",
                              event.target.value,
                            )
                          }
                        >
                          <option value="">Selecciona un cargo</option>
                          {CONTACT_POSITION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>

                        <Input
                          label="Teléfono"
                          name={`contact-phone-${index}`}
                          value={entry.phone}
                          onChange={(event) =>
                            updateContactRow(
                              index,
                              "phone",
                              event.target.value,
                            )
                          }
                          placeholder="Ej: +593 99 123 4567"
                        />

                        <Input
                          label="Email"
                          name={`contact-email-${index}`}
                          type="email"
                          value={entry.email}
                          onChange={(event) =>
                            updateContactRow(
                              index,
                              "email",
                              event.target.value,
                            )
                          }
                          placeholder="contacto@ejemplo.com"
                        />

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeContactRow(index)}
                          disabled={formik.values.contacts.length === 1}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addContactRow}
                  >
                    Agregar contacto
                  </Button>
                </div>
              </section>
            )}

            {activeTab === 0 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Información básica</h2>
                  <p className={styles.sectionDescription}>
                    Datos esenciales para registrar la película.
                  </p>
                </div>

                <div className={styles.grid}>
                  <Input
                    label="Título *"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: La frontera invisible"
                    error={getFieldError("title")}
                  />

                  <div className={styles.field}>
                    <Input
                      type="number"
                      label="Duración (minutos) *"
                      name="durationMinutes"
                      min={1}
                      value={formik.values.durationMinutes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Ej: 95"
                      error={getFieldError("durationMinutes")}
                    />
                    <p className={styles.helper}>
                      Tiempo aproximado para proyectos en desarrollo.
                    </p>
                  </div>

                  <Select
                    label="Tipo *"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError("type")}
                  >
                    <option value="Cortometraje">Cortometraje</option>
                    <option value="Mediometraje">Mediometraje</option>
                    <option value="Largometraje">Largometraje</option>
                  </Select>

                  <Input
                    label="Año de estreno"
                    type="number"
                    name="releaseYear"
                    min={1888}
                    value={formik.values.releaseYear}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 2025"
                    error={getFieldError("releaseYear")}
                  />

                  <Select
                    label="País de realización *"
                    name="countryId"
                    value={formik.values.countryId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={countriesLoading}
                    error={getFieldError("countryId")}
                  >
                    <option value="">
                      {countriesLoading
                        ? "Cargando países..."
                        : "Selecciona un país"}
                    </option>
                    {sortedCountries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Género *"
                    name="genre"
                    value={formik.values.genre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError("genre")}
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <div className={styles.field}>
                    <Input
                      label="Empresa productora *"
                      name="companySearch"
                      value={producerCompanySearch}
                      onChange={(event) =>
                        setProducerCompanySearch(event.target.value)
                      }
                      placeholder="Buscar empresa por nombre o RUC"
                      error={getFieldError("producerCompanyId")}
                    />

                    <div className={styles.optionGrid}>
                      {producerCompaniesFiltered.map((company) => (
                        <Checkbox
                          key={`producer-${company.id}`}
                          label={
                            company.commercialName ??
                            company.legalName ??
                            company.ruc
                          }
                          variant="pill"
                          checked={
                            formik.values.producerCompanyId === company.id
                          }
                          onChange={() =>
                            formik.setFieldValue(
                              "producerCompanyId",
                              company.id,
                            )
                          }
                        />
                      ))}
                    </div>
                    {producerCompaniesFiltered.length === 0 && (
                      <p className={styles.helper}>
                        No se encontraron empresas con ese criterio.
                      </p>
                    )}
                    {getFieldError("producerCompanyId") && (
                      <p className={styles.error}>
                        {getFieldError("producerCompanyId")}
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Coproductores nacionales</div>
                  <Input
                    label="Buscar empresa"
                    name="coProducerCompanySearch"
                    value={coProducerCompanySearch}
                    onChange={(event) =>
                      setCoProducerCompanySearch(event.target.value)
                    }
                    placeholder="Buscar por nombre o RUC"
                  />
                  <div className={styles.optionGrid}>
                    {coProducerCompaniesFiltered.map((company) => {
                      const checked =
                        formik.values.coProducerCompanyIds.includes(company.id)
                      return (
                        <Checkbox
                          key={`coproducer-${company.id}`}
                          label={
                            company.commercialName ??
                            company.legalName ??
                            company.ruc
                          }
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle(
                              "coProducerCompanyIds",
                              company.id,
                            )
                          }
                        />
                      )
                    })}
                  </div>
                  <p className={styles.helper}>
                    Selecciona una o varias empresas nacionales.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Coproducción internacional</div>
                  <div className={styles.crewList}>
                    {formik.values.internationalCoProductions.map(
                      (entry, index) => (
                        <div
                          key={`international-coproduction-${index}`}
                          className={styles.crewRow}
                        >
                          <Input
                            label="Nombre de la empresa"
                            name={`international-company-${index}`}
                            value={entry.companyName}
                            onChange={(event) =>
                              updateInternationalCoproductionRow(
                                index,
                                "companyName",
                                event.target.value,
                              )
                            }
                            placeholder="Nombre del coproductor internacional"
                          />

                          <Select
                            label="País"
                            name={`international-country-${index}`}
                            value={entry.countryId}
                            onChange={(event) =>
                              updateInternationalCoproductionRow(
                                index,
                                "countryId",
                                event.target.value
                                  ? Number(event.target.value)
                                  : "",
                              )
                            }
                          >
                            <option value="">Selecciona un país</option>
                            {sortedCountries.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.name}
                              </option>
                            ))}
                          </Select>

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              removeInternationalCoproductionRow(index)
                            }
                          >
                            Quitar
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addInternationalCoproductionRow}
                  >
                    Agregar coproducción internacional
                  </Button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Subgéneros</div>
                  <div className={styles.optionGrid}>
                    {subGenres.map((subGenre) => {
                      const checked = formik.values.subGenres.includes(
                        subGenre.id,
                      )
                      return (
                        <Checkbox
                          key={subGenre.id}
                          label={subGenre.name}
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle("subGenres", subGenre.id)
                          }
                        />
                      )
                    })}
                  </div>
                {getFieldError("subGenres") && (
                  <p className={styles.error}>{getFieldError("subGenres")}</p>
                )}
                  <p className={styles.helper}>
                    Selecciona al menos un subgénero.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Idiomas de la película *</div>
                  <Input
                    label="Buscar idioma"
                    name="languageSearch"
                    value={languageSearch}
                    onChange={(event) =>
                      setLanguageSearch(event.target.value)
                    }
                    placeholder="Buscar por nombre o código"
                  />
                  <div className={styles.optionGrid}>
                    {filteredLanguages.map((lang) => {
                      const checked = formik.values.languages.includes(
                        lang.code,
                      )
                      return (
                        <Checkbox
                          key={lang.code}
                          label={lang.name}
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle("languages", lang.code)
                          }
                        />
                      )
                    })}
                  </div>
                  {getFieldError("languages") && (
                    <p className={styles.error}>{getFieldError("languages")}</p>
                  )}
                  <p className={styles.helper}>
                    Puedes seleccionar varios idiomas.
                  </p>
                </div>

                <div className={styles.grid}>
                  <Textarea
                    label="Sinopsis *"
                    name="synopsis"
                    value={formik.values.synopsis}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Describe brevemente la trama principal"
                    error={getFieldError("synopsis")}
                  />

                  <Textarea
                    label="Logline"
                    name="logLine"
                    value={formik.values.logLine}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Frase que resuma el gancho"
                  />
                </div>

                <div className={styles.grid}>
                  <Select
                    label="Clasificación"
                    name="classification"
                    value={formik.values.classification}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError("classification")}
                  >
                    {CLASSIFICATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Estado del proyecto *"
                    name="projectStatus"
                    value={formik.values.projectStatus}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={getFieldError("projectStatus")}
                  >
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </section>
            )}

            {activeTab === 1 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Imagenes y Links</h2>
                  <p className={styles.sectionDescription}>
                    Material visual y enlaces asociados al proyecto.
                  </p>
                </div>

                <div className={`${styles.grid} ${styles.singleColumn}`}>
                  <div className={styles.field}>
                    <div className={styles.label}>Afiche</div>
                    <ImageUpload
                      documentType={AssetTypeEnum.IMAGE}
                      ownerType={AssetOwnerEnum.MOVIE_POSTER}
                      onUploadComplete={(id: number) => handlePosterUpload(id)}
                      onRemove={handlePosterRemove}
                      label="Subir afiche"
                    />
                  </div>

                  <LinkInput
                    label="Link trailer o teaser"
                    name="trailerLink"
                    value={formik.values.trailerLink}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="https://"
                  />

                  <LinkInput
                    label="Link making off"
                    name="makingOffLink"
                    value={formik.values.makingOffLink}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="https://"
                  />

                  <div className={styles.field}>
                    <DocumentUpload
                      label="Dossier"
                      documentType={AssetTypeEnum.DOCUMENT}
                      ownerType={AssetOwnerEnum.MOVIE_DOSSIER}
                      onUploadComplete={(id: number) => handleDossierUpload(id)}
                      onRemove={handleDossierRemove}
                    />
                  </div>

                  <div className={styles.field}>
                    <DocumentUpload
                      label="Guía pedagógica"
                      documentType={AssetTypeEnum.DOCUMENT}
                      ownerType={AssetOwnerEnum.MOVIE_PEDAGOGICAL_GUIDE}
                      onUploadComplete={(id: number) => handleGuideUpload(id)}
                      onRemove={handleGuideRemove}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Stills (máximo 5)</div>
                  <MultiImageUpload
                    documentType={AssetTypeEnum.IMAGE}
                    ownerType={AssetOwnerEnum.MOVIE_STILLS}
                    maxImages={5}
                    label="Stills"
                    onImagesChange={(ids: number[]) =>
                      formik.setFieldValue("stillAssetIds", ids)
                    }
                  />
                  <p className={styles.helper}>
                    Puedes seleccionar hasta 5 imágenes.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 2 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Equipo y Actores</h2>
                  <p className={styles.sectionDescription}>
                    Selecciona el equipo principal, crew y actores.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Director(es) *</div>
                  <Input
                    label="Buscar director"
                    name="directorSearch"
                    value={directorSearch}
                    onChange={(event) => setDirectorSearch(event.target.value)}
                    placeholder="Buscar por nombre"
                  />
                  <div className={styles.optionGrid}>
                    {filteredDirectors.map((professional) => {
                      const checked = formik.values.directors.includes(
                        professional.id,
                      )
                      return (
                        <Checkbox
                          key={`director-${professional.id}`}
                          label={getProfessionalLabel(professional)}
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle(
                              "directors",
                              professional.id,
                            )
                          }
                        />
                      )
                    })}
                  </div>
                  {getFieldError("directors") && (
                    <p className={styles.error}>{getFieldError("directors")}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Productor(es) *</div>
                  <Input
                    label="Buscar productor"
                    name="producerSearch"
                    value={producerSearch}
                    onChange={(event) => setProducerSearch(event.target.value)}
                    placeholder="Buscar por nombre"
                  />
                  <div className={styles.optionGrid}>
                    {filteredProducers.map((professional) => {
                      const checked = formik.values.producers.includes(
                        professional.id,
                      )
                      return (
                        <Checkbox
                          key={`producer-${professional.id}`}
                          label={getProfessionalLabel(professional)}
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle(
                              "producers",
                              professional.id,
                            )
                          }
                        />
                      )
                    })}
                  </div>
                  {getFieldError("producers") && (
                    <p className={styles.error}>{getFieldError("producers")}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Crew</div>
                  <div className={styles.crewList}>
                    {formik.values.crew.map((item, index) => (
                      <div key={`crew-${index}`} className={styles.crewRow}>
                        <Select
                          label="Rol"
                          name={`crew-role-${index}`}
                          value={item.roleId}
                          onChange={(event) =>
                            updateCrewRow(
                              index,
                              "roleId",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                        >
                          <option value="">Selecciona un rol</option>
                          {sortedRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </Select>

                        <div>
                          <Input
                            label="Buscar profesional"
                            name={`crew-search-${index}`}
                            value={crewSearches[index] ?? ""}
                            onChange={(event) =>
                              setCrewSearches((prev) => {
                                const next = [...prev]
                                next[index] = event.target.value
                                return next
                              })
                            }
                            placeholder="Buscar por nombre"
                          />
                          <div className={styles.optionGrid}>
                            {getCrewProfessionals(
                              crewSearches[index] ?? "",
                            ).map((professional) => (
                              <Checkbox
                                key={`crew-prof-${index}-${professional.id}`}
                                label={getProfessionalLabel(professional)}
                                variant="pill"
                                checked={
                                  item.professionalId === professional.id
                                }
                                onChange={() =>
                                  updateCrewRow(
                                    index,
                                    "professionalId",
                                    professional.id,
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeCrewRow(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="secondary" onClick={addCrewRow}>
                    Agregar rol
                  </Button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Actores principales</div>
                  <Input
                    label="Buscar actor"
                    name="actorSearch"
                    value={actorSearch}
                    onChange={(event) => setActorSearch(event.target.value)}
                    placeholder="Buscar por nombre"
                  />
                  <div className={styles.optionGrid}>
                    {filteredActors.map((professional) => (
                      <Checkbox
                        key={`actor-${professional.id}`}
                        label={getProfessionalLabel(professional)}
                        variant="pill"
                        checked={formik.values.mainActors.includes(
                          professional.id,
                        )}
                        onChange={() => addActor(professional.id)}
                      />
                    ))}
                  </div>
                  {formik.values.mainActors.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.mainActors.map((actorId) => {
                        const actor = sortedProfessionals.find(
                          (p) => p.id === actorId,
                        )
                        if (!actor) return null
                        return (
                          <Button
                            key={`actor-selected-${actorId}`}
                            type="button"
                            variant="secondary"
                            onClick={() => removeActor(actorId)}
                          >
                            Quitar: {getProfessionalLabel(actor)}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className={styles.grid}>
                  <Input
                    label="Total de actores"
                    name="actorsTotal"
                    type="number"
                    min={0}
                    value={formik.values.actorsTotal}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 12"
                    error={getFieldError("actorsTotal")}
                  />

                  <Input
                    label="Total de equipo técnico"
                    name="crewTotal"
                    type="number"
                    min={0}
                    value={formik.values.crewTotal}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 25"
                    error={getFieldError("crewTotal")}
                  />
                </div>
              </section>
            )}

            {activeTab === 3 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Datos económicos</h2>
                  <p className={styles.sectionDescription}>
                    Información financiera del proyecto.
                  </p>
                </div>

                <div className={styles.grid}>
                  <Input
                    label="Presupuesto total"
                    name="totalBudget"
                    type="number"
                    value={formik.values.totalBudget}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 250000"
                  />

                  <Input
                    label="Recuperación económica"
                    name="economicRecovery"
                    type="number"
                    value={formik.values.economicRecovery}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 150000"
                  />

                  <Input
                    label="Total de espectadores"
                    name="totalAudience"
                    type="number"
                    value={formik.values.totalAudience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: 50000"
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Financiamiento</div>
                  <p className={styles.helper}>
                    Agrega las fuentes de financiamiento del proyecto.
                  </p>
                  <div className={styles.crewList}>
                    {formik.values.funding.map((entry, index) => (
                      <div key={`funding-${index}`} className={styles.crewRow}>
                        <div className={styles.field}>
                          <Input
                            label="Buscar entidad"
                            name={`funding-search-${index}`}
                            value={fundingSearches[index] ?? ""}
                            onChange={(event) =>
                              setFundingSearches((prev) => {
                                const next = [...prev]
                                next[index] = event.target.value
                                return next
                              })
                            }
                            placeholder="Buscar por nombre"
                          />
                          <div className={styles.optionGrid}>
                            {getFundingOptions(
                              fundingSearches[index] ?? "",
                            ).map((fund) => (
                              <Checkbox
                                key={`funding-fund-${index}-${fund.id}`}
                                label={
                                  fund.country?.name
                                    ? `${fund.name} (${fund.country.name})`
                                    : fund.name
                                }
                                variant="pill"
                                checked={entry.fundId === fund.id}
                                onChange={() =>
                                  updateFundingRow(index, "fundId", fund.id)
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <Input
                          label="Año"
                          name={`funding-year-${index}`}
                          type="number"
                          min={1900}
                          value={entry.year}
                          onChange={(event) =>
                            updateFundingRow(
                              index,
                              "year",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                          placeholder="Ej: 2024"
                        />

                        <Input
                          label="Monto otorgado"
                          name={`funding-amount-${index}`}
                          type="number"
                          min={0}
                          value={entry.amountGranted}
                          onChange={(event) =>
                            updateFundingRow(
                              index,
                              "amountGranted",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                          placeholder="Ej: 50000"
                        />

                        <Select
                          label="Etapa"
                          name={`funding-stage-${index}`}
                          value={entry.fundingStage}
                          onChange={(event) =>
                            updateFundingRow(
                              index,
                              "fundingStage",
                              event.target.value as ProjectStatus,
                            )
                          }
                        >
                          <option value="">Selecciona etapa</option>
                          {FUNDING_STAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removeFundingRow(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addFundingRow}
                  >
                    Agregar fuente
                  </Button>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>
                    Ciudades de rodaje en Ecuador
                  </div>
                  <Input
                    label="Buscar ciudad"
                    name="filmingCitySearch"
                    value={filmingCitySearch}
                    onChange={(event) =>
                      setFilmingCitySearch(event.target.value)
                    }
                    placeholder="Buscar por ciudad"
                  />
                  {filmingCitySearch.trim() ? (
                    <div className={styles.optionGrid}>
                      {filteredFilmingCitiesEc.map((city) => {
                        const checked = formik.values.filmingCitiesEc.includes(
                          city,
                        )
                        return (
                          <Checkbox
                            key={`filming-city-${city}`}
                            label={city}
                            variant="pill"
                            checked={checked}
                            onChange={() =>
                              handleCheckboxToggle("filmingCitiesEc", city)
                            }
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <p className={styles.helper}>
                      Escribe para buscar y seleccionar ciudades.
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>
                    Países de rodaje fuera de Ecuador
                  </div>
                  <Input
                    label="Buscar país"
                    name="filmingCountrySearch"
                    value={filmingCountrySearch}
                    onChange={(event) =>
                      setFilmingCountrySearch(event.target.value)
                    }
                    placeholder="Buscar por país"
                  />
                  {filmingCountrySearch.trim() ? (
                    <div className={styles.optionGrid}>
                      {filteredFilmingCountries.map((country) => {
                        const checked =
                          formik.values.filmingCountries.includes(
                            country.code,
                          )
                        return (
                          <Checkbox
                            key={`filming-country-${country.code}`}
                            label={country.name}
                            variant="pill"
                            checked={checked}
                            onChange={() =>
                              handleCheckboxToggle(
                                "filmingCountries",
                                country.code,
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <p className={styles.helper}>
                      Escribe para buscar y seleccionar países.
                    </p>
                  )}
                </div>
              </section>
            )}

            {activeTab === 5 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Promoción internacional
                  </h2>
                  <p className={styles.sectionDescription}>
                    Información para mercados y espacios internacionales.
                  </p>
                </div>

                <Input
                  label="Título en inglés"
                  name="titleEn"
                  value={formik.values.titleEn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ej: The invisible border"
                  error={getFieldError("titleEn")}
                />

                <div className={styles.grid}>
                  <Textarea
                    label="Sinopsis en inglés"
                    name="synopsisEn"
                    value={formik.values.synopsisEn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Brief synopsis in English"
                  />

                  <Textarea
                    label="Logline en inglés"
                    name="logLineEn"
                    value={formik.values.logLineEn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="English log line"
                  />
                </div>

                <div className={styles.grid}>
                  <Textarea
                    label="Necesidades del proyecto"
                    name="projectNeed"
                    value={formik.values.projectNeed}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Describe las necesidades de tu proyecto. Ejemplo: en busca de coproducción para finalizar la postproducción"
                  />

                  <Textarea
                    label="Necesidades del proyecto (inglés)"
                    name="projectNeedEn"
                    value={formik.values.projectNeedEn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Describe your project's needs in English. Example: seeking co-production to complete post-production"
                  />
                </div>

                <div className={styles.field}>
                  <DocumentUpload
                    label="Dossier en inglés"
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.MOVIE_DOSSIER_EN}
                    onUploadComplete={(id: number) => handleDossierEnUpload(id)}
                    onRemove={handleDossierEnRemove}
                  />
                </div>
              </section>
            )}

            {activeTab === 6 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Banco de Contenidos ICCA
                  </h2>
                  <p className={styles.sectionDescription}>
                    Datos para la licencia y distribución del banco de
                    contenidos.
                  </p>
                </div>

                <div className={styles.crewList}>
                  {formik.values.contentBank.map((entry, index) => {
                    const usedTerritories = formik.values.contentBank
                      .map((item) => item.exhibitionWindow)
                      .filter((value) => value)
                    return (
                    <div
                      key={`content-bank-${index}`}
                      className={styles.crewRow}
                    >
                      <Select
                        label="Territorio"
                        name={`content-territory-${index}`}
                        value={entry.exhibitionWindow}
                        onChange={(event) =>
                          updateContentBankRow(
                            index,
                            "exhibitionWindow",
                            event.target.value,
                          )
                        }
                      >
                        <option value="">Selecciona territorio</option>
                        {EXHIBITION_WINDOW_OPTIONS.map((option) => {
                          const isUsed =
                            usedTerritories.includes(option.value) &&
                            option.value !== entry.exhibitionWindow
                          return (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={isUsed}
                            >
                              {option.label}
                            </option>
                          )
                        })}
                      </Select>

                      <Input
                        label="Fecha de inicio de licencia"
                        name={`content-start-${index}`}
                        type="date"
                        value={entry.licensingStartDate}
                        onChange={(event) =>
                          updateContentBankRow(
                            index,
                            "licensingStartDate",
                            event.target.value,
                          )
                        }
                      />

                      <Input
                        label="Fecha de fin de licencia"
                        name={`content-end-${index}`}
                        type="date"
                        value={entry.licensingEndDate}
                        onChange={(event) =>
                          updateContentBankRow(
                            index,
                            "licensingEndDate",
                            event.target.value,
                          )
                        }
                      />

                      {(entry.exhibitionWindow === "Internacional" ||
                        entry.exhibitionWindow === "VOD") && (
                        <div className={styles.field}>
                          <div className={styles.label}>Geobloqueo</div>
                          <p className={styles.helper}>
                            Selecciona países donde no estará disponible.
                          </p>
                          <div className={styles.dropdown}>
                            <button
                              type="button"
                              className={styles.dropdownTrigger}
                              onClick={() =>
                                setOpenGeoblockIndex((prev) =>
                                  prev === index ? null : index,
                                )
                              }
                            >
                              {entry.geolocationRestrictionCountryIds.length
                                ? `${entry.geolocationRestrictionCountryIds.length} países seleccionados`
                                : "Selecciona países"}
                            </button>
                            {openGeoblockIndex === index && (
                              <div className={styles.dropdownMenu}>
                                {sortedCountries.map((country) => {
                                  const checked =
                                    entry.geolocationRestrictionCountryIds.includes(
                                      country.id,
                                    )
                                  return (
                                    <label
                                      key={`geoblock-${index}-${country.id}`}
                                      className={styles.dropdownItem}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          const next = [
                                            ...formik.values.contentBank,
                                          ]
                                          const current =
                                            next[index]
                                              .geolocationRestrictionCountryIds
                                          next[index] = {
                                            ...next[index],
                                            geolocationRestrictionCountryIds: checked
                                              ? current.filter(
                                                  (id) => id !== country.id,
                                                )
                                              : [...current, country.id],
                                          }
                                          formik.setFieldValue("contentBank", next)
                                        }}
                                      />
                                      <span>{country.name}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeContentBankRow(index)}
                        disabled={formik.values.contentBank.length === 1}
                      >
                        Quitar
                      </Button>
                    </div>
                  )})}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addContentBankRow}
                  disabled={
                    new Set(
                      formik.values.contentBank
                        .map((entry) => entry.exhibitionWindow)
                        .filter((value) => value),
                    ).size >= EXHIBITION_WINDOW_OPTIONS.length
                  }
                >
                  Agregar territorio
                </Button>
              </section>
            )}

            {activeTab === 6 && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Subtítulos</h2>
                  <p className={styles.sectionDescription}>
                    Selecciona los idiomas disponibles como subtítulos.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Subtítulos *</div>
                  <div className={styles.optionGrid}>
                    {sortedLanguages.map((lang) => {
                      const checked = formik.values.languages.includes(
                        lang.id,
                      )
                      return (
                        <Checkbox
                          key={lang.id}
                          label={lang.name}
                          variant="pill"
                          checked={checked}
                          onChange={() =>
                            handleCheckboxToggle("languages", lang.id)
                          }
                        />
                      )
                    })}
                  </div>
                  {getFieldError("languages") && (
                    <p className={styles.error}>{getFieldError("languages")}</p>
                  )}
                  <p className={styles.helper}>
                    Selecciona los subtítulos disponibles.
                  </p>
                </div>
              </section>
            )}

            <div className={styles.actions}>
              {formik.status?.error && (
                <div className={styles.errorBanner}>{formik.status.error}</div>
              )}
              {formik.status?.success && (
                <div className={styles.badge}>{formik.status.success}</div>
              )}
              <p className={styles.helper}>
                Antes de avanzar y completar la información, guarda los cambios.
              </p>
              <div className={styles.actionButtons}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin")}
                  disabled={formik.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  Guardar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setActiveTab((prev) =>
                      Math.min(prev + 1, tabs.length - 1),
                    )
                  }
                  disabled={activeTab === tabs.length - 1}
                >
                  Avanzar
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
