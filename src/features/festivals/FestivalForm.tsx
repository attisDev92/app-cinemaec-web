"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Checkbox, Input, Select, Textarea } from '@/shared/components/ui'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useCities } from '@/features/catalog/hooks/useCities'
import { useProfessionals } from '@/features/professionals/hooks/useProfessionals'
import { assetService } from '@/features/assets/services/asset.service'
import { ImageUpload } from '@/shared/components/ui/ImageUpload/ImageUpload'
import { MultiImageUpload } from '@/shared/components/ui/MultiImageUpload/MultiImageUpload'
import { DocumentUpload } from '@/shared/components/ui/DocumentUpload/DocumentUpload'
import { AssetOwnerEnum, AssetTypeEnum } from '@/shared/types/enums'
import { festivalService } from './services/festival.service'
import { CreateFestivalPayload, Festival, FestivalSection } from './types'
import { Navbar } from '@/shared/components/Navbar'
import styles from './festivals.module.css'

interface FestivalFormState {
  name: string
  editionCount: string
  firstEditionYear: string
  type: string
  hostCities: number[]
  modality: string[]
  mainVenue: number | ''
  website: string
  theme: string
  producerCompanyIds: number[]
  description: string
  descriptionEn: string
  directors: number[]
  producerIds: number[]
  programmers: number[]
  classification: string
  contactName: string
  contactEmail: string
  contactPhone: string
  posterId: number | null
  trailer: string
  stillsIds: number[]
  needs: string
  needsEn: string
  dossierEsId: number | null
  dossierEnId: number | null
  sections: FestivalSection[]
  hasCall: boolean
  callProcess: string
  callLink: string
}

interface FestivalFormProps {
  festivalId?: string
}

interface UploadedImageData {
  id: number
  url: string
  localId: string
}

const INITIAL_FORM: FestivalFormState = {
  name: '',
  editionCount: '',
  firstEditionYear: '',
  type: '',
  hostCities: [],
  modality: [],
  mainVenue: '',
  website: '',
  theme: '',
  producerCompanyIds: [],
  description: '',
  descriptionEn: '',
  directors: [],
  producerIds: [],
  programmers: [],
  classification: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  posterId: null,
  trailer: '',
  stillsIds: [],
  needs: '',
  needsEn: '',
  dossierEsId: null,
  dossierEnId: null,
  sections: [],
  hasCall: false,
  callProcess: '',
  callLink: '',
}

const MODALITY_OPTIONS = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'online', label: 'En línea' },
]

const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0

const toOptionalString = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const normalizeOptionalUrl = (value: string) => {
  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

const toRequiredNumber = (value: string | number): number =>
  typeof value === 'number' ? value : Number(value)

const getRequestMessage = (value: unknown, fallback: string) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  ) {
    return value.message
  }

  return fallback
}

const mapFestivalToForm = (festival: Festival): FestivalFormState => ({
  name: festival.name,
  editionCount: String(festival.editionCount),
  firstEditionYear: String(festival.firstEditionYear),
  type: festival.type,
  hostCities: festival.hostCities ?? [],
  modality: festival.modality ?? [],
  mainVenue: festival.mainVenue,
  website: festival.website ?? '',
  theme: festival.theme,
  producerCompanyIds: festival.producerCompanyIds ?? [],
  description: festival.description ?? '',
  descriptionEn: festival.descriptionEn ?? '',
  directors: festival.directors ?? [],
  producerIds: festival.producerIds ?? [],
  programmers: festival.programmers ?? [],
  classification: festival.classification,
  contactName: festival.contactName,
  contactEmail: festival.contactEmail,
  contactPhone: festival.contactPhone,
  posterId: festival.posterId ?? null,
  trailer: festival.trailer ?? '',
  stillsIds: festival.stillsIds ?? [],
  needs: festival.needs ?? '',
  needsEn: festival.needsEn ?? '',
  dossierEsId: festival.dossierEsId ?? null,
  dossierEnId: festival.dossierEnId ?? null,
  sections: festival.sections ?? [],
  hasCall: festival.hasCall,
  callProcess: festival.callProcess ?? '',
  callLink: festival.callLink ?? '',
})

export default function FestivalForm({ festivalId }: FestivalFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [form, setForm] = useState<FestivalFormState>(INITIAL_FORM)
  const [directorSearch, setDirectorSearch] = useState('')
  const [producerSearch, setProducerSearch] = useState('')
  const [programmerSearch, setProgrammerSearch] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [hostCitiesSearch, setHostCitiesSearch] = useState('')
  const [mainVenueSearch, setMainVenueSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingFestival, setLoadingFestival] = useState(
    Boolean(festivalId && festivalId !== 'new'),
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null)
  const [stillsPreviewImages, setStillsPreviewImages] = useState<UploadedImageData[]>([])
  const [dossierEsPreviewUrl, setDossierEsPreviewUrl] = useState<string | null>(null)
  const [dossierEnPreviewUrl, setDossierEnPreviewUrl] = useState<string | null>(null)

  const tabs = [
    { id: 'basic', label: 'Información básica' },
    { id: 'materials', label: 'Imágenes y links' },
    { id: 'team', label: 'Equipo' },
    { id: 'sections', label: 'Secciones y Secciones competitivas' },
    { id: 'call', label: 'Convocatoria' },
  ]

  const { cities } = useCities()
  const { professionals } = useProfessionals()
  const { companies } = useCompanies()

  const isEditing = Boolean(festivalId && festivalId !== 'new')

  useEffect(() => {
    if (!isEditing || !festivalId) {
      setLoadingFestival(false)
      return
    }

    let cancelled = false

    const loadFestival = async () => {
      try {
        setLoadingFestival(true)
        setError(null)
        const festival = await festivalService.getById(Number(festivalId))

        const [posterUrl, stillsImages, dossierEsUrl, dossierEnUrl] = await Promise.all([
          festival.posterId
            ? assetService
                .getAsset(festival.posterId)
                .then((asset) => assetService.getPublicAssetUrl(asset))
                .catch(() => null)
            : Promise.resolve(null),
          festival.stillsIds && festival.stillsIds.length > 0
            ? Promise.all(
                festival.stillsIds.map(async (assetId) => {
                  try {
                    const asset = await assetService.getAsset(assetId)
                    return {
                      id: asset.id,
                      url: assetService.getPublicAssetUrl(asset),
                      localId: `existing-${asset.id}`,
                    }
                  } catch {
                    return null
                  }
                }),
              ).then((images) => images.filter((image): image is UploadedImageData => image !== null))
            : Promise.resolve([] as UploadedImageData[]),
          festival.dossierEsId
            ? assetService
                .getAsset(festival.dossierEsId)
                .then((asset) => assetService.getPublicAssetUrl(asset))
                .catch(() => null)
            : Promise.resolve(null),
          festival.dossierEnId
            ? assetService
                .getAsset(festival.dossierEnId)
                .then((asset) => assetService.getPublicAssetUrl(asset))
                .catch(() => null)
            : Promise.resolve(null),
        ])

        if (!cancelled) {
          setForm(mapFestivalToForm(festival))
          setPosterPreviewUrl(posterUrl)
          setStillsPreviewImages(stillsImages)
          setDossierEsPreviewUrl(dossierEsUrl)
          setDossierEnPreviewUrl(dossierEnUrl)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getRequestMessage(
              requestError,
              'No se pudo cargar el festival para editar.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingFestival(false)
        }
      }
    }

    void loadFestival()

    return () => {
      cancelled = true
    }
  }, [festivalId, isEditing])

  const sortedProfessionals = useMemo(
    () => [...professionals].sort((a, b) => a.name.localeCompare(b.name)),
    [professionals],
  )
  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.name.localeCompare(b.name)),
    [companies],
  )
  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  )

  const filteredProfessionals = (search: string) => {
    const query = search.trim().toLowerCase()
    if (!query) return []

    return sortedProfessionals.filter((professional) =>
      professional.name.toLowerCase().includes(query),
    )
  }

  const filteredCompanies = useMemo(() => {
    const query = companySearch.trim().toLowerCase()
    if (!query) return []

    return sortedCompanies.filter((company) =>
      company.name.toLowerCase().includes(query),
    )
  }, [companySearch, sortedCompanies])

  const filteredHostCities = useMemo(() => {
    const query = hostCitiesSearch.trim().toLowerCase()
    if (!query) return sortedCities
    return sortedCities.filter((city) => city.name.toLowerCase().includes(query))
  }, [hostCitiesSearch, sortedCities])

  const filteredMainVenueCities = useMemo(() => {
    const query = mainVenueSearch.trim().toLowerCase()
    if (!query) return sortedCities
    return sortedCities.filter((city) => city.name.toLowerCase().includes(query))
  }, [mainVenueSearch, sortedCities])

  const selectedMainVenue =
    form.mainVenue === ''
      ? null
      : cities.find((city) => city.id === form.mainVenue) ?? null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target
    const { name, value } = target

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: target.checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleNumberSelection = (
    field: 'hostCities' | 'producerCompanyIds' | 'directors' | 'producerIds' | 'programmers',
    id: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((currentId) => currentId !== id)
        : [...prev[field], id],
    }))
  }

  const toggleModality = (value: string) => {
    setForm((prev) => ({
      ...prev,
      modality: prev.modality.includes(value)
        ? prev.modality.filter((currentValue) => currentValue !== value)
        : [...prev.modality, value],
    }))
  }

  const handlePosterUpload = (id: number) => {
    setForm((prev) => ({ ...prev, posterId: id }))
  }

  const handlePosterRemove = () => {
    setForm((prev) => ({ ...prev, posterId: null }))
    setPosterPreviewUrl(null)
  }

  const handlePosterUploadComplete = (id: number, url: string) => {
    handlePosterUpload(id)
    setPosterPreviewUrl(url)
  }

  const handleStillsUpload = (ids: number[]) => {
    setForm((prev) => ({ ...prev, stillsIds: ids }))
  }

  const handleDossierEsUpload = (id: number, url: string) => {
    setForm((prev) => ({ ...prev, dossierEsId: id }))
    setDossierEsPreviewUrl(url)
  }

  const handleDossierEnUpload = (id: number, url: string) => {
    setForm((prev) => ({ ...prev, dossierEnId: id }))
    setDossierEnPreviewUrl(url)
  }

  const handleDossierEsRemove = () => {
    setForm((prev) => ({ ...prev, dossierEsId: null }))
    setDossierEsPreviewUrl(null)
  }

  const handleDossierEnRemove = () => {
    setForm((prev) => ({ ...prev, dossierEnId: null }))
    setDossierEnPreviewUrl(null)
  }

  const handleAddSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { name: '', competitive: false }],
    }))
  }

  const handleRemoveSection = (index: number) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  const handleSectionChange = (
    index: number,
    field: keyof FestivalSection,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentIndex) =>
        currentIndex === index ? { ...section, [field]: value } : section,
      ),
    }))
  }

  const buildPayload = (): CreateFestivalPayload => ({
    name: form.name.trim(),
    editionCount: toRequiredNumber(form.editionCount),
    firstEditionYear: toRequiredNumber(form.firstEditionYear),
    type: form.type.trim(),
    hostCities: form.hostCities,
    modality: form.modality,
    mainVenue: toRequiredNumber(form.mainVenue),
    website: normalizeOptionalUrl(form.website),
    theme: form.theme.trim(),
    producerCompanyIds: form.producerCompanyIds,
    description: form.description.trim(),
    descriptionEn: toOptionalString(form.descriptionEn),
    directors: form.directors,
    producerIds: form.producerIds,
    programmers: form.programmers,
    classification: form.classification.trim(),
    contactName: form.contactName.trim(),
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim(),
    posterId: form.posterId,
    trailer: toOptionalString(form.trailer),
    stillsIds: form.stillsIds,
    needs: toOptionalString(form.needs),
    needsEn: toOptionalString(form.needsEn),
    dossierEsId: form.dossierEsId,
    dossierEnId: form.dossierEnId,
    sections: form.sections.filter((section) => isNonEmptyString(section.name)),
    hasCall: form.hasCall,
    callProcess: toOptionalString(form.callProcess),
    callLink: normalizeOptionalUrl(form.callLink),
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.editionCount.trim()) {
      setError('El número de ediciones es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.firstEditionYear.trim()) {
      setError('El año de la primera edición es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.type.trim()) {
      setError('El tipo es obligatorio')
      setActiveTab(0)
      return
    }

    if (form.hostCities.length === 0) {
      setError('Selecciona al menos una ciudad sede')
      setActiveTab(0)
      return
    }

    if (form.modality.length === 0) {
      setError('Selecciona al menos una modalidad')
      setActiveTab(0)
      return
    }

    if (form.mainVenue === '') {
      setError('La sede principal es obligatoria')
      setActiveTab(0)
      return
    }

    if (!form.theme.trim()) {
      setError('La temática es obligatoria')
      setActiveTab(0)
      return
    }

    if (!form.classification.trim()) {
      setError('La clasificación es obligatoria')
      setActiveTab(0)
      return
    }

    if (!form.contactName.trim()) {
      setError('El nombre de contacto es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.contactEmail.trim()) {
      setError('El correo electrónico es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.contactPhone.trim()) {
      setError('El teléfono es obligatorio')
      setActiveTab(0)
      return
    }

    if (!form.description.trim()) {
      setError('La descripción es obligatoria')
      setActiveTab(0)
      return
    }

    const payload = buildPayload()

    try {
      setSaving(true)
      const savedFestival = isEditing && festivalId
        ? await festivalService.update(Number(festivalId), payload)
        : await festivalService.create(payload)

      setSuccess(true)

      if (!isEditing) {
        router.replace(`/festivals-management/edit/${savedFestival.id}`)
      }
    } catch (requestError) {
      setError(
        getRequestMessage(
          requestError,
          'No se pudo guardar el festival. Intenta nuevamente.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  const renderSelectedPeople = (
    ids: number[],
    field: 'directors' | 'producerIds' | 'programmers',
  ) => {
    if (ids.length === 0) return null

    return (
      <div className={styles.optionGrid}>
        {ids.map((id) => {
          const professional = sortedProfessionals.find((item) => item.id === id)
          if (!professional) return null

          return (
            <Checkbox
              key={`${field}-${id}`}
              label={professional.name}
              variant="pill"
              checked
              onChange={() => toggleNumberSelection(field, id)}
            />
          )
        })}
      </div>
    )
  }

  const renderProfessionalSuggestions = (
    search: string,
    field: 'directors' | 'producerIds' | 'programmers',
    clearSearch: () => void,
  ) => {
    if (!search.trim()) return null

    const results = filteredProfessionals(search)

    return (
      <div className={styles.suggestionList}>
        {results.length === 0 && (
          <div className={styles.suggestionEmpty}>
            No se encontraron profesionales con ese criterio.
          </div>
        )}
        {results.slice(0, 8).map((professional) => {
          const checked = form[field].includes(professional.id)
          return (
            <button
              key={`${field}-suggestion-${professional.id}`}
              type="button"
              className={styles.suggestionItem}
              onClick={() => {
                toggleNumberSelection(field, professional.id)
                clearSearch()
              }}
            >
              <span className={styles.suggestionName}>{professional.name}</span>
              <span className={styles.suggestionMeta}>
                {checked ? 'Seleccionado' : ''}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  if (loadingFestival) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <Card title="Cargando festival">
            <p className={styles.feedbackInfo}>
              Se está cargando la información del registro.
            </p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h2 className={styles.title}>
          {isEditing ? 'Editar' : 'Crear'} Festival / Proyecto
        </h2>
        <div className={styles.tabs}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={styles.tab + (activeTab === index ? ' ' + styles.active : '')}
              type="button"
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {activeTab === 0 && (
            <>
              <Card title="Datos generales">
                <div style={{ display: 'grid', gap: 20 }}>
                  <Input label="Nombre *" name="name" value={form.name} onChange={handleChange} required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <Input label="N° de ediciones *" name="editionCount" type="number" value={form.editionCount} onChange={handleChange} required />
                    <Input label="Año de la primera edición *" name="firstEditionYear" type="number" value={form.firstEditionYear} onChange={handleChange} required />
                    <Select
                      label="Tipo *"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      options={[
                        { value: '', label: 'Selecciona tipo' },
                        { value: 'Festival', label: 'Festival' },
                        { value: 'Muestra', label: 'Muestra' },
                        { value: 'Ciclo', label: 'Ciclo' },
                        { value: 'Proyecto de exhibición', label: 'Proyecto de exhibición' },
                        { value: 'Proyecto de distribución', label: 'Proyecto de distribución' },
                      ]}
                    />
                    <div className={styles.fieldBlock}>
                      <div className={styles.fieldLabel}>Modalidad *</div>
                      <div className={styles.optionGrid}>
                        {MODALITY_OPTIONS.map((option) => (
                          <Checkbox
                            key={option.value}
                            label={option.label}
                            variant="pill"
                            checked={form.modality.includes(option.value)}
                            onChange={() => toggleModality(option.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabel}>Ciudades sede *</div>
                    <Input
                      placeholder="Buscar ciudad..."
                      value={hostCitiesSearch}
                      onChange={(event) => setHostCitiesSearch(event.target.value)}
                    />
                    {form.hostCities.length > 0 && (
                      <div className={styles.optionGrid}>
                        {form.hostCities.map((id) => {
                          const city = cities.find((item) => item.id === id)
                          if (!city) return null
                          return (
                            <Checkbox
                              key={`host-city-${id}`}
                              label={city.name}
                              variant="pill"
                              checked
                              onChange={() => toggleNumberSelection('hostCities', id)}
                            />
                          )
                        })}
                      </div>
                    )}
                    {hostCitiesSearch.trim() && (
                      <div className={styles.suggestionList}>
                        {filteredHostCities.length === 0 && (
                          <div className={styles.suggestionEmpty}>
                            No se encontraron ciudades con ese criterio.
                          </div>
                        )}
                        {filteredHostCities.slice(0, 8).map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              if (!form.hostCities.includes(city.id)) {
                                toggleNumberSelection('hostCities', city.id)
                              }
                              setHostCitiesSearch('')
                            }}
                          >
                            <span className={styles.suggestionName}>{city.name}</span>
                            <span className={styles.suggestionMeta}>
                              {form.hostCities.includes(city.id) ? 'Seleccionada' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabel}>Sede principal *</div>
                    <Input
                      placeholder="Buscar ciudad..."
                      value={mainVenueSearch}
                      onChange={(event) => setMainVenueSearch(event.target.value)}
                    />
                    {selectedMainVenue && (
                      <div className={styles.optionGrid}>
                        <Checkbox
                          label={selectedMainVenue.name}
                          variant="pill"
                          checked
                          onChange={() => setForm((prev) => ({ ...prev, mainVenue: '' }))}
                        />
                      </div>
                    )}
                    {mainVenueSearch.trim() && (
                      <div className={styles.suggestionList}>
                        {filteredMainVenueCities.length === 0 && (
                          <div className={styles.suggestionEmpty}>
                            No se encontraron ciudades con ese criterio.
                          </div>
                        )}
                        {filteredMainVenueCities.slice(0, 8).map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, mainVenue: city.id }))
                              setMainVenueSearch('')
                            }}
                          >
                            <span className={styles.suggestionName}>{city.name}</span>
                            <span className={styles.suggestionMeta}>
                              {form.mainVenue === city.id ? 'Seleccionada' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Select
                    label="Clasificación *"
                    name="classification"
                    value={form.classification}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Selecciona clasificación' },
                      { value: 'general_audience', label: 'Todo público' },
                      { value: 'recommended_0_6', label: 'Recomendada 0 a 6' },
                      { value: 'recommended_6_12', label: 'Recomendada 6 a 12' },
                      { value: 'under_12_supervision', label: 'Menores de 12 con supervisión' },
                      { value: 'over_12', label: 'Mayores de 12' },
                      { value: 'over_15', label: 'Mayores de 15' },
                      { value: 'adults_only_18', label: 'Solo adultos 18+' },
                      { value: 'not_specified', label: 'No especificado' },
                    ]}
                  />
                  <Input label="Temática *" name="theme" value={form.theme} onChange={handleChange} required />

                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabel}>Productoras</div>
                    <Input
                      placeholder="Buscar productora..."
                      value={companySearch}
                      onChange={(event) => setCompanySearch(event.target.value)}
                    />
                    {form.producerCompanyIds.length > 0 && (
                      <div className={styles.optionGrid}>
                        {form.producerCompanyIds.map((id) => {
                          const company = companies.find((item) => item.id === id)
                          if (!company) return null
                          return (
                            <Checkbox
                              key={`company-${id}`}
                              label={company.name}
                              variant="pill"
                              checked
                              onChange={() => toggleNumberSelection('producerCompanyIds', id)}
                            />
                          )
                        })}
                      </div>
                    )}
                    {companySearch.trim() && (
                      <div className={styles.suggestionList}>
                        {filteredCompanies.length === 0 && (
                          <div className={styles.suggestionEmpty}>
                            No se encontraron productoras con ese criterio.
                          </div>
                        )}
                        {filteredCompanies.slice(0, 8).map((company) => (
                          <button
                            key={`company-suggestion-${company.id}`}
                            type="button"
                            className={styles.suggestionItem}
                            onClick={() => {
                              toggleNumberSelection('producerCompanyIds', company.id)
                              setCompanySearch('')
                            }}
                          >
                            <span className={styles.suggestionName}>{company.name}</span>
                            <span className={styles.suggestionMeta}>
                              {form.producerCompanyIds.includes(company.id) ? 'Seleccionada' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="Contacto">
                <Input label="Nombre *" name="contactName" value={form.contactName} onChange={handleChange} required />
                <Input label="Correo electrónico *" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required />
                <Input label="Teléfono *" name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} required />
              </Card>

              <Card title="Descripción">
                <Textarea
                  label="Descripción *"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  required
                  maxLength={300}
                  helper={`${form.description.length}/300`}
                />
                <Textarea
                  label="Descripción (inglés)"
                  name="descriptionEn"
                  value={form.descriptionEn}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  helper={`${form.descriptionEn.length}/300`}
                />
              </Card>

              <Card title="Necesidades del proyecto">
                <Textarea
                  label="Necesidades"
                  name="needs"
                  value={form.needs}
                  onChange={handleChange}
                  rows={2}
                  maxLength={300}
                  helper={`${form.needs.length}/300`}
                />
                <Textarea
                  label="Necesidades (inglés)"
                  name="needsEn"
                  value={form.needsEn}
                  onChange={handleChange}
                  rows={2}
                  maxLength={300}
                  helper={`${form.needsEn.length}/300`}
                />
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <Card title="Materiales y links">
              <Input label="Sitio web" name="website" type="text" value={form.website} onChange={handleChange} placeholder="www.ejemplo.com o https://ejemplo.com" />
              <ImageUpload
                label="Afiche"
                documentType={AssetTypeEnum.IMAGE}
                ownerType={AssetOwnerEnum.MOVIE_POSTER}
                currentImageUrl={posterPreviewUrl ?? undefined}
                onUploadComplete={handlePosterUploadComplete}
                onRemove={handlePosterRemove}
              />
              <Input label="Link de tráiler" name="trailer" value={form.trailer} onChange={handleChange} />
              <MultiImageUpload
                label="Fotos (stills)"
                documentType={AssetTypeEnum.IMAGE}
                ownerType={AssetOwnerEnum.MOVIE_STILLS}
                currentImages={stillsPreviewImages}
                onImagesChange={handleStillsUpload}
              />
              <DocumentUpload
                label="Dossier español"
                documentType={AssetTypeEnum.DOCUMENT}
                ownerType={AssetOwnerEnum.MOVIE_DOSSIER}
                currentDocumentUrl={dossierEsPreviewUrl ?? undefined}
                onUploadComplete={handleDossierEsUpload}
                onRemove={handleDossierEsRemove}
              />
              <DocumentUpload
                label="Dossier inglés"
                documentType={AssetTypeEnum.DOCUMENT}
                ownerType={AssetOwnerEnum.MOVIE_DOSSIER_EN}
                currentDocumentUrl={dossierEnPreviewUrl ?? undefined}
                onUploadComplete={handleDossierEnUpload}
                onRemove={handleDossierEnRemove}
              />
            </Card>
          )}

          {activeTab === 2 && (
            <Card title="Equipo">
              <div className={styles.fieldBlock}>
                <div className={styles.fieldLabel}>Directores</div>
                <Input placeholder="Buscar director..." value={directorSearch} onChange={(event) => setDirectorSearch(event.target.value)} />
                {renderSelectedPeople(form.directors, 'directors')}
                {renderProfessionalSuggestions(directorSearch, 'directors', () => setDirectorSearch(''))}
              </div>

              <div className={styles.fieldBlock}>
                <div className={styles.fieldLabel}>Productores</div>
                <Input placeholder="Buscar productor..." value={producerSearch} onChange={(event) => setProducerSearch(event.target.value)} />
                {renderSelectedPeople(form.producerIds, 'producerIds')}
                {renderProfessionalSuggestions(producerSearch, 'producerIds', () => setProducerSearch(''))}
              </div>

              <div className={styles.fieldBlock}>
                <div className={styles.fieldLabel}>Programadores</div>
                <Input placeholder="Buscar programador..." value={programmerSearch} onChange={(event) => setProgrammerSearch(event.target.value)} />
                {renderSelectedPeople(form.programmers, 'programmers')}
                {renderProfessionalSuggestions(programmerSearch, 'programmers', () => setProgrammerSearch(''))}
              </div>
            </Card>
          )}

          {activeTab === 3 && (
            <Card title="Secciones">
              {form.sections.map((section, index) => (
                <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <Input label="Nombre de la sección" name={`section-name-${index}`} value={section.name} onChange={(event) => handleSectionChange(index, 'name', event.target.value)} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={section.competitive} onChange={(event) => handleSectionChange(index, 'competitive', event.target.checked)} /> Competitiva
                  </label>
                  <Button type="button" onClick={() => handleRemoveSection(index)} style={{ background: '#eee', color: '#333' }}>
                    Eliminar
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddSection} style={{ marginTop: 8 }}>
                Agregar sección
              </Button>
            </Card>
          )}

          {activeTab === 4 && (
            <Card title="Convocatoria">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" name="hasCall" checked={form.hasCall} onChange={handleChange} id="hasCall" />
                <label htmlFor="hasCall">¿Tiene convocatoria?</label>
              </div>
              {form.hasCall && (
                <>
                  <Input label="Proceso de convocatoria" name="callProcess" value={form.callProcess} onChange={handleChange} />
                  <Input label="Link de convocatoria" name="callLink" type="text" value={form.callLink} onChange={handleChange} placeholder="www.ejemplo.com o https://ejemplo.com" />
                </>
              )}
            </Card>
          )}

          {error && <div className={styles.feedbackError}>{error}</div>}
          {success && <div className={styles.feedbackSuccess}>¡Guardado correctamente!</div>}
          <Button type="submit" isLoading={saving} style={{ marginTop: 8, fontWeight: 600, fontSize: 16 }}>
            Guardar
          </Button>
        </form>
      </main>
    </div>
  )
}