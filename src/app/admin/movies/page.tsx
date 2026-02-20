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
import { AddCompanyModal } from "@/shared/components/AddCompanyModal"
import { AddFundModal } from "@/shared/components/AddFundModal"
import { AddProfessionalModal } from "@/shared/components/AddProfessionalModal"
import { AddExhibitionSpaceModal } from "@/shared/components/AddExhibitionSpaceModal"
import { AddPlatformModal } from "@/shared/components/AddPlatformModal"
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
  languages: string[]
  subtitles: number[]
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

export default function MoviesAdminPage() {
  return <MovieForm />
}

type MovieDetail = {
  id: number
  title?: string
  titleEn?: string | null
  durationMinutes?: number
  type?: MovieType
  genre?: MovieGenre
  subgenres?: Array<{ id: number }>
  languages?: Array<{ id: number; code: string; name?: string }>
  subtitles?: Array<{ languageId?: number; language?: { id: number } }>
  country?: { id: number }
  releaseYear?: number | null
  synopsis?: string
  synopsisEn?: string | null
  logLine?: string | null
  logline?: string | null
  logLineEn?: string | null
  loglineEn?: string | null
  projectNeed?: string | null
  projectNeedEn?: string | null
  professionals?: Array<{ professionalId: number; cinematicRoleId: number }>
  companies?: Array<{ companyId: number; participation: string }>
  internationalCoproductions?: Array<{ companyName: string; countryId: number }>
  totalBudget?: number | string | null
  economicRecovery?: number | string | null
  spectatorsCount?: number | null
  crewTotal?: number | null
  actorsTotal?: number | null
  funding?: Array<{
    fundId: number
    year: number
    amountGranted?: number | null
    fundingStage: ProjectStatus
  }>
  nationalReleases?: Array<{
    exhibitionSpaceId: number
    cityId: number
    year: number
    type: MovieReleaseType
  }>
  internationalReleases?: Array<{
    spaceName?: string | null
    countryId: number
    year: number
    type: MovieReleaseType
  }>
  festivalNominations?: Array<{
    fundId: number
    year: number
    category: string
    result: FestivalNominationResult
  }>
  platforms?: Array<{ platformId: number; link?: string | null }>
  contacts?: Array<{
    name?: string | null
    role: ContactPosition
    phone?: string | null
    email?: string | null
  }>
  contentBank?: Array<{
    exhibitionWindow: ExhibitionWindow
    licensingStartDate: string | Date
    licensingEndDate: string | Date
    geolocationRestrictionCountryIds?: number[] | null
  }>
  posterAsset?: { id: number; url?: string } | null
  dossierAsset?: { id: number; url?: string } | null
  dossierAssetEn?: { id: number; url?: string } | null
  pedagogicalSheetAsset?: { id: number; url?: string } | null
  trailerLink?: string | null
  makingOfLink?: string | null
  frameAssets?: Array<{ id: number; url?: string }>
  cities?: Array<{ name: string }>
  filmingCountries?: Array<{ country?: { code?: string }; countryId?: number }>
  classification?: MovieClassification
  projectStatus?: ProjectStatus
}

type MovieFormProps = {
  initialMovie?: MovieDetail | null
  movieId?: number
}

const DIRECTOR_ROLE_ID = 1
const PRODUCER_ROLE_ID = 2
const ACTOR_ROLE_ID = 20
const COMPANY_PARTICIPATION_PRODUCER = "Producción"
const COMPANY_PARTICIPATION_CO_PRODUCER = "Coproducción"

const toNumberValue = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return ""
  const parsed = Number(value)
  return Number.isNaN(parsed) ? "" : parsed
}

const toDateInput = (value?: string | Date | null) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

const mapMovieToFormValues = (movie: MovieDetail): FormValues => {
  const directors =
    movie.professionals
      ?.filter((entry) => entry.cinematicRoleId === DIRECTOR_ROLE_ID)
      .map((entry) => entry.professionalId) ?? []
  const producers =
    movie.professionals
      ?.filter((entry) => entry.cinematicRoleId === PRODUCER_ROLE_ID)
      .map((entry) => entry.professionalId) ?? []
  const mainActors =
    movie.professionals
      ?.filter((entry) => entry.cinematicRoleId === ACTOR_ROLE_ID)
      .map((entry) => entry.professionalId) ?? []
  const crew =
    movie.professionals
      ?.filter(
        (entry) =>
          ![DIRECTOR_ROLE_ID, PRODUCER_ROLE_ID, ACTOR_ROLE_ID].includes(
            entry.cinematicRoleId,
          ),
      )
      .map((entry) => ({
        roleId: entry.cinematicRoleId,
        professionalId: entry.professionalId,
      })) ?? []

  const producerCompanyId =
    movie.companies?.find(
      (company) => company.participation === COMPANY_PARTICIPATION_PRODUCER,
    )?.companyId ?? ""
  const coProducerCompanyIds =
    movie.companies
      ?.filter(
        (company) =>
          company.participation === COMPANY_PARTICIPATION_CO_PRODUCER,
      )
      .map((company) => company.companyId) ?? []

  const subtitles =
    movie.subtitles
      ?.map((subtitle) => subtitle.languageId ?? subtitle.language?.id)
      .filter((id): id is number => Boolean(id)) ?? []

  const nationalRelease = movie.nationalReleases?.[0]
  const internationalRelease = movie.internationalReleases?.[0]

  return {
    ...initialValues,
    title: movie.title ?? "",
    titleEn: movie.titleEn ?? "",
    durationMinutes: toNumberValue(movie.durationMinutes),
    type: movie.type ?? initialValues.type,
    genre: movie.genre ?? initialValues.genre,
    subGenres: movie.subgenres?.map((subgenre) => subgenre.id) ?? [],
    languages: movie.languages?.map((language) => language.code) ?? [],
    subtitles,
    countryId: movie.country?.id ?? "",
    releaseYear: toNumberValue(movie.releaseYear),
    synopsis: movie.synopsis ?? "",
    synopsisEn: movie.synopsisEn ?? "",
    logLine:
      (movie.logLine ?? movie.logline ?? "") as string,
    logLineEn:
      (movie.logLineEn ?? movie.loglineEn ?? "") as string,
    projectNeed: movie.projectNeed ?? "",
    projectNeedEn: movie.projectNeedEn ?? "",
    directors,
    producers,
    mainActors,
    crew,
    producerCompanyId,
    coProducerCompanyIds,
    internationalCoProductions:
      movie.internationalCoproductions?.map((entry) => ({
        companyName: entry.companyName,
        countryId: entry.countryId,
      })) ?? [],
    totalBudget: toNumberValue(movie.totalBudget),
    economicRecovery: toNumberValue(movie.economicRecovery),
    totalAudience: toNumberValue(movie.spectatorsCount),
    crewTotal: toNumberValue(movie.crewTotal),
    actorsTotal: toNumberValue(movie.actorsTotal),
    funding:
      movie.funding?.map((entry) => ({
        fundId: entry.fundId,
        year: entry.year,
        amountGranted:
          entry.amountGranted === null || entry.amountGranted === undefined
            ? ""
            : Number(entry.amountGranted),
        fundingStage: entry.fundingStage,
      })) ?? [],
    nationalRelease: nationalRelease
      ? {
          exhibitionSpaceId: nationalRelease.exhibitionSpaceId,
          cityId: nationalRelease.cityId,
          year: nationalRelease.year,
          type: nationalRelease.type,
        }
      : initialValues.nationalRelease,
    internationalRelease: internationalRelease
      ? {
          spaceName: internationalRelease.spaceName ?? "",
          countryId: internationalRelease.countryId,
          year: internationalRelease.year,
          type: internationalRelease.type,
        }
      : initialValues.internationalRelease,
    festivalNominations:
      movie.festivalNominations?.map((entry) => ({
        fundId: entry.fundId,
        year: entry.year,
        category: entry.category,
        result: entry.result,
      })) ?? [],
    platforms:
      movie.platforms?.map((entry) => ({
        platformId: entry.platformId,
        link: entry.link ?? "",
      })) ?? [],
    contacts:
      movie.contacts?.map((entry) => ({
        name: entry.name ?? "",
        role: entry.role,
        phone: entry.phone ?? "",
        email: entry.email ?? "",
      })) ?? [],
    contentBank:
      movie.contentBank?.length
        ? movie.contentBank.map((entry) => ({
            exhibitionWindow: entry.exhibitionWindow,
            licensingStartDate: toDateInput(entry.licensingStartDate),
            licensingEndDate: toDateInput(entry.licensingEndDate),
            geolocationRestrictionCountryIds:
              entry.geolocationRestrictionCountryIds ?? [],
          }))
        : initialValues.contentBank,
    posterAssetId: movie.posterAsset?.id ?? null,
    trailerLink: movie.trailerLink ?? "",
    makingOffLink: movie.makingOfLink ?? "",
    dossierAssetId: movie.dossierAsset?.id ?? null,
    dossierEnAssetId: movie.dossierAssetEn?.id ?? null,
    pedagogicalGuideAssetId: movie.pedagogicalSheetAsset?.id ?? null,
    stillAssetIds: movie.frameAssets?.map((asset) => asset.id) ?? [],
    filmingCitiesEc: movie.cities?.map((city) => city.name) ?? [],
    filmingCountries:
      movie.filmingCountries
        ?.map((entry) => entry.country?.code)
        .filter((code): code is string => Boolean(code)) ?? [],
    classification: movie.classification ?? initialValues.classification,
    projectStatus: movie.projectStatus ?? initialValues.projectStatus,
  }
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
    { value: "no_especificada", label: "No especificada" },
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
  languages: Yup.array(),
  subtitles: Yup.array(),
  countryId: Yup.number().required("Selecciona un país de origen"),
  
  releaseYear: Yup.number()
    .typeError("El año debe ser un número")
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
  directors: Yup.array(),
  producers: Yup.array(),
  mainActors: Yup.array(),
  crew: Yup.array(),
  producerCompanyId: Yup.number(),
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
  subtitles: [],
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
  contacts: [],
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
  classification: "no_especificada",
  projectStatus: "desarrollo",
}

export function MovieForm({ initialMovie, movieId }: MovieFormProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { countries, isLoading: countriesLoading } = useCountries()
  const { cities } = useCities()
  const { languages } = useLanguages()
  const { subGenres } = useSubGenres()
  const { roles } = useCinematicRoles()
  const { professionals, addProfessional } = useProfessionals()
  const { companies, addCompany } = useCompanies()
  const { funds, addFund } = useFunds()
  const { spaces, addSpace } = useExhibitionSpaces()
  const { platforms, addPlatform } = usePlatforms()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [savedMovieId, setSavedMovieId] = useState(movieId ?? initialMovie?.id ?? null)
  const [producerCompanySearch, setProducerCompanySearch] = useState("")
  const [coProducerCompanySearch, setCoProducerCompanySearch] = useState("")
  const [directorSearch, setDirectorSearch] = useState("")
  const [producerSearch, setProducerSearch] = useState("")
  const [actorSearch, setActorSearch] = useState("")
  const [languageSearch, setLanguageSearch] = useState("")
  const [subtitleSearch, setSubtitleSearch] = useState("")
  const [internationalCompanyName, setInternationalCompanyName] = useState("")
  const [internationalCountryId, setInternationalCountryId] = useState<number | "">("")
  const [crewProfessionalSearch, setCrewProfessionalSearch] = useState("")
  const [crewProfessionalId, setCrewProfessionalId] = useState<number | "">("")
  const [crewRoleId, setCrewRoleId] = useState<number | "">("")
  const [subGenreSearch, setSubGenreSearch] = useState("")
  const [fundingSearch, setFundingSearch] = useState("")
  const [fundingFundId, setFundingFundId] = useState<number | "">("")
  const [fundingYear, setFundingYear] = useState<number | "">("")
  const [fundingAmount, setFundingAmount] = useState<number | "">("")
  const [fundingStage, setFundingStage] = useState<ProjectStatus | "">("")
  const [festivalFundSearch, setFestivalFundSearch] = useState("")
  const [festivalFundId, setFestivalFundId] = useState<number | "">("")
  const [festivalYear, setFestivalYear] = useState<number | "">("")
  const [festivalCategory, setFestivalCategory] = useState("")
  const [festivalResult, setFestivalResult] =
    useState<FestivalNominationResult | "">("")
  const [platformId, setPlatformId] = useState<number | "">("")
  const [platformLink, setPlatformLink] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactRole, setContactRole] = useState<ContactPosition | "">("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contentTerritory, setContentTerritory] =
    useState<ExhibitionWindow | "">("")
  const [contentStartDate, setContentStartDate] = useState("")
  const [contentEndDate, setContentEndDate] = useState("")
  const [contentGeoblockIds, setContentGeoblockIds] = useState<number[]>([])
  const [contentGeoblockOpen, setContentGeoblockOpen] = useState(false)
  const [filmingCitySearch, setFilmingCitySearch] = useState("")
  const [filmingCountrySearch, setFilmingCountrySearch] = useState("")
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false)
  const [isAddCoProducerCompanyModalOpen, setIsAddCoProducerCompanyModalOpen] = useState(false)
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false)
  const [isAddExhibitionSpaceModalOpen, setIsAddExhibitionSpaceModalOpen] = useState(false)
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false)
  const [isAddDirectorModalOpen, setIsAddDirectorModalOpen] = useState(false)
  const [isAddProducerModalOpen, setIsAddProducerModalOpen] = useState(false)
  const [isAddActorModalOpen, setIsAddActorModalOpen] = useState(false)
  const [isAddCrewModalOpen, setIsAddCrewModalOpen] = useState(false)
  const [isCreatingCompany, setIsCreatingCompany] = useState(false)
  const initializeDocumentUrls = () => ({
    poster: initialMovie?.posterAsset?.url || null,
    dossier: initialMovie?.dossierAsset?.url || null,
    dossierEn: initialMovie?.dossierAssetEn?.url || null,
    guide: initialMovie?.pedagogicalSheetAsset?.url || null,
    stills: (initialMovie?.frameAssets || []).map((asset) => ({
      id: asset.id,
      url: asset.url || "",
      localId: `existing-${asset.id}`,
    })),
  })

  const [documentUrls] = useState(initializeDocumentUrls())

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

  const formInitialValues = useMemo(
    () => (initialMovie ? mapMovieToFormValues(initialMovie) : initialValues),
    [initialMovie],
  )

  const formik = useFormik<FormValues>({
    initialValues: formInitialValues,
    enableReinitialize: true,
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

        const contentBankEntries = values.contentBank
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
          }))

        const payload: CreateMoviePayload = {
          title: values.title.trim(),
          titleEn: values.titleEn.trim() || undefined,
          durationMinutes: Number(values.durationMinutes),
          type: values.type,
          genre: values.genre,
          subGenreIds: values.subGenres,
          languages: values.languages,
          subtitleLanguageIds: values.subtitles,
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
            contentBankEntries.length > 0 ? contentBankEntries : undefined,
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

        const result = savedMovieId
          ? await movieService.update(savedMovieId, payload)
          : await movieService.create(payload)
        if (!savedMovieId) {
          setSavedMovieId(result.id)
        }
        formik.setStatus({ success: "Película guardada correctamente." })
      } catch (error) {
        const message =
          (error as { message?: string })?.message ||
          "No se pudo guardar la película"
        formik.setStatus({ error: message })
      }
    },
  })

  const sortedCountries = useMemo(() => {
    const normalizedEcuador = "ecuador"
    return [...countries].sort((a, b) => {
      const aName = a.name?.toLowerCase() ?? ""
      const bName = b.name?.toLowerCase() ?? ""
      if (aName === normalizedEcuador && bName !== normalizedEcuador) return -1
      if (bName === normalizedEcuador && aName !== normalizedEcuador) return 1
      return a.name.localeCompare(b.name)
    })
  }, [countries])

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

  const filteredSubtitleLanguages = useMemo(() => {
    const query = subtitleSearch.trim().toLowerCase()
    if (!query) return sortedLanguages
    return sortedLanguages.filter((lang) => {
      const label = `${lang.name} ${lang.code}`.toLowerCase()
      return label.includes(query)
    })
  }, [subtitleSearch, sortedLanguages])

  const sortedProfessionals = useMemo(
    () =>
      [...professionals].sort((a, b) =>
        `${a.name ?? ""}`.localeCompare(`${b.name ?? ""}`),
      ),
    [professionals],
  )

  const filteredDirectors = useMemo(() => {
    const query = directorSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) => {
      const label = `${professional.name ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }, [directorSearch, sortedProfessionals])

  const filteredProducers = useMemo(() => {
    const query = producerSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) => {
      const label = `${professional.name ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }, [producerSearch, sortedProfessionals])

  const filteredActors = useMemo(() => {
    const query = actorSearch.trim().toLowerCase()
    if (!query) return sortedProfessionals
    return sortedProfessionals.filter((professional) =>
      `${professional.name ?? ""}`.toLowerCase().includes(query),
    )
  }, [actorSearch, sortedProfessionals])

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  )

  const filteredCrewRoles = useMemo(() => {
    const blocked = ["actor", "actriz", "director", "productor"]
    return sortedRoles.filter((role) => {
      const name = role.name.toLowerCase()
      return !blocked.some((term) => name.includes(term))
    })
  }, [sortedRoles])

  const sortedCompanies = useMemo(
    () =>
      [...companies].sort((a, b) =>
        `${a.name ?? a.ruc ?? ""}`.localeCompare(`${b.name ?? b.ruc ?? ""}`),
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
      const label = `${company.name ?? ""} ${company.ruc ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }, [producerCompanySearch, sortedCompanies])

  const coProducerCompaniesFiltered = useMemo(() => {
    const query = coProducerCompanySearch.trim().toLowerCase()
    if (!query) return sortedCompanies
    return sortedCompanies.filter((company) => {
      const label = `${company.name ?? ""} ${company.ruc ?? ""}`.toLowerCase()
      return label.includes(query)
    })
  }, [coProducerCompanySearch, sortedCompanies])

  const selectedCoProducerCompanies = useMemo(() => {
    return formik.values.coProducerCompanyIds
      .map((companyId) => companies.find((company) => company.id === companyId))
      .filter((company): company is typeof company & {} => company !== undefined)
  }, [formik.values.coProducerCompanyIds, companies])

  const selectedProducerCompany = useMemo(
    () => companies.find((company) => company.id === formik.values.producerCompanyId),
    [formik.values.producerCompanyId, companies],
  )

  const sortedSubGenres = useMemo(
    () => [...subGenres].sort((a, b) => a.name.localeCompare(b.name)),
    [subGenres],
  )

  const filteredSubGenres = useMemo(() => {
    const query = subGenreSearch.trim().toLowerCase()
    if (!query) return sortedSubGenres
    return sortedSubGenres.filter((subGenre) => {
      return subGenre.name.toLowerCase().includes(query)
    })
  }, [subGenreSearch, sortedSubGenres])

  const selectedSubGenres = useMemo(() => {
    return formik.values.subGenres
      .map((subGenreId) => subGenres.find((g) => g.id === subGenreId))
      .filter((subGenre): subGenre is typeof subGenre & {} => subGenre !== undefined)
  }, [formik.values.subGenres, subGenres])

  const getFundingOptions = (searchValue: string) => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sortedFunds
    return sortedFunds.filter((fund) => {
      const label = `${fund.name} ${fund.country?.name ?? ""}`.toLowerCase()
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
      | "subtitles"
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

  const addCrewEntry = () => {
    if (!crewProfessionalId || !crewRoleId) return
    formik.setFieldValue("crew", [
      ...formik.values.crew,
      { roleId: crewRoleId, professionalId: crewProfessionalId },
    ])
    setCrewProfessionalId("")
    setCrewRoleId("")
    setCrewProfessionalSearch("")
  }

  const removeCrewRow = (index: number) => {
    const next = formik.values.crew.filter((_, i) => i !== index)
    formik.setFieldValue("crew", next)
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

  const addFundingEntry = () => {
    if (!fundingFundId || !fundingYear || !fundingAmount || !fundingStage) {
      return
    }
    formik.setFieldValue("funding", [
      ...formik.values.funding,
      {
        fundId: fundingFundId,
        year: fundingYear,
        amountGranted: fundingAmount,
        fundingStage,
      },
    ])
    setFundingFundId("")
    setFundingYear("")
    setFundingAmount("")
    setFundingStage("")
    setFundingSearch("")
  }

  const removeFundingRow = (index: number) => {
    const next = formik.values.funding.filter((_, i) => i !== index)
    formik.setFieldValue("funding", next)
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

  const addFestivalNominationEntry = () => {
    if (!festivalFundId || !festivalYear || !festivalCategory || !festivalResult) {
      return
    }
    formik.setFieldValue("festivalNominations", [
      ...formik.values.festivalNominations,
      {
        fundId: festivalFundId,
        year: festivalYear,
        category: festivalCategory.trim(),
        result: festivalResult,
      },
    ])
    setFestivalFundId("")
    setFestivalYear("")
    setFestivalCategory("")
    setFestivalResult("")
    setFestivalFundSearch("")
  }

  const removeFestivalNominationRow = (index: number) => {
    const next = formik.values.festivalNominations.filter((_, i) => i !== index)
    formik.setFieldValue("festivalNominations", next)
  }

  const addPlatformEntry = () => {
    if (!platformId || !platformLink.trim()) return
    formik.setFieldValue("platforms", [
      ...formik.values.platforms,
      { platformId, link: platformLink.trim() },
    ])
    setPlatformId("")
    setPlatformLink("")
  }

  const addContactEntry = () => {
    if (!contactName.trim() || !contactRole || !contactPhone.trim() || !contactEmail.trim()) {
      return
    }
    formik.setFieldValue("contacts", [
      ...formik.values.contacts,
      {
        name: contactName.trim(),
        role: contactRole,
        phone: contactPhone.trim(),
        email: contactEmail.trim(),
      },
    ])
    setContactName("")
    setContactRole("")
    setContactPhone("")
    setContactEmail("")
  }

  const removeContactRow = (index: number) => {
    const next = formik.values.contacts.filter((_, i) => i !== index)
    formik.setFieldValue("contacts", next)
  }

  const removePlatformRow = (index: number) => {
    const next = formik.values.platforms.filter((_, i) => i !== index)
    formik.setFieldValue("platforms", next)
  }

  const addInternationalCoproductionEntry = () => {
    const companyName = internationalCompanyName.trim()
    if (!companyName || !internationalCountryId) return
    formik.setFieldValue("internationalCoProductions", [
      ...formik.values.internationalCoProductions,
      { companyName, countryId: internationalCountryId },
    ])
    setInternationalCompanyName("")
    setInternationalCountryId("")
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

  const addContentBankEntry = () => {
    if (!contentTerritory || !contentStartDate || !contentEndDate) return
    formik.setFieldValue("contentBank", [
      ...formik.values.contentBank,
      {
        exhibitionWindow: contentTerritory,
        licensingStartDate: contentStartDate,
        licensingEndDate: contentEndDate,
        geolocationRestrictionCountryIds: contentGeoblockIds,
      },
    ])
    setContentTerritory("")
    setContentStartDate("")
    setContentEndDate("")
    setContentGeoblockIds([])
    setContentGeoblockOpen(false)
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

  const handleCompanyCreated = (company: { id: number; name: string; ruc: string | null }) => {
    addCompany(company)
    formik.setFieldValue("producerCompanyId", company.id)
    setProducerCompanySearch("")
    setIsAddCompanyModalOpen(false)
    setIsCreatingCompany(false)
  }

  const handleCoProducerCompanyCreated = (company: { id: number; name: string; ruc: string | null }) => {
    addCompany(company)
    const currentIds = formik.values.coProducerCompanyIds
    if (!currentIds.includes(company.id)) {
      formik.setFieldValue("coProducerCompanyIds", [...currentIds, company.id])
    }
    setCoProducerCompanySearch("")
    setIsAddCoProducerCompanyModalOpen(false)
    setIsCreatingCompany(false)
  }

  const handleFundCreated = (fund: { id: number; name: string; country?: { id?: number; name: string; code?: string } }) => {
    addFund(fund)
    setFundingFundId(fund.id)
    setFundingSearch("")
    setIsAddFundModalOpen(false)
  }

  const handleExhibitionSpaceCreated = (space: { id: number; name: string; country?: { id: number; name: string } }) => {
    addSpace(space)
    updateNationalRelease("exhibitionSpaceId", space.id)
    setIsAddExhibitionSpaceModalOpen(false)
  }

  const handlePlatformCreated = (platform: { id: number; name: string; type?: string }) => {
    addPlatform(platform)
    setPlatformId(platform.id)
    setIsAddPlatformModalOpen(false)
  }

  const handleDirectorCreated = (professional: { id: number; name: string }) => {
    addProfessional(professional)
    const currentIds = formik.values.directors
    if (!currentIds.includes(professional.id)) {
      formik.setFieldValue("directors", [...currentIds, professional.id])
    }
    setDirectorSearch("")
    setIsAddDirectorModalOpen(false)
  }

  const handleProducerCreated = (professional: { id: number; name: string }) => {
    addProfessional(professional)
    const currentIds = formik.values.producers
    if (!currentIds.includes(professional.id)) {
      formik.setFieldValue("producers", [...currentIds, professional.id])
    }
    setProducerSearch("")
    setIsAddProducerModalOpen(false)
  }

  const handleActorCreated = (professional: { id: number; name: string }) => {
    addProfessional(professional)
    const currentIds = formik.values.mainActors
    if (!currentIds.includes(professional.id)) {
      formik.setFieldValue("mainActors", [...currentIds, professional.id])
    }
    setActorSearch("")
    setIsAddActorModalOpen(false)
  }

  const handleCrewCreated = (professional: { id: number; name: string }) => {
    addProfessional(professional)
    setCrewProfessionalId(professional.id)
    setCrewProfessionalSearch("")
    setIsAddCrewModalOpen(false)
  }

  const getProfessionalLabel = (professional: { name?: string | null }) =>
    professional.name ?? ""

  const getCompanyLabel = (company: {
    name?: string | null
    ruc?: string | null
  }) => company.name ?? company.ruc ?? ""

  const markAllTouched = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => markAllTouched(item))
    }
    if (value && typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).reduce(
        (acc, key) => {
          acc[key] = markAllTouched(
            (value as Record<string, unknown>)[key],
          )
          return acc
        },
        {} as Record<string, unknown>,
      )
    }
    return true
  }

  const handleSaveClick = async () => {
    const errors = await formik.validateForm()
    if (Object.keys(errors).length > 0) {
      formik.setTouched(markAllTouched(formik.values) as typeof formik.touched, true)
      formik.setStatus({ error: "Completa los campos obligatorios." })
      return
    }
    formik.handleSubmit()
  }

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
                        <Select
                          label="Espacio de exhibición"
                          name="national-release-space"
                          value={formik.values.nationalRelease.exhibitionSpaceId}
                          onChange={(event) =>
                            updateNationalRelease(
                              "exhibitionSpaceId",
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                        >
                          <option value="">Selecciona un espacio</option>
                          {sortedExhibitionSpaces.map((space) => (
                            <option key={space.id} value={space.id}>
                              {space.country?.name
                                ? `${space.name} (${space.country.name})`
                                : space.name}
                            </option>
                          ))}
                        </Select>
                        <button
                          type="button"
                          className={styles.addNewLink}
                          onClick={() => setIsAddExhibitionSpaceModalOpen(true)}
                        >
                          Agregar nuevo espacio
                        </button>
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
                    <div className={styles.crewRow}>
                      <div className={styles.field}>
                        <Input
                          label="Buscar espacio"
                          name="festival-fund-search"
                          value={festivalFundSearch}
                          onChange={(event) =>
                            setFestivalFundSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre"
                        />

                        {festivalFundId && (
                          <div className={styles.optionGrid}>
                            {(() => {
                              const selected = funds.find(
                                (fund) => fund.id === festivalFundId,
                              )
                              if (!selected) return null
                              return (
                                <Checkbox
                                  key={`festival-selected-${selected.id}`}
                                  label={
                                    selected.country?.name
                                      ? `${selected.name} (${selected.country.name})`
                                      : selected.name
                                  }
                                  variant="pill"
                                  checked
                                  onChange={() => setFestivalFundId("")}
                                />
                              )
                            })()}
                          </div>
                        )}

                        {festivalFundSearch.trim() && (
                          <div className={styles.suggestionList}>
                            {getFundingOptions(festivalFundSearch).length === 0 && (
                              <div className={styles.suggestionEmpty}>
                                <p>No se encontraron espacios con ese criterio.</p>
                                <button
                                  type="button"
                                  className={styles.addNewLink}
                                  onClick={() => setIsAddFundModalOpen(true)}
                                >
                                  Agregar nuevo
                                </button>
                              </div>
                            )}
                            {getFundingOptions(festivalFundSearch)
                              .slice(0, 8)
                              .map((fund) => {
                                const checked = festivalFundId === fund.id
                                return (
                                  <button
                                    key={`festival-fund-${fund.id}`}
                                    type="button"
                                    className={styles.suggestionItem}
                                    onClick={() => {
                                      setFestivalFundId(fund.id)
                                      setFestivalFundSearch("")
                                    }}
                                  >
                                    <span className={styles.suggestionName}>
                                      {fund.country?.name
                                        ? `${fund.name} (${fund.country.name})`
                                        : fund.name}
                                    </span>
                                    <span className={styles.suggestionMeta}>
                                      {checked ? "Seleccionado" : ""}
                                    </span>
                                  </button>
                                )
                              })}
                          </div>
                        )}
                      </div>

                      <Input
                        label="Año"
                        name="festival-year"
                        type="number"
                        min={1900}
                        value={festivalYear}
                        onChange={(event) =>
                          setFestivalYear(
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                        placeholder="Ej: 2022"
                      />

                      <Input
                        label="Categoría"
                        name="festival-category"
                        value={festivalCategory}
                        onChange={(event) =>
                          setFestivalCategory(event.target.value)
                        }
                        placeholder="Ej: Mejor película"
                      />

                      <Select
                        label="Resultado"
                        name="festival-result"
                        value={festivalResult}
                        onChange={(event) =>
                          setFestivalResult(
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
                        onClick={addFestivalNominationEntry}
                        disabled={
                          !festivalFundId ||
                          !festivalYear ||
                          !festivalCategory ||
                          !festivalResult
                        }
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.festivalNominations.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.festivalNominations.map((entry, index) => {
                          const fund = funds.find((f) => f.id === entry.fundId)
                          const resultLabel = FESTIVAL_RESULT_OPTIONS.find(
                            (option) => option.value === entry.result,
                          )?.label
                          return (
                            <div
                              key={`festival-nomination-${index}`}
                              className={styles.internationalItem}
                            >
                              <div className={styles.internationalInfo}>
                                <p className={styles.internationalTitle}>
                                  {fund?.name ?? ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {fund?.country?.name ?? ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {entry.year ? `Año ${entry.year}` : ""}
                                  {entry.category ? ` • ${entry.category}` : ""}
                                  {resultLabel ? ` • ${resultLabel}` : ""}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className={styles.internationalRemove}
                                aria-label="Quitar"
                                onClick={() => removeFestivalNominationRow(index)}
                              >
                                X
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Plataformas</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <div className={styles.field}>
                        <Select
                          label="Plataforma"
                          name="platform-id"
                          value={platformId}
                          onChange={(event) =>
                            setPlatformId(
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
                        <button
                          type="button"
                          className={styles.addNewLink}
                          onClick={() => setIsAddPlatformModalOpen(true)}
                        >
                          Agregar nueva plataforma
                        </button>
                      </div>

                      <Input
                        label="Link"
                        name="platform-link"
                        value={platformLink}
                        onChange={(event) =>
                          setPlatformLink(event.target.value)
                        }
                        placeholder="https://"
                      />

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addPlatformEntry}
                        disabled={!platformId || !platformLink.trim()}
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.platforms.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.platforms.map((entry, index) => {
                          const platform = sortedPlatforms.find(
                            (p) => p.id === entry.platformId,
                          )
                          return (
                            <div
                              key={`platform-${index}`}
                              className={styles.internationalItem}
                            >
                              <div className={styles.internationalInfo}>
                                <p className={styles.internationalTitle}>
                                  {platform?.name ?? ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {entry.link}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className={styles.internationalRemove}
                                aria-label="Quitar"
                                onClick={() => removePlatformRow(index)}
                              >
                                X
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Contacto</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <Input
                        label="Nombre y apellido"
                        name="contact-name"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="Nombre del contacto"
                      />

                      <Select
                        label="Cargo"
                        name="contact-role"
                        value={contactRole}
                        onChange={(event) =>
                          setContactRole(event.target.value as ContactPosition)
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
                        name="contact-phone"
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                        placeholder="Ej: +593 99 123 4567"
                      />

                      <Input
                        label="Email"
                        name="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                        placeholder="contacto@ejemplo.com"
                      />

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addContactEntry}
                        disabled={
                          !contactName.trim() ||
                          !contactRole ||
                          !contactPhone.trim() ||
                          !contactEmail.trim()
                        }
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.contacts.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.contacts.map((entry, index) => {
                          const roleLabel = CONTACT_POSITION_OPTIONS.find(
                            (option) => option.value === entry.role,
                          )?.label
                          return (
                            <div
                              key={`contact-${index}`}
                              className={styles.internationalItem}
                            >
                              <div className={styles.internationalInfo}>
                                <p className={styles.internationalTitle}>
                                  {entry.name}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {roleLabel ?? ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {entry.phone}
                                  {entry.email ? ` • ${entry.email}` : ""}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className={styles.internationalRemove}
                                aria-label="Quitar"
                                onClick={() => removeContactRow(index)}
                              >
                                X
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
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
                    label="País *"
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
                      label="Productora principal"
                      name="companySearch"
                      value={producerCompanySearch}
                      onChange={(event) =>
                        setProducerCompanySearch(event.target.value)
                      }
                      placeholder="Buscar empresa por nombre o RUC"
                      error={getFieldError("producerCompanyId")}
                    />

                    {selectedProducerCompany && (
                      <div className={styles.optionGrid}>
                        <Checkbox
                          key={`producer-selected-${selectedProducerCompany.id}`}
                          label={getCompanyLabel(selectedProducerCompany)}
                          variant="pill"
                          checked
                          onChange={() => {
                            formik.setFieldValue("producerCompanyId", null)
                            setProducerCompanySearch("")
                          }}
                        />
                      </div>
                    )}

                    {producerCompanySearch.trim() && (
                      <div className={styles.suggestionList}>
                        {producerCompaniesFiltered.length === 0 && (
                          <div className={styles.suggestionEmpty}>
                            <p>No se encontraron empresas.</p>
                            <button
                              type="button"
                              className={styles.addNewLink}
                              onClick={() => setIsAddCompanyModalOpen(true)}
                            >
                              Agregar nuevo
                            </button>
                          </div>
                        )}
                        {producerCompaniesFiltered
                          .slice(0, 8)
                          .map((company) => (
                            <button
                              key={`producer-${company.id}`}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => {
                                formik.setFieldValue(
                                  "producerCompanyId",
                                  company.id,
                                )
                                setProducerCompanySearch("")
                              }}
                            >
                              <span className={styles.suggestionName}>
                                {getCompanyLabel(company)}
                              </span>
                              {company.ruc && (
                                <span className={styles.suggestionMeta}>
                                  {company.ruc}
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
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
                  {selectedCoProducerCompanies.length > 0 && (
                    <div className={styles.optionGrid}>
                      {selectedCoProducerCompanies.map((company) => (
                        <Checkbox
                          key={`coproducer-selected-${company.id}`}
                          label={getCompanyLabel(company)}
                          variant="pill"
                          checked
                          onChange={() =>
                            handleCheckboxToggle(
                              "coProducerCompanyIds",
                              company.id,
                            )
                          }
                        />
                      ))}
                    </div>
                  )}

                  {coProducerCompanySearch.trim() && (
                    <div className={styles.suggestionList}>
                      {coProducerCompaniesFiltered.length === 0 && (
                        <div className={styles.suggestionEmpty}>
                          <p>No se encontraron empresas con ese criterio.</p>
                          <button
                            type="button"
                            className={styles.addNewLink}
                            onClick={() => setIsAddCoProducerCompanyModalOpen(true)}
                          >
                            Agregar nuevo
                          </button>
                        </div>
                      )}
                      {coProducerCompaniesFiltered
                        .slice(0, 8)
                        .map((company) => {
                          const checked =
                            formik.values.coProducerCompanyIds.includes(
                              company.id,
                            )
                          return (
                            <button
                              key={`coproducer-${company.id}`}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => {
                                handleCheckboxToggle(
                                  "coProducerCompanyIds",
                                  company.id,
                                )
                                setCoProducerCompanySearch("")
                              }}
                            >
                              <span className={styles.suggestionName}>
                                {getCompanyLabel(company)}
                              </span>
                              <span className={styles.suggestionMeta}>
                                {checked ? "Seleccionado" : company.ruc ?? ""}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                  <p className={styles.helper}>
                    Selecciona una o varias empresas nacionales.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Coproducción internacional</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <Input
                        label="Nombre de la empresa"
                        name="international-company"
                        value={internationalCompanyName}
                        onChange={(event) =>
                          setInternationalCompanyName(event.target.value)
                        }
                        placeholder="Nombre del coproductor internacional"
                      />

                      <Select
                        label="País"
                        name="international-country"
                        value={internationalCountryId}
                        onChange={(event) =>
                          setInternationalCountryId(
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
                        onClick={addInternationalCoproductionEntry}
                        disabled={
                          !internationalCompanyName.trim() ||
                          !internationalCountryId
                        }
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.internationalCoProductions.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.internationalCoProductions.map(
                          (entry, index) => {
                            const country = sortedCountries.find(
                              (c) => c.id === entry.countryId,
                            )
                            return (
                              <div
                                key={`international-coproduction-${index}`}
                                className={styles.internationalItem}
                              >
                                <div className={styles.internationalInfo}>
                                  <p className={styles.internationalTitle}>
                                    {entry.companyName}
                                  </p>
                                  <p className={styles.internationalMeta}>
                                    {country?.name ?? ""}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className={styles.internationalRemove}
                                  aria-label="Quitar"
                                  onClick={() =>
                                    removeInternationalCoproductionRow(index)
                                  }
                                >
                                  X
                                </Button>
                              </div>
                            )
                          },
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Subgéneros *</div>
                  <Input
                    label="Buscar subgénero"
                    name="subGenreSearch"
                    value={subGenreSearch}
                    onChange={(event) =>
                      setSubGenreSearch(event.target.value)
                    }
                    placeholder="Buscar por nombre"
                  />
                  {selectedSubGenres.length > 0 && (
                    <div className={styles.optionGrid}>
                      {selectedSubGenres.map((subGenre) => (
                        <Checkbox
                          key={`subgenre-selected-${subGenre.id}`}
                          label={subGenre.name}
                          variant="pill"
                          checked
                          onChange={() =>
                            handleCheckboxToggle("subGenres", subGenre.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                  {subGenreSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredSubGenres.length === 0 && (
                        <p className={styles.suggestionEmpty}>
                          No se encontraron subgéneros con ese criterio.
                        </p>
                      )}
                      {filteredSubGenres
                        .slice(0, 8)
                        .map((subGenre) => {
                          const checked =
                            formik.values.subGenres.includes(
                              subGenre.id,
                            )
                          return (
                            <button
                              key={`subgenre-${subGenre.id}`}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => {
                                handleCheckboxToggle(
                                  "subGenres",
                                  subGenre.id,
                                )
                                setSubGenreSearch("")
                              }}
                            >
                              <span className={styles.suggestionName}>
                                {subGenre.name}
                              </span>
                              <span className={styles.suggestionMeta}>
                                {checked ? "Seleccionado" : ""}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                  {getFieldError("subGenres") && (
                    <p className={styles.error}>{getFieldError("subGenres")}</p>
                  )}
                  <p className={styles.helper}>
                    Selecciona al menos un subgénero.
                  </p>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Idiomas *</div>
                  <Input
                    label="Buscar idioma"
                    name="languageSearch"
                    value={languageSearch}
                    onChange={(event) =>
                      setLanguageSearch(event.target.value)
                    }
                    placeholder="Buscar por nombre"
                  />
                  {formik.values.languages.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.languages.map((langCode) => {
                        const language = languages.find(
                          (l) => l.code === langCode,
                        )
                        if (!language) return null
                        return (
                          <Checkbox
                            key={`language-selected-${language.id}`}
                            label={language.name}
                            variant="pill"
                            checked
                            onChange={() => {
                              handleCheckboxToggle("languages", language.code)
                              setLanguageSearch("")
                            }}
                          />
                        )
                      })}
                    </div>
                  )}

                  {languageSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredLanguages.length === 0 && (
                        <p className={styles.suggestionEmpty}>
                          No se encontraron idiomas con ese criterio.
                        </p>
                      )}
                      {filteredLanguages
                        .slice(0, 8)
                        .map((lang) => {
                          const checked = formik.values.languages.includes(
                            lang.code,
                          )
                          return (
                            <button
                              key={`language-${lang.id}`}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => {
                                handleCheckboxToggle("languages", lang.code)
                                setLanguageSearch("")
                              }}
                            >
                              <span className={styles.suggestionName}>
                                {lang.name}
                              </span>
                              <span className={styles.suggestionMeta}>
                                {checked ? "Seleccionado" : ""}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                  {getFieldError("languages") && (
                    <p className={styles.error}>{getFieldError("languages")}</p>
                  )}
                  <p className={styles.helper}>
                    Puedes seleccionar varios idiomas disponibles como subtítulos.
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
                      currentImageUrl={documentUrls.poster || undefined}
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
                      currentDocumentUrl={documentUrls.dossier || undefined}
                      onUploadComplete={(id: number) => handleDossierUpload(id)}
                      onRemove={handleDossierRemove}
                    />
                  </div>

                  <div className={styles.field}>
                    <DocumentUpload
                      label="Guía pedagógica"
                      documentType={AssetTypeEnum.DOCUMENT}
                      ownerType={AssetOwnerEnum.MOVIE_PEDAGOGICAL_GUIDE}
                      currentDocumentUrl={documentUrls.guide || undefined}
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
                    currentImages={documentUrls.stills}
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
                  {formik.values.directors.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.directors.map((directorId) => {
                        const director = sortedProfessionals.find(
                          (p) => p.id === directorId,
                        )
                        if (!director) return null
                        return (
                          <Checkbox
                            key={`director-selected-${directorId}`}
                            label={getProfessionalLabel(director)}
                            variant="pill"
                            checked
                            onChange={() =>
                              handleCheckboxToggle(
                                "directors",
                                directorId,
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  )}

                  {directorSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredDirectors.length === 0 && (
                        <div className={styles.suggestionEmpty}>
                          <p>No se encontraron profesionales con ese criterio.</p>
                          <button
                            type="button"
                            className={styles.addNewLink}
                            onClick={() => setIsAddDirectorModalOpen(true)}
                          >
                            Agregar nuevo
                          </button>
                        </div>
                      )}
                      {filteredDirectors.slice(0, 8).map((professional) => {
                        const checked = formik.values.directors.includes(
                          professional.id,
                        )
                        return (
                          <button
                            key={`director-${professional.id}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              handleCheckboxToggle(
                                "directors",
                                professional.id,
                              )
                              setDirectorSearch("")
                            }}
                          >
                            <span className={styles.suggestionName}>
                              {getProfessionalLabel(professional)}
                            </span>
                            <span className={styles.suggestionMeta}>
                              {checked ? "Seleccionado" : ""}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
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
                  {formik.values.producers.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.producers.map((producerId) => {
                        const producer = sortedProfessionals.find(
                          (p) => p.id === producerId,
                        )
                        if (!producer) return null
                        return (
                          <Checkbox
                            key={`producer-selected-${producerId}`}
                            label={getProfessionalLabel(producer)}
                            variant="pill"
                            checked
                            onChange={() =>
                              handleCheckboxToggle(
                                "producers",
                                producerId,
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  )}

                  {producerSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredProducers.length === 0 && (
                        <div className={styles.suggestionEmpty}>
                          <p>No se encontraron profesionales con ese criterio.</p>
                          <button
                            type="button"
                            className={styles.addNewLink}
                            onClick={() => setIsAddProducerModalOpen(true)}
                          >
                            Agregar nuevo
                          </button>
                        </div>
                      )}
                      {filteredProducers.slice(0, 8).map((professional) => {
                        const checked = formik.values.producers.includes(
                          professional.id,
                        )
                        return (
                          <button
                            key={`producer-${professional.id}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              handleCheckboxToggle(
                                "producers",
                                professional.id,
                              )
                              setProducerSearch("")
                            }}
                          >
                            <span className={styles.suggestionName}>
                              {getProfessionalLabel(professional)}
                            </span>
                            <span className={styles.suggestionMeta}>
                              {checked ? "Seleccionado" : ""}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {getFieldError("producers") && (
                    <p className={styles.error}>{getFieldError("producers")}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Crew</div>
                  <div className={styles.crewList}>
                    <div className={styles.crewRow}>
                      <div>
                        <Input
                          label="Buscar profesional"
                          name="crew-professional"
                          value={crewProfessionalSearch}
                          onChange={(event) =>
                            setCrewProfessionalSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre"
                        />
                        {crewProfessionalId && (
                          <div className={styles.optionGrid}>
                            {(() => {
                              const selected = sortedProfessionals.find(
                                (p) => p.id === crewProfessionalId,
                              )
                              if (!selected) return null
                              return (
                                <Checkbox
                                  key={`crew-selected-${selected.id}`}
                                  label={getProfessionalLabel(selected)}
                                  variant="pill"
                                  checked
                                  onChange={() => setCrewProfessionalId("")}
                                />
                              )
                            })()}
                          </div>
                        )}

                        {crewProfessionalSearch.trim() && (
                          <div className={styles.suggestionList}>
                            {getCrewProfessionals(crewProfessionalSearch)
                              .length === 0 && (
                              <div className={styles.suggestionEmpty}>
                                <p>No se encontraron profesionales con ese criterio.</p>
                                <button
                                  type="button"
                                  className={styles.addNewLink}
                                  onClick={() => setIsAddCrewModalOpen(true)}
                                >
                                  Agregar nuevo
                                </button>
                              </div>
                            )}
                            {getCrewProfessionals(crewProfessionalSearch)
                              .slice(0, 8)
                              .map((professional) => {
                                const checked =
                                  crewProfessionalId === professional.id
                                return (
                                  <button
                                    key={`crew-prof-${professional.id}`}
                                    type="button"
                                    className={styles.suggestionItem}
                                    onClick={() => {
                                      setCrewProfessionalId(professional.id)
                                      setCrewProfessionalSearch("")
                                    }}
                                  >
                                    <span className={styles.suggestionName}>
                                      {getProfessionalLabel(professional)}
                                    </span>
                                    <span className={styles.suggestionMeta}>
                                      {checked ? "Seleccionado" : ""}
                                    </span>
                                  </button>
                                )
                              })}
                          </div>
                        )}
                      </div>

                      <Select
                        label="Rol"
                        name="crew-role"
                        value={crewRoleId}
                        onChange={(event) =>
                          setCrewRoleId(
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                      >
                        <option value="">Selecciona un rol</option>
                        {filteredCrewRoles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Select>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addCrewEntry}
                        disabled={!crewProfessionalId || !crewRoleId}
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.crew.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.crew.map((item, index) => {
                          const professional = sortedProfessionals.find(
                            (p) => p.id === item.professionalId,
                          )
                          const role = sortedRoles.find(
                            (r) => r.id === item.roleId,
                          )
                          return (
                            <div
                              key={`crew-${index}`}
                              className={styles.internationalItem}
                            >
                              <div className={styles.internationalInfo}>
                                <p className={styles.internationalTitle}>
                                  {professional
                                    ? getProfessionalLabel(professional)
                                    : ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {role?.name ?? ""}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className={styles.internationalRemove}
                                aria-label="Quitar"
                                onClick={() => removeCrewRow(index)}
                              >
                                X
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
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
                  {formik.values.mainActors.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.mainActors.map((actorId) => {
                        const actor = sortedProfessionals.find(
                          (p) => p.id === actorId,
                        )
                        if (!actor) return null
                        return (
                          <Checkbox
                            key={`actor-selected-${actorId}`}
                            label={getProfessionalLabel(actor)}
                            variant="pill"
                            checked
                            onChange={() => removeActor(actorId)}
                          />
                        )
                      })}
                    </div>
                  )}

                  {actorSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredActors.length === 0 && (
                        <div className={styles.suggestionEmpty}>
                          <p>No se encontraron profesionales con ese criterio.</p>
                          <button
                            type="button"
                            className={styles.addNewLink}
                            onClick={() => setIsAddActorModalOpen(true)}
                          >
                            Agregar nuevo
                          </button>
                        </div>
                      )}
                      {filteredActors.slice(0, 8).map((professional) => {
                        const checked = formik.values.mainActors.includes(
                          professional.id,
                        )
                        return (
                          <button
                            key={`actor-${professional.id}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              addActor(professional.id)
                              setActorSearch("")
                            }}
                          >
                            <span className={styles.suggestionName}>
                              {getProfessionalLabel(professional)}
                            </span>
                            <span className={styles.suggestionMeta}>
                              {checked ? "Seleccionado" : ""}
                            </span>
                          </button>
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
                    <div className={styles.crewRow}>
                      <div className={styles.field}>
                        <Input
                          label="Buscar entidad"
                          name="funding-search"
                          value={fundingSearch}
                          onChange={(event) =>
                            setFundingSearch(event.target.value)
                          }
                          placeholder="Buscar por nombre"
                        />

                        {fundingFundId && (
                          <div className={styles.optionGrid}>
                            {(() => {
                              const selected = funds.find(
                                (fund) => fund.id === fundingFundId,
                              )
                              if (!selected) return null
                              return (
                                <Checkbox
                                  key={`funding-selected-${selected.id}`}
                                  label={
                                    selected.country?.name
                                      ? `${selected.name} (${selected.country.name})`
                                      : selected.name
                                  }
                                  variant="pill"
                                  checked
                                  onChange={() => setFundingFundId("")}
                                />
                              )
                            })()}
                          </div>
                        )}

                        {fundingSearch.trim() && (
                          <div className={styles.suggestionList}>
                            {getFundingOptions(fundingSearch).length === 0 && (
                              <div className={styles.suggestionEmpty}>
                                <p>No se encontraron entidades con ese criterio.</p>
                                <button
                                  type="button"
                                  className={styles.addNewLink}
                                  onClick={() => setIsAddFundModalOpen(true)}
                                >
                                  Agregar nuevo
                                </button>
                              </div>
                            )}
                            {getFundingOptions(fundingSearch)
                              .slice(0, 8)
                              .map((fund) => {
                                const checked = fundingFundId === fund.id
                                return (
                                  <button
                                    key={`funding-fund-${fund.id}`}
                                    type="button"
                                    className={styles.suggestionItem}
                                    onClick={() => {
                                      setFundingFundId(fund.id)
                                      setFundingSearch("")
                                    }}
                                  >
                                    <span className={styles.suggestionName}>
                                      {fund.country?.name
                                        ? `${fund.name} (${fund.country.name})`
                                        : fund.name}
                                    </span>
                                    <span className={styles.suggestionMeta}>
                                      {checked ? "Seleccionado" : ""}
                                    </span>
                                  </button>
                                )
                              })}
                          </div>
                        )}
                      </div>

                      <Input
                        label="Año"
                        name="funding-year"
                        type="number"
                        min={1900}
                        value={fundingYear}
                        onChange={(event) =>
                          setFundingYear(
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                        placeholder="Ej: 2024"
                      />

                      <Input
                        label="Monto otorgado"
                        name="funding-amount"
                        type="number"
                        min={0}
                        value={fundingAmount}
                        onChange={(event) =>
                          setFundingAmount(
                            event.target.value
                              ? Number(event.target.value)
                              : "",
                          )
                        }
                        placeholder="Ej: 50000"
                      />

                      <Select
                        label="Etapa"
                        name="funding-stage"
                        value={fundingStage}
                        onChange={(event) =>
                          setFundingStage(event.target.value as ProjectStatus)
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
                        onClick={addFundingEntry}
                        disabled={
                          !fundingFundId ||
                          !fundingYear ||
                          !fundingAmount ||
                          !fundingStage
                        }
                      >
                        Agregar
                      </Button>
                    </div>

                    {formik.values.funding.length > 0 && (
                      <div className={styles.internationalList}>
                        {formik.values.funding.map((entry, index) => {
                          const fund = funds.find(
                            (f) => f.id === entry.fundId,
                          )
                          const stageLabel = FUNDING_STAGE_OPTIONS.find(
                            (option) => option.value === entry.fundingStage,
                          )?.label
                          return (
                            <div
                              key={`funding-${index}`}
                              className={styles.internationalItem}
                            >
                              <div className={styles.internationalInfo}>
                                <p className={styles.internationalTitle}>
                                  {fund?.name ?? ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {fund?.country?.name
                                    ? `${fund.country.name}`
                                    : ""}
                                </p>
                                <p className={styles.internationalMeta}>
                                  {entry.year ? `Año ${entry.year}` : ""}
                                  {entry.amountGranted
                                    ? ` • $${entry.amountGranted}`
                                    : ""}
                                  {stageLabel ? ` • ${stageLabel}` : ""}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                className={styles.internationalRemove}
                                aria-label="Quitar"
                                onClick={() => removeFundingRow(index)}
                              >
                                X
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
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
                  {formik.values.filmingCitiesEc.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.filmingCitiesEc.map((city) => (
                        <Checkbox
                          key={`filming-city-selected-${city}`}
                          label={city}
                          variant="pill"
                          checked
                          onChange={() =>
                            handleCheckboxToggle("filmingCitiesEc", city)
                          }
                        />
                      ))}
                    </div>
                  )}

                  {filmingCitySearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredFilmingCitiesEc.length === 0 && (
                        <p className={styles.suggestionEmpty}>
                          No se encontraron ciudades con ese criterio.
                        </p>
                      )}
                      {filteredFilmingCitiesEc.slice(0, 8).map((city) => {
                        const checked =
                          formik.values.filmingCitiesEc.includes(city)
                        return (
                          <button
                            key={`filming-city-${city}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              handleCheckboxToggle("filmingCitiesEc", city)
                              setFilmingCitySearch("")
                            }}
                          >
                            <span className={styles.suggestionName}>
                              {city}
                            </span>
                            <span className={styles.suggestionMeta}>
                              {checked ? "Seleccionado" : ""}
                            </span>
                          </button>
                        )
                      })}
                    </div>
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
                  {formik.values.filmingCountries.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.filmingCountries.map((countryCode) => {
                        const country = sortedCountries.find(
                          (item) => item.code === countryCode,
                        )
                        if (!country) return null
                        return (
                          <Checkbox
                            key={`filming-country-selected-${country.code}`}
                            label={country.name}
                            variant="pill"
                            checked
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
                  )}

                  {filmingCountrySearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredFilmingCountries.length === 0 && (
                        <p className={styles.suggestionEmpty}>
                          No se encontraron países con ese criterio.
                        </p>
                      )}
                      {filteredFilmingCountries.slice(0, 8).map((country) => {
                        const checked =
                          formik.values.filmingCountries.includes(
                            country.code,
                          )
                        return (
                          <button
                            key={`filming-country-${country.code}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              handleCheckboxToggle(
                                "filmingCountries",
                                country.code,
                              )
                              setFilmingCountrySearch("")
                            }}
                          >
                            <span className={styles.suggestionName}>
                              {country.name}
                            </span>
                            <span className={styles.suggestionMeta}>
                              {checked ? "Seleccionado" : ""}
                            </span>
                          </button>
                        )
                      })}
                    </div>
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
                    currentDocumentUrl={documentUrls.dossierEn || undefined}
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
                  {(() => {
                    const usedTerritories = new Set(
                      formik.values.contentBank
                        .map((item) => item.exhibitionWindow)
                        .filter((value) => value),
                    )
                    return (
                      <>
                        <div className={styles.crewRow}>
                          <Select
                            label="Territorio"
                            name="content-territory"
                            value={contentTerritory}
                            onChange={(event) =>
                              setContentTerritory(
                                event.target.value as ExhibitionWindow,
                              )
                            }
                          >
                            <option value="">Selecciona territorio</option>
                            {EXHIBITION_WINDOW_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={usedTerritories.has(option.value)}
                              >
                                {option.label}
                              </option>
                            ))}
                          </Select>

                          <Input
                            label="Fecha de inicio de licencia"
                            name="content-start"
                            type="date"
                            value={contentStartDate}
                            onChange={(event) =>
                              setContentStartDate(event.target.value)
                            }
                          />

                          <Input
                            label="Fecha de fin de licencia"
                            name="content-end"
                            type="date"
                            value={contentEndDate}
                            onChange={(event) =>
                              setContentEndDate(event.target.value)
                            }
                          />

                          {(contentTerritory === "Internacional" ||
                            contentTerritory === "VOD") && (
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
                                    setContentGeoblockOpen((prev) => !prev)
                                  }
                                >
                                  {contentGeoblockIds.length
                                    ? `${contentGeoblockIds.length} países seleccionados`
                                    : "Selecciona países"}
                                </button>
                                {contentGeoblockOpen && (
                                  <div className={styles.dropdownMenu}>
                                    {sortedCountries.map((country) => {
                                      const checked = contentGeoblockIds.includes(
                                        country.id,
                                      )
                                      return (
                                        <label
                                          key={`geoblock-input-${country.id}`}
                                          className={styles.dropdownItem}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                              setContentGeoblockIds((prev) =>
                                                checked
                                                  ? prev.filter(
                                                      (id) => id !== country.id,
                                                    )
                                                  : [...prev, country.id],
                                              )
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
                            onClick={addContentBankEntry}
                            disabled={
                              !contentTerritory ||
                              !contentStartDate ||
                              !contentEndDate
                            }
                          >
                            Agregar
                          </Button>
                        </div>

                        {formik.values.contentBank.some(
                          (entry) =>
                            entry.exhibitionWindow &&
                            entry.licensingStartDate &&
                            entry.licensingEndDate,
                        ) && (
                          <div className={styles.internationalList}>
                            {formik.values.contentBank
                              .filter(
                                (entry) =>
                                  entry.exhibitionWindow &&
                                  entry.licensingStartDate &&
                                  entry.licensingEndDate,
                              )
                              .map((entry, index) => {
                              const territoryLabel = EXHIBITION_WINDOW_OPTIONS.find(
                                (option) => option.value === entry.exhibitionWindow,
                              )?.label
                              return (
                                <div
                                  key={`content-bank-${index}`}
                                  className={styles.internationalItem}
                                >
                                  <div className={styles.internationalInfo}>
                                    <p className={styles.internationalTitle}>
                                      {territoryLabel ?? ""}
                                    </p>
                                    <p className={styles.internationalMeta}>
                                      {entry.licensingStartDate
                                        ? `Desde ${entry.licensingStartDate}`
                                        : ""}
                                      {entry.licensingEndDate
                                        ? ` • Hasta ${entry.licensingEndDate}`
                                        : ""}
                                    </p>
                                    <p className={styles.internationalMeta}>
                                      {entry.geolocationRestrictionCountryIds.length
                                        ? `${entry.geolocationRestrictionCountryIds.length} países bloqueados`
                                        : ""}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className={styles.internationalRemove}
                                    aria-label="Quitar"
                                    onClick={() => removeContentBankRow(index)}
                                  >
                                    X
                                  </Button>
                                </div>
                                )
                              })}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
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
                  <div className={styles.label}>Subtítulos disponibles *</div>
                  <Input
                    label="Buscar subtítulo"
                    name="subtitleSearch"
                    value={subtitleSearch}
                    onChange={(event) =>
                      setSubtitleSearch(event.target.value)
                    }
                    placeholder="Buscar por nombre"
                  />
                  {formik.values.subtitles.length > 0 && (
                    <div className={styles.optionGrid}>
                      {formik.values.subtitles.map((langId) => {
                        const language = languages.find((l) => l.id === langId)
                        if (!language) return null
                        return (
                          <Checkbox
                            key={`language-selected-${language.id}`}
                            label={language.name}
                            variant="pill"
                            checked
                            onChange={() => {
                              handleCheckboxToggle("subtitles", language.id)
                              setSubtitleSearch("")
                            }}
                          />
                        )
                      })}
                    </div>
                  )}

                  {subtitleSearch.trim() && (
                    <div className={styles.suggestionList}>
                      {filteredSubtitleLanguages.length === 0 && (
                        <p className={styles.suggestionEmpty}>
                          No se encontraron idiomas con ese criterio.
                        </p>
                      )}
                      {filteredSubtitleLanguages
                        .slice(0, 8)
                        .map((lang) => {
                          const checked = formik.values.subtitles.includes(
                            lang.id,
                          )
                          return (
                            <button
                              key={`language-${lang.id}`}
                              type="button"
                              className={styles.suggestionItem}
                              onClick={() => {
                                handleCheckboxToggle("subtitles", lang.id)
                                setSubtitleSearch("")
                              }}
                            >
                              <span className={styles.suggestionName}>
                                {lang.name}
                              </span>
                              <span className={styles.suggestionMeta}>
                                {checked ? "Seleccionado" : ""}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                  {getFieldError("subtitles") && (
                    <p className={styles.error}>{getFieldError("subtitles")}</p>
                  )}
                  <p className={styles.helper}>
                    Selecciona los idiomas disponibles como subtítulos.
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
                Guarda los cambios para mantener la información actualizada.
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
                  type="button"
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  onClick={handleSaveClick}
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

        <AddCompanyModal
          isOpen={isAddCompanyModalOpen}
          onClose={() => setIsAddCompanyModalOpen(false)}
          onCompanyCreated={handleCompanyCreated}
          isLoading={isCreatingCompany}
        />

        <AddCompanyModal
          isOpen={isAddCoProducerCompanyModalOpen}
          onClose={() => setIsAddCoProducerCompanyModalOpen(false)}
          onCompanyCreated={handleCoProducerCompanyCreated}
          isLoading={isCreatingCompany}
        />

        <AddFundModal
          isOpen={isAddFundModalOpen}
          onClose={() => setIsAddFundModalOpen(false)}
          onFundCreated={handleFundCreated}
          countries={countries}
        />

        <AddExhibitionSpaceModal
          isOpen={isAddExhibitionSpaceModalOpen}
          onClose={() => setIsAddExhibitionSpaceModalOpen(false)}
          onSpaceCreated={handleExhibitionSpaceCreated}
          countries={countries}
        />

        <AddPlatformModal
          isOpen={isAddPlatformModalOpen}
          onClose={() => setIsAddPlatformModalOpen(false)}
          onPlatformCreated={handlePlatformCreated}
        />

        <AddProfessionalModal
          isOpen={isAddDirectorModalOpen}
          onClose={() => setIsAddDirectorModalOpen(false)}
          onProfessionalCreated={handleDirectorCreated}
          isLoading={isCreatingCompany}
        />

        <AddProfessionalModal
          isOpen={isAddProducerModalOpen}
          onClose={() => setIsAddProducerModalOpen(false)}
          onProfessionalCreated={handleProducerCreated}
          isLoading={isCreatingCompany}
        />

        <AddProfessionalModal
          isOpen={isAddActorModalOpen}
          onClose={() => setIsAddActorModalOpen(false)}
          onProfessionalCreated={handleActorCreated}
          isLoading={isCreatingCompany}
        />

        <AddProfessionalModal
          isOpen={isAddCrewModalOpen}
          onClose={() => setIsAddCrewModalOpen(false)}
          onProfessionalCreated={handleCrewCreated}
          isLoading={isCreatingCompany}
        />
      </main>
    </div>
  )
}
