"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
  const [movieSearch, setMovieSearch] = useState("")
  const [participationMovieId, setParticipationMovieId] = useState("")
  const [participationRoleId, setParticipationRoleId] = useState("")
  const [participationEntries, setParticipationEntries] = useState<
    LocalParticipation[]
  >([])

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

        const profilePhotoAsset = profilePhotoAssets[0]
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
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la edición del perfil",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadEditableData()
  }, [user, authLoading, router])

  useEffect(() => {
    if (roles.length === 0) {
      return
    }

    const getAreaByRoleId = (roleIdValue: string): string => {
      if (!roleIdValue) {
        return ""
      }
      const role = roles.find((item) => item.id === Number(roleIdValue))
      return role?.idRoleCategory ? String(role.idRoleCategory) : ""
    }

    setPrimaryArea1(getAreaByRoleId(primaryRole1))
    setPrimaryArea2(getAreaByRoleId(primaryRole2))
    setSecondaryArea1(getAreaByRoleId(secondaryRole1))
    setSecondaryArea2(getAreaByRoleId(secondaryRole2))
  }, [roles, primaryRole1, primaryRole2, secondaryRole1, secondaryRole2])

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
    if (!professionalId) {
      return
    }

    try {
      setIsSaving(true)
      setError("")

      await Promise.all([
        professionalsService.update(professionalId, {
          name,
          nickName: nickName || null,
          phone: phone || null,
          mobile: mobile || null,
          website: website || null,
          linkedin: linkedin || null,
          rrss: rrss || null,
          reelLink: reelLink || null,
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
          companyNameCEO: companyNameCEO || null,
          bio: bio || null,
          bioEn: bioEn || null,
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
        err instanceof Error ? err.message : "No se pudo guardar el perfil",
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
                label="Celular"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="Ej: 0999999999"
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
                  }}
                  onRemove={() => {
                    setProfilePhotoAssetId(null)
                    setProfilePhotoUrl(null)
                  }}
                />
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
                    if (!nextValue) {
                      setPrimaryRole1("")
                    }
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
                    if (!nextValue) {
                      setPrimaryRole2("")
                    }
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
                    if (!nextValue) {
                      setSecondaryRole1("")
                    }
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
                    if (!nextValue) {
                      setSecondaryRole2("")
                    }
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
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                />
              </div>
              <div className={styles.fullWidthField}>
                <Textarea
                  label="Biofilmografía (inglés)"
                  value={bioEn}
                  onChange={(event) => setBioEn(event.target.value)}
                  rows={4}
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
      </div>
    </div>
  )
}
