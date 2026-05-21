"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { useAuth } from "@/features/auth/hooks"
import { useCinematicRoles, useRoleCategories } from "@/features/catalog"
import {
  professionalsService,
  type ProfessionalMovieParticipation,
} from "@/features/professionals"
import { movieService, type Movie } from "@/features/movies"
import { assetService } from "@/features/assets/services/asset.service"
import { Navbar } from "@/shared/components/Navbar"
import {
  Button,
  Card,
  ImageUpload,
  Input,
  MultiImageUpload,
  Select,
  Textarea,
} from "@/shared/components/ui"
import { AssetOwnerEnum, AssetTypeEnum } from "@/shared/types"
import styles from "./page.module.css"

type LocalParticipation = {
  localId: string
  movieId: number
  cinematicRoleId: number
  movieTitle?: string
  cinematicRoleName?: string
}

export default function EditProfessionalProfilePage() {
  const MOBILE_PATTERN = /^\+?[0-9()\-\s]{7,30}$/

  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { categories } = useRoleCategories()
  const { roles } = useCinematicRoles()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [professionalId, setProfessionalId] = useState<number | null>(null)

  const [name, setName] = useState("")
  const [dniNumber, setDniNumber] = useState("")
  const [nickName, setNickName] = useState("")
  const [phone, setPhone] = useState("")
  const [mobile, setMobile] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [rrss, setRrss] = useState("")
  const [reelLink, setReelLink] = useState("")
  const [companyNameCEO, setCompanyNameCEO] = useState("")
  const [bio, setBio] = useState("")
  const [bioEn, setBioEn] = useState("")
  const [bioError, setBioError] = useState("")
  const [bioEnError, setBioEnError] = useState("")
  const [mobileError, setMobileError] = useState("")
  const [profilePhotoError, setProfilePhotoError] = useState("")
  const [extendedBiofilmography, setExtendedBiofilmography] = useState("")
  const [extendedBioError, setExtendedBioError] = useState("")
  const [profilePhotoAssetId, setProfilePhotoAssetId] = useState<number | null>(
    null,
  )
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [portfolioCurrentImages, setPortfolioCurrentImages] = useState<
    Array<{ id: number; url: string; localId: string }>
  >([])
  const [portfolioImageAssetIds, setPortfolioImageAssetIds] = useState<number[]>(
    [],
  )
  const [primaryArea1, setPrimaryArea1] = useState("")
  const [primaryRole1, setPrimaryRole1] = useState("")
  const [primaryArea2, setPrimaryArea2] = useState("")
  const [primaryRole2, setPrimaryRole2] = useState("")
  const [secondaryArea1, setSecondaryArea1] = useState("")
  const [secondaryRole1, setSecondaryRole1] = useState("")
  const [secondaryArea2, setSecondaryArea2] = useState("")
  const [secondaryRole2, setSecondaryRole2] = useState("")

  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false)
  const [loadErrorMessages, setLoadErrorMessages] = useState<string[]>([])
  const [movieSearch, setMovieSearch] = useState("")
  const [participationMovieId, setParticipationMovieId] = useState("")
  const [participationRoleId, setParticipationRoleId] = useState("")
  const [participationEntries, setParticipationEntries] = useState<
    LocalParticipation[]
  >([])

  const [imdbProfile, setImdbProfile] = useState("")

  const openLoadErrorModal = (messages: string[]) => {
    setLoadErrorMessages(messages)
    setShowLoadErrorModal(true)
  }

  const closeLoadErrorModal = () => {
    setShowLoadErrorModal(false)
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoadingMovies(true)
        const data = await movieService.getAll()
        setMovies(data)
      } catch (err) {
        console.error(err)
        openLoadErrorModal([
          "No se pudo cargar el listado de películas.",
          "Revisa tu conexión y vuelve a intentarlo.",
        ])
      } finally {
        setIsLoadingMovies(false)
      }
    }

    loadMovies()
  }, [])

  useEffect(() => {
    const loadEditableData = async () => {
      if (!user || authLoading) {
        return
      }

      try {
        setIsLoading(true)
        const claimData = await professionalsService.checkClaimByCedula()

        if (!claimData.alreadyClaimedByYou || !claimData.professionalId) {
          router.push("/professional-profile")
          return
        }

        setProfessionalId(claimData.professionalId)

        const [professional, participations, profilePhotoAssets, portfolioAssets] =
          await Promise.all([
          professionalsService.getById(claimData.professionalId),
          professionalsService.getMovieParticipations(claimData.professionalId),
          assetService.getAssetsByOwner(
            AssetOwnerEnum.PROFESSIONAL_PROFILE_PHOTO,
            claimData.professionalId,
          ),
          assetService.getAssetsByOwner(
            AssetOwnerEnum.PROFESSIONAL_PORTFOLIO_IMAGE,
            claimData.professionalId,
          ),
        ])

        setName(professional.name || "")
        setDniNumber(professional.dniNumber || claimData.dniNumber || "")
        setNickName(professional.nickName || "")
        setPhone(professional.phone || "")
        setMobile(professional.mobile || "")
        setWebsite(professional.website || "")
        setLinkedin(professional.linkedin || "")
        setRrss(professional.rrss || "")
        setReelLink(professional.reelLink || "")
        setCompanyNameCEO(professional.companyNameCEO || "")
        setBio(professional.bio || "")
        setBioEn(professional.bioEn || "")
        setExtendedBiofilmography(professional.extendedBiofilmography || "")
        setImdbProfile(professional.imdbProfile || "")
        setPrimaryRole1(
          professional.primaryActivityRoleId1
            ? String(professional.primaryActivityRoleId1)
            : "",
        )
        setPrimaryRole2(
          professional.primaryActivityRoleId2
            ? String(professional.primaryActivityRoleId2)
            : "",
        )
        setSecondaryRole1(
          professional.secondaryActivityRoleId1
            ? String(professional.secondaryActivityRoleId1)
            : "",
        )
        setSecondaryRole2(
          professional.secondaryActivityRoleId2
            ? String(professional.secondaryActivityRoleId2)
            : "",
        )

        const profilePhotoAssetFromProfessional =
          professional.profilePhotoAssetId
            ? await assetService
                .getAsset(professional.profilePhotoAssetId)
                .catch(() => null)
            : null
        const profilePhotoAssetFallback =
          profilePhotoAssets.find((asset) => asset.userId === user.id) || null
        const profilePhotoAsset =
          profilePhotoAssetFromProfessional || profilePhotoAssetFallback
        setProfilePhotoAssetId(profilePhotoAsset?.id || null)
        setProfilePhotoUrl(
          profilePhotoAsset ? assetService.getPublicAssetUrl(profilePhotoAsset) : null,
        )

        const mappedPortfolioImages = portfolioAssets.map((asset) => ({
          id: asset.id,
          url: assetService.getPublicAssetUrl(asset),
          localId: `existing-${asset.id}`,
        }))
        setPortfolioCurrentImages(mappedPortfolioImages)
        setPortfolioImageAssetIds(mappedPortfolioImages.map((img) => img.id))

        setParticipationEntries(
          participations.map((entry: ProfessionalMovieParticipation) => ({
            localId: `existing-${entry.id}`,
            movieId: entry.movieId,
            cinematicRoleId: entry.cinematicRoleId,
            movieTitle: entry.movieTitle,
            cinematicRoleName: entry.cinematicRoleName,
          })),
        )
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo cargar la edición del perfil"

        setError(message)
        openLoadErrorModal([
          "Ocurrió un error al cargar los datos del perfil.",
          message,
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadEditableData()
  }, [user, authLoading, router])

  useEffect(() => {
    if (!showLoadErrorModal) {
      document.body.style.overflow = ""
      return
    }

    document.body.style.overflow = "hidden"

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLoadErrorModal()
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEscape)
    }
  }, [showLoadErrorModal])

  useEffect(() => {
    if (roles.length === 0) {
      return
    }

    let hasInvalidPersistedRole = false

    const syncRoleAndArea = (
      roleIdValue: string,
      currentAreaValue: string,
      setRole: React.Dispatch<React.SetStateAction<string>>,
      setArea: React.Dispatch<React.SetStateAction<string>>,
    ) => {
      if (!roleIdValue) {
        return
      }

      const role = roles.find((item) => item.id === Number(roleIdValue))

      // If persisted role ID no longer exists in catalog, clear that slot.
      if (!role) {
        hasInvalidPersistedRole = true
        setRole("")
        setArea("")
        return
      }

      const nextAreaValue = role.idRoleCategory
        ? String(role.idRoleCategory)
        : ""

      if (nextAreaValue !== currentAreaValue) {
        setArea(nextAreaValue)
      }
    }

    syncRoleAndArea(primaryRole1, primaryArea1, setPrimaryRole1, setPrimaryArea1)
    syncRoleAndArea(primaryRole2, primaryArea2, setPrimaryRole2, setPrimaryArea2)
    syncRoleAndArea(
      secondaryRole1,
      secondaryArea1,
      setSecondaryRole1,
      setSecondaryArea1,
    )
    syncRoleAndArea(
      secondaryRole2,
      secondaryArea2,
      setSecondaryRole2,
      setSecondaryArea2,
    )

    if (hasInvalidPersistedRole) {
      setError((prev) =>
        prev ||
        "Algunos roles guardados ya no existen en el catálogo. Vuelve a seleccionarlos y guarda.",
      )
    } else if (
      error ===
      "Algunos roles guardados ya no existen en el catálogo. Vuelve a seleccionarlos y guarda."
    ) {
      setError("")
    }
  }, [
    roles,
    primaryRole1,
    primaryRole2,
    secondaryRole1,
    secondaryRole2,
    primaryArea1,
    primaryArea2,
    secondaryArea1,
    secondaryArea2,
    error,
  ])

  const selectedMovieTitle = participationMovieId
    ? movies.find((movie) => movie.id === Number(participationMovieId))?.title
    : undefined

  const filteredMovies = useMemo(() => {
    if (!movieSearch.trim()) {
      return []
    }

    return movies
      .filter((movie) =>
        movie.title.toLowerCase().includes(movieSearch.trim().toLowerCase()),
      )
      .slice(0, 8)
  }, [movieSearch, movies])

  const shouldShowMovieSearchList =
    movieSearch.trim() && movieSearch.trim() !== selectedMovieTitle

  const handleAddParticipation = () => {
    if (!participationMovieId || !participationRoleId) {
      setError("Selecciona una película y un rol")
      return
    }

    const movieId = Number(participationMovieId)
    const roleId = Number(participationRoleId)

    const isDuplicate = participationEntries.some(
      (entry) => entry.movieId === movieId && entry.cinematicRoleId === roleId,
    )

    if (isDuplicate) {
      setError("Esta participación ya fue agregada")
      return
    }

    const movie = movies.find((item) => item.id === movieId)
    const role = roles.find((item) => item.id === roleId)

    setParticipationEntries((prev) => [
      ...prev,
      {
        localId: `${Date.now()}-${movieId}-${roleId}`,
        movieId,
        cinematicRoleId: roleId,
        movieTitle: movie?.title,
        cinematicRoleName: role?.name,
      },
    ])
    setParticipationMovieId("")
    setParticipationRoleId("")
    setMovieSearch("")
    setError("")
  }

  const handleRemoveParticipation = (localId: string) => {
    setParticipationEntries((prev) =>
      prev.filter((entry) => entry.localId !== localId),
    )
  }

  const handleSave = async () => {
    setBioError("")
    setBioEnError("")
    setMobileError("")
    setProfilePhotoError("")

    if (!professionalId) {
      return
    }

    let hasError = false

    const trimmedMobile = mobile.trim()
    const trimmedBio = bio.trim()
    const trimmedExtendedBio = extendedBiofilmography.trim()

    if (trimmedMobile && !MOBILE_PATTERN.test(trimmedMobile)) {
      setMobileError("Ingresa un número de celular válido")
      hasError = true
    }

    if (!profilePhotoAssetId) {
      setProfilePhotoError("La foto de perfil es obligatoria")
      hasError = true
    }

    if (!trimmedBio) {
      setBioError("La biofilmografía en español es obligatoria")
      hasError = true
    }

    if (bio.length > 300) {
      setBioError("Máximo 300 caracteres")
      hasError = true
    }

    if (bioEn.length > 300) {
      setBioEnError("Máximo 300 caracteres")
      hasError = true
    }

    if (!trimmedExtendedBio) {
      setExtendedBioError("Este campo es obligatorio");
      hasError = true;
    } else if (extendedBiofilmography.length > 1000) {
      setExtendedBioError("Máximo 1000 caracteres");
      hasError = true;
    } else {
      setExtendedBioError("");
    }

    if (hasError) {
      setError("Revisa los campos obligatorios y los límites de caracteres.")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      await Promise.all([
        professionalsService.update(professionalId, {
          name: name.trim(),
          nickName: nickName.trim() || null,
          phone: phone.trim() || null,
          mobile: trimmedMobile || null,
          website: website.trim() || null,
          linkedin: linkedin.trim() || null,
          rrss: rrss.trim() || null,
          reelLink: reelLink.trim() || null,
          profilePhotoAssetId,
          primaryActivityRoleId1: primaryRole1 ? Number(primaryRole1) : null,
          primaryActivityRoleId2: primaryRole2 ? Number(primaryRole2) : null,
          secondaryActivityRoleId1: secondaryRole1
            ? Number(secondaryRole1)
            : null,
          secondaryActivityRoleId2: secondaryRole2
            ? Number(secondaryRole2)
            : null,
          portfolioImageAssetIds,
          companyNameCEO: companyNameCEO.trim() || null,
          bio: trimmedBio,
          bioEn: bioEn.trim() || null,
          extendedBiofilmography: trimmedExtendedBio,
          imdbProfile: imdbProfile.trim() || null,
        }),
        professionalsService.updateMovieParticipations(
          professionalId,
          participationEntries.map((entry) => ({
            movieId: entry.movieId,
            cinematicRoleId: entry.cinematicRoleId,
          })),
        ),
      ])

      setMessage("Perfil actualizado correctamente")
      setTimeout(() => setMessage(""), 2500)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el perfil"
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando edición...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Editar perfil profesional</h1>
          <Button type="button" onClick={() => router.push("/professional-profile")}>
            Volver al perfil
          </Button>
        </div>

        <Card>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Información básica</h4>
            <div className={styles.formGrid}>
              <Input
                label="Nombre completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre profesional"
              />
              <Input
                label="Cédula"
                value={dniNumber}
                disabled
              />
              <Input
                label="Teléfono"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Ej: 02 234 5678"
              />
              <Input
                label="Teléfono móvil"
                value={mobile}
                onChange={(event) => {
                  setMobile(event.target.value)
                  setMobileError("")
                }}
                placeholder="Ej: 0999999999"
                error={mobileError}
                inputMode="tel"
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Datos artísticos y portafolio</h4>
            <div className={styles.formGrid}>
              <Input
                label="Apodo / nombre artístico"
                value={nickName}
                onChange={(event) => setNickName(event.target.value)}
                placeholder="Nombre artístico"
              />
              <Input
                label="Sitio web"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://..."
              />
              <Input
                label="LinkedIn"
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Portafolio / RRSS"
                value={rrss}
                onChange={(event) => setRrss(event.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Perfil de IMDB"
                value={imdbProfile}
                onChange={(event) => setImdbProfile(event.target.value)}
                placeholder="https://www.imdb.com/name/nm0000000/"
              />
              <Input
                label="Reel"
                value={reelLink}
                onChange={(event) => setReelLink(event.target.value)}
                placeholder="https://..."
              />

              <div className={styles.fullWidthField}>
                <label className={styles.fieldLabel}>Foto de perfil</label>
                <ImageUpload
                  label=""
                  documentType={AssetTypeEnum.IMAGE}
                  ownerType={AssetOwnerEnum.PROFESSIONAL_PROFILE_PHOTO}
                  ownerId={professionalId || undefined}
                  currentImageUrl={profilePhotoUrl || undefined}
                  onUploadComplete={(id, url) => {
                    setProfilePhotoAssetId(id)
                    setProfilePhotoUrl(url)
                    setProfilePhotoError("")
                  }}
                  onRemove={() => {
                    setProfilePhotoAssetId(null)
                    setProfilePhotoUrl(null)
                    setProfilePhotoError("La foto de perfil es obligatoria")
                  }}
                />
                {profilePhotoError && (
                  <p className={styles.fieldError}>{profilePhotoError}</p>
                )}
              </div>

              <div className={styles.fullWidthField}>
                <label className={styles.fieldLabel}>
                  Imágenes de portafolio (máximo 5)
                </label>
                <MultiImageUpload
                  label=""
                  documentType={AssetTypeEnum.IMAGE}
                  ownerType={AssetOwnerEnum.PROFESSIONAL_PORTFOLIO_IMAGE}
                  ownerId={professionalId || undefined}
                  maxImages={5}
                  currentImages={portfolioCurrentImages}
                  deleteAssetOnRemove={true}
                  onImagesChange={setPortfolioImageAssetIds}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Representación empresarial</h4>
            <div className={styles.formGrid}>
              <Input
                label="Si eres representante legal de una empresa coloca su nombre"
                value={companyNameCEO}
                onChange={(event) => setCompanyNameCEO(event.target.value)}
                placeholder="Nombre de empresa"
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Roles de actividad</h4>
            <div className={styles.roleSubsection}>
              <div className={styles.roleSubsectionTitle}>Actividad principal 1</div>
              <div className={styles.roleSubsectionContent}>
                <Select
                  label="Área"
                  value={primaryArea1}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setPrimaryArea1(nextValue)
                    setPrimaryRole1("")
                  }}
                  placeholder="Selecciona un área"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                />
                <Select
                  label="Rol"
                  value={primaryRole1}
                  onChange={(event) => setPrimaryRole1(event.target.value)}
                  placeholder={primaryArea1 ? "Selecciona un rol" : "Selecciona un área"}
                  disabled={!primaryArea1}
                  options={roles
                    .filter((role) => role.idRoleCategory === Number(primaryArea1))
                    .map((role) => ({ value: String(role.id), label: role.name }))}
                />
              </div>
            </div>

            <div className={styles.roleSubsection}>
              <div className={styles.roleSubsectionTitle}>Actividad principal 2</div>
              <div className={styles.roleSubsectionContent}>
                <Select
                  label="Área"
                  value={primaryArea2}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setPrimaryArea2(nextValue)
                    setPrimaryRole2("")
                  }}
                  placeholder="Selecciona un área"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                />
                <Select
                  label="Rol"
                  value={primaryRole2}
                  onChange={(event) => setPrimaryRole2(event.target.value)}
                  placeholder={primaryArea2 ? "Selecciona un rol" : "Selecciona un área"}
                  disabled={!primaryArea2}
                  options={roles
                    .filter((role) => role.idRoleCategory === Number(primaryArea2))
                    .map((role) => ({ value: String(role.id), label: role.name }))}
                />
              </div>
            </div>

            <div className={styles.roleSubsection}>
              <div className={styles.roleSubsectionTitle}>Actividad secundaria 1</div>
              <div className={styles.roleSubsectionContent}>
                <Select
                  label="Área"
                  value={secondaryArea1}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setSecondaryArea1(nextValue)
                    setSecondaryRole1("")
                  }}
                  placeholder="Selecciona un área"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                />
                <Select
                  label="Rol"
                  value={secondaryRole1}
                  onChange={(event) => setSecondaryRole1(event.target.value)}
                  placeholder={
                    secondaryArea1 ? "Selecciona un rol" : "Selecciona un área"
                  }
                  disabled={!secondaryArea1}
                  options={roles
                    .filter((role) => role.idRoleCategory === Number(secondaryArea1))
                    .map((role) => ({ value: String(role.id), label: role.name }))}
                />
              </div>
            </div>

            <div className={styles.roleSubsection}>
              <div className={styles.roleSubsectionTitle}>Actividad secundaria 2</div>
              <div className={styles.roleSubsectionContent}>
                <Select
                  label="Área"
                  value={secondaryArea2}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setSecondaryArea2(nextValue)
                    setSecondaryRole2("")
                  }}
                  placeholder="Selecciona un área"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                />
                <Select
                  label="Rol"
                  value={secondaryRole2}
                  onChange={(event) => setSecondaryRole2(event.target.value)}
                  placeholder={
                    secondaryArea2 ? "Selecciona un rol" : "Selecciona un área"
                  }
                  disabled={!secondaryArea2}
                  options={roles
                    .filter((role) => role.idRoleCategory === Number(secondaryArea2))
                    .map((role) => ({ value: String(role.id), label: role.name }))}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Biofilmografía</h4>
            <div className={styles.formGrid}>
              <div className={styles.fullWidthField}>
                <Textarea
                  label="Biofilmografía (español)"
                  value={bio}
                  onChange={(event) => {
                    if (event.target.value.length <= 300) {
                      setBio(event.target.value)
                      setBioError("")
                    } else {
                      setBio(event.target.value.slice(0, 300))
                      setBioError("Máximo 300 caracteres")
                    }
                  }}
                  rows={4}
                  maxLength={300}
                  error={bioError}
                  helper={`${bio.length}/300 caracteres`}
                  required
                />
              </div>
              <div className={styles.fullWidthField}>
                <Textarea
                  label="Biofilmografía (inglés)"
                  value={bioEn}
                  onChange={(event) => {
                    if (event.target.value.length <= 300) {
                      setBioEn(event.target.value);
                      setBioEnError("");
                    } else {
                      setBioEn(event.target.value.slice(0, 300));
                      setBioEnError("Máximo 300 caracteres");
                    }
                  }}
                  rows={4}
                  maxLength={300}
                  error={bioEnError}
                  helper={`${bioEn.length}/300 caracteres`}
                />
              </div>
              <div className={styles.fullWidthField}>
                <Textarea
                  label="Biofilmografía extendida (español) *"
                  value={extendedBiofilmography}
                  onChange={(event) => {
                    setExtendedBiofilmography(event.target.value.slice(0, 1000));
                    setExtendedBioError("");
                  }}
                  rows={6}
                  maxLength={1000}
                  error={extendedBioError}
                  helper={`${extendedBiofilmography.length}/1000 caracteres`}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.participationSection}>
            <h3 className={styles.sectionTitle}>Participaciones en películas</h3>

            <div className={styles.participationGrid}>
              <div className={styles.movieSearchField}>
                <Input
                  label="Película"
                  value={movieSearch}
                  onChange={(event) => {
                    const value = event.target.value
                    setMovieSearch(value)
                    if (!value) {
                      setParticipationMovieId("")
                    }
                  }}
                  placeholder={
                    isLoadingMovies
                      ? "Cargando películas..."
                      : "Escribe el nombre de la película"
                  }
                  disabled={isLoadingMovies}
                />
                {shouldShowMovieSearchList && !isLoadingMovies && (
                  <div className={styles.movieSearchList}>
                    {filteredMovies.length === 0 ? (
                      <div className={styles.movieSearchEmpty}>Sin coincidencias</div>
                    ) : (
                      filteredMovies.map((movie) => (
                        <button
                          key={movie.id}
                          type="button"
                          className={styles.movieSearchItem}
                          onClick={() => {
                            setParticipationMovieId(String(movie.id))
                            setMovieSearch(movie.title)
                          }}
                        >
                          {movie.title}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Select
                label="Rol"
                value={participationRoleId}
                onChange={(event) => setParticipationRoleId(event.target.value)}
                placeholder="Selecciona un rol"
                options={roles.map((role) => ({
                  value: String(role.id),
                  label: role.name,
                }))}
              />

              <Button type="button" onClick={handleAddParticipation}>
                Agregar
              </Button>
            </div>

            {participationEntries.length > 0 ? (
              <div className={styles.participationList}>
                {participationEntries.map((entry) => {
                  const movieTitle =
                    entry.movieTitle ||
                    movies.find((movie) => movie.id === entry.movieId)?.title ||
                    `#${entry.movieId}`
                  const roleName =
                    entry.cinematicRoleName ||
                    roles.find((role) => role.id === entry.cinematicRoleId)?.name ||
                    `#${entry.cinematicRoleId}`

                  return (
                    <div key={entry.localId} className={styles.participationItem}>
                      <div className={styles.participationMeta}>
                        <span>{movieTitle}</span>
                        <span className={styles.participationRole}>{roleName}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.participationRemove}
                        onClick={() => handleRemoveParticipation(entry.localId)}
                      >
                        Quitar
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className={styles.participationHint}>Aún no has agregado participaciones.</p>
            )}
          </div>

          <div className={styles.actions}>
            <Button type="button" onClick={handleSave} isLoading={isSaving}>
              Guardar cambios
            </Button>
          </div>
        </Card>

        {showLoadErrorModal && typeof document !== "undefined" &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="load-error-modal-title"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.58)",
                backdropFilter: "blur(3px)",
              }}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeLoadErrorModal()
                }
              }}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: "100%",
                  maxWidth: "680px",
                  maxHeight: "84vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: "1px solid rgba(203, 213, 225, 0.9)",
                  boxShadow: "0 25px 55px rgba(15, 23, 42, 0.28)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.85rem",
                    padding: "1.15rem 1.25rem",
                    borderBottom: "1px solid #e2e8f0",
                    background:
                      "linear-gradient(180deg, rgba(254, 242, 242, 0.9) 0%, rgba(255, 255, 255, 1) 100%)",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      fontWeight: 800,
                      lineHeight: 1,
                      marginTop: "2px",
                      color: "#fff",
                      background: "#ef4444",
                      boxShadow: "0 8px 20px rgba(239, 68, 68, 0.35)",
                      flexShrink: 0,
                    }}
                  >
                    !
                  </div>
                  <div>
                    <h2
                      id="load-error-modal-title"
                      style={{
                        margin: "0 0 0.35rem",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1.2,
                      }}
                    >
                      Ocurrió un error al cargar datos
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.92rem",
                        color: "#475569",
                      }}
                    >
                      Revisa los mensajes y vuelve a intentar la carga.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeLoadErrorModal}
                    aria-label="Cerrar"
                    style={{
                      marginLeft: "auto",
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      background: "#fff",
                      color: "#1f2937",
                      fontSize: "1.4rem",
                      lineHeight: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    overflowY: "auto",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      background: "#fff7f7",
                      border: "1px solid rgba(239, 68, 68, 0.23)",
                      borderRadius: "12px",
                      padding: "0.82rem 0.9rem",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 0.45rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#b91c1c",
                      }}
                    >
                      Error
                    </p>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {loadErrorMessages.map((msg, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "0.5rem",
                            fontSize: "0.9rem",
                            color: "#1e293b",
                            marginBottom: i === loadErrorMessages.length - 1 ? 0 : "0.4rem",
                          }}
                        >
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "999px",
                              background: "#ef4444",
                              flexShrink: 0,
                              position: "relative",
                              top: "-1px",
                            }}
                          />
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  style={{
                    padding: "0.95rem 1.25rem",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.6rem",
                    background: "#f8fafc",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeLoadErrorModal}
                    style={{
                      background: "#fff",
                      color: "#334155",
                      border: "1px solid rgba(148, 163, 184, 0.45)",
                      borderRadius: "10px",
                      padding: "0.65rem 1.2rem",
                      fontSize: "0.87rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={closeLoadErrorModal}
                    style={{
                      background: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.65rem 1.5rem",
                      fontSize: "0.87rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  )
}
