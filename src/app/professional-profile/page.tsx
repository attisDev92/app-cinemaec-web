"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { LegalStatus } from "@/features/profile/types"
import {
  professionalsService,
  type Professional,
  type ProfessionalClaimCheckResponse,
} from "@/features/professionals"
import { useCinematicRoles, useRoleCategories } from "@/features/catalog"
import { movieService, type Movie } from "@/features/movies"
import { assetService } from "@/features/assets/services/asset.service"
import { Navbar } from "@/shared/components/Navbar"
import {
  Card,
  Button,
  ImageUpload,
  Input,
  MultiImageUpload,
  Select,
  Textarea,
} from "@/shared/components/ui"
import { AssetOwnerEnum, AssetTypeEnum } from "@/shared/types"
import styles from "./page.module.css"

export default function ProfessionalProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { profile, loadProfile } = useProfile()
  const { categories } = useRoleCategories()
  const { roles } = useCinematicRoles()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [movieSearch, setMovieSearch] = useState("")
  const [claimData, setClaimData] = useState<ProfessionalClaimCheckResponse | null>(
    null,
  )
  const [isChecking, setIsChecking] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [professionalData, setProfessionalData] = useState<Professional | null>(
    null,
  )
  const [displayProfilePhotoUrl, setDisplayProfilePhotoUrl] = useState<string | null>(
    null,
  )
  const [displayPortfolioUrls, setDisplayPortfolioUrls] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    number | null
  >(null)
  const [phone, setPhone] = useState("")
  const [mobile, setMobile] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [nickName, setNickName] = useState("")
  const [rrss, setRrss] = useState("")
  const [bio, setBio] = useState("")
  const [bioEn, setBioEn] = useState("")
  const [profilePhotoAssetId, setProfilePhotoAssetId] = useState<number | null>(
    null,
  )
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [reelLink, setReelLink] = useState("")
  const [companyNameCEO, setCompanyNameCEO] = useState("")
  const [primaryArea1, setPrimaryArea1] = useState("")
  const [primaryRole1, setPrimaryRole1] = useState("")
  const [primaryArea2, setPrimaryArea2] = useState("")
  const [primaryRole2, setPrimaryRole2] = useState("")
  const [secondaryArea1, setSecondaryArea1] = useState("")
  const [secondaryRole1, setSecondaryRole1] = useState("")
  const [secondaryArea2, setSecondaryArea2] = useState("")
  const [secondaryRole2, setSecondaryRole2] = useState("")
  const [portfolioImageAssetIds, setPortfolioImageAssetIds] = useState<number[]>(
    [],
  )
  const [participationMovieId, setParticipationMovieId] = useState("")
  const [participationRoleId, setParticipationRoleId] = useState("")
  const [participationEntries, setParticipationEntries] = useState<
    Array<{
      localId: string
      movieId: number
      cinematicRoleId: number
      movieTitle?: string
      cinematicRoleName?: string
    }>
  >([])
  const [isLoadingParticipations, setIsLoadingParticipations] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setMessage("")
      setShowClaimSuccess(false)
      router.push("/login")
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    // Reset success message when user changes (logout/login)
    setMessage("")
    setShowClaimSuccess(false)
  }, [user?.id])

  useEffect(() => {
    // Reset form fields when profile changes
    setPhone(profile?.phone || "")
    setMobile("")
    setWebsite("")
    setLinkedin("")
    setNickName("")
    setRrss("")
    setBio("")
    setBioEn("")
    setProfilePhotoAssetId(null)
    setProfilePhotoUrl(null)
    setReelLink("")
    setCompanyNameCEO("")
    setPrimaryArea1("")
    setPrimaryRole1("")
    setPrimaryArea2("")
    setPrimaryRole2("")
    setSecondaryArea1("")
    setSecondaryRole1("")
    setSecondaryArea2("")
    setSecondaryRole2("")
    setPortfolioImageAssetIds([])
    setParticipationMovieId("")
    setParticipationRoleId("")
    setParticipationEntries([])
    setMovieSearch("")
  }, [profile?.id, profile?.phone])

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
    const runCheck = async () => {
      // Solo ejecutar si el usuario está autenticado
      if (!user || authLoading) {
        return
      }

      if (!profile) {
        await loadProfile()
      }

      // Si el usuario tiene perfil cargado, validar que sea persona natural
      if (profile && profile.legalStatus === LegalStatus.LEGAL_ENTITY) {
        setIsChecking(false)
        setError("Este módulo está disponible solo para persona natural")
        return
      }

      try {
        setIsChecking(true)
        const response = await professionalsService.checkClaimByCedula()
        setError("")
        setClaimData(response)
        setSelectedProfessionalId(null)
        setIsChecking(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo verificar el perfil profesional",
        )
        setIsChecking(false)
      }
    }

    runCheck()
  }, [user, profile, authLoading, loadProfile])

  useEffect(() => {
    const loadProfessionalData = async () => {
      if (!claimData?.alreadyClaimedByYou || !claimData.professionalId) {
        setProfessionalData(null)
        return
      }

      try {
        const professionals = await professionalsService.getAll()
        const matchedProfessional =
          professionals.find((item) => item.id === claimData.professionalId) ||
          null
        setProfessionalData(matchedProfessional)
      } catch (err) {
        console.error(err)
        setProfessionalData(null)
      }
    }

    loadProfessionalData()
  }, [claimData?.alreadyClaimedByYou, claimData?.professionalId])

  useEffect(() => {
    const loadProfessionalAssets = async () => {
      if (!claimData?.alreadyClaimedByYou || !claimData.professionalId) {
        setDisplayProfilePhotoUrl(null)
        setDisplayPortfolioUrls([])
        return
      }

      try {
        const [profilePhotoAssets, portfolioAssets] = await Promise.all([
          assetService.getAssetsByOwner(
            AssetOwnerEnum.PROFESSIONAL_PROFILE_PHOTO,
            claimData.professionalId,
          ),
          assetService.getAssetsByOwner(
            AssetOwnerEnum.PROFESSIONAL_PORTFOLIO_IMAGE,
            claimData.professionalId,
          ),
        ])

        const profilePhoto = profilePhotoAssets[0]
        setDisplayProfilePhotoUrl(
          profilePhoto ? assetService.getPublicAssetUrl(profilePhoto) : null,
        )

        setDisplayPortfolioUrls(
          portfolioAssets
            .slice(0, 6)
            .map((asset) => assetService.getPublicAssetUrl(asset)),
        )
      } catch (err) {
        console.error(err)
        setDisplayProfilePhotoUrl(null)
        setDisplayPortfolioUrls([])
      }
    }

    loadProfessionalAssets()
  }, [claimData?.alreadyClaimedByYou, claimData?.professionalId])

  useEffect(() => {
    const loadParticipations = async () => {
      if (!claimData?.alreadyClaimedByYou || !claimData.professionalId) {
        return
      }

      try {
        setIsLoadingParticipations(true)
        const data = await professionalsService.getMovieParticipations(
          claimData.professionalId,
        )
        setParticipationEntries(
          data.map((entry) => ({
            localId: `existing-${entry.id}`,
            movieId: entry.movieId,
            cinematicRoleId: entry.cinematicRoleId,
            movieTitle: entry.movieTitle,
            cinematicRoleName: entry.cinematicRoleName,
          })),
        )
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingParticipations(false)
      }
    }

    loadParticipations()
  }, [claimData?.alreadyClaimedByYou, claimData?.professionalId])

  const shouldShowClaimSection =
    isChecking ||
    !claimData ||
    (claimData.hasMatch && !claimData.alreadyClaimedByYou && !claimData.claimedByAnotherUser)

  const shouldShowVerificationError = claimData && !claimData.hasMatch
  const hasMultipleNameMatches = Boolean(
    claimData?.requiresSelection && claimData?.nameMatches?.length,
  )
  const canSubmitClaim = Boolean(
    claimData &&
      claimData.hasMatch &&
      (claimData.canClaim || claimData.requiresSelection) &&
      (!claimData.requiresSelection || selectedProfessionalId),
  )

  const handleClaim = async () => {
    try {
      if (claimData?.requiresSelection && !selectedProfessionalId) {
        setError("Selecciona un perfil para reclamar")
        return
      }
      setIsClaiming(true)
      setError("")
      const response = await professionalsService.claimRegisteredProfile(
        selectedProfessionalId || undefined,
      )
      setMessage(response.message)
      setShowClaimSuccess(true)
      // Actualizar claimData para reflejar que fue reclamado
      setClaimData((prev) =>
        prev
          ? {
              ...prev,
              canClaim: false,
              alreadyClaimedByYou: true,
              claimedByAnotherUser: false,
              professionalId: response.professionalId,
              professionalName:
                prev.professionalName ||
                prev.nameMatches?.find(
                  (match) => match.id === response.professionalId,
                )?.name ||
                null,
            }
          : prev,
      )
      // Pequeña pausa para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        setMessage("")
        setShowClaimSuccess(false)
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo reclamar el perfil",
      )
    } finally {
      setIsClaiming(false)
    }
  }

  const handleCreateProfessional = async () => {
    if (!profile?.fullName || !user?.cedula) {
      setError("Completa tu perfil para registrar un profesional")
      return
    }

    try {
      setIsCreating(true)
      setError("")
      const response = await professionalsService.registerForCurrentUser({
        name: profile.fullName,
        nickName: nickName || null,
        dniNumber: user.cedula,
        phone: phone || null,
        mobile: mobile || null,
        website: website || null,
        linkedin: linkedin || null,
        rrss: rrss || null,
        bio: bio || null,
        bioEn: bioEn || null,
        profilePhotoAssetId,
        reelLink: reelLink || null,
        primaryActivityRoleId1: primaryRole1 ? Number(primaryRole1) : null,
        primaryActivityRoleId2: primaryRole2 ? Number(primaryRole2) : null,
        secondaryActivityRoleId1: secondaryRole1
          ? Number(secondaryRole1)
          : null,
        secondaryActivityRoleId2: secondaryRole2
          ? Number(secondaryRole2)
          : null,
        portfolioImageAssetIds:
          portfolioImageAssetIds.length > 0 ? portfolioImageAssetIds : undefined,
        movieParticipations:
          participationEntries.length > 0
            ? participationEntries.map((entry) => ({
                movieId: entry.movieId,
                cinematicRoleId: entry.cinematicRoleId,
              }))
            : undefined,
      })

      setMessage("Perfil profesional registrado exitosamente")
      setShowClaimSuccess(true)
      setClaimData({
        hasMatch: true,
        canClaim: false,
        alreadyClaimedByYou: true,
        claimedByAnotherUser: false,
        professionalId: response.id,
        professionalName: response.name,
        dniNumber: response.dniNumber || user.cedula,
        requiresSelection: false,
        nameMatches: [],
      })

      setTimeout(() => {
        setMessage("")
        setShowClaimSuccess(false)
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el perfil profesional",
      )
    } finally {
      setIsCreating(false)
    }
  }

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

  if (authLoading || isChecking) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const selectedMovieTitle = participationMovieId
    ? movies.find((movie) => movie.id === Number(participationMovieId))?.title
    : undefined

  const filteredMovies = movieSearch.trim()
    ? movies
        .filter((movie) =>
          movie.title.toLowerCase().includes(movieSearch.trim().toLowerCase()),
        )
        .slice(0, 8)
    : []

  const shouldShowMovieSearchList =
    movieSearch.trim() && movieSearch.trim() !== selectedMovieTitle

  const primaryRoles = [
    professionalData?.primaryActivityRoleId1,
    professionalData?.primaryActivityRoleId2,
  ]
    .map((roleId) => roles.find((role) => role.id === roleId)?.name)
    .filter(Boolean)

  const secondaryRoles = [
    professionalData?.secondaryActivityRoleId1,
    professionalData?.secondaryActivityRoleId2,
  ]
    .map((roleId) => roles.find((role) => role.id === roleId)?.name)
    .filter(Boolean)

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Perfil de Profesionales</h1>

        <Card>
          {error && shouldShowVerificationError && (
            <div className={styles.error}>{error}</div>
          )}
          {error && !shouldShowVerificationError && (
            <div className={styles.error}>{error}</div>
          )}
          {showClaimSuccess && message && (
            <div className={styles.success}>{message}</div>
          )}

          {/* Vista de Reclamación de Perfil */}
          {shouldShowClaimSection && (
            <>
              <h3 className={styles.claimTitle}>Reclamar perfil registrado</h3>
              <p className={styles.claimText}>
                Tu número de cédula fue registrado en el antiguo portal del
                Listado Ecuatoriano Audiovisual - LEA, si este es tu perfil
                puedes reclamarlo, editarlo y completarlo.
              </p>
              {hasMultipleNameMatches && (
                <div className={styles.matchList}>
                  <p className={styles.matchHint}>
                    Se encontraron varias coincidencias por nombre. Selecciona
                    tu perfil para continuar:
                  </p>
                  <div className={styles.matchOptions}>
                    {claimData?.nameMatches?.map((match) => (
                      <label key={match.id} className={styles.matchOption}>
                        <input
                          type="radio"
                          name="professionalMatch"
                          value={match.id}
                          checked={selectedProfessionalId === match.id}
                          onChange={() => setSelectedProfessionalId(match.id)}
                        />
                        <span>{match.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {claimData?.professionalName && (
                <div className={styles.claimDetails}>
                  <p className={styles.claimText}>
                    Perfil encontrado: <strong>{claimData.professionalName}</strong>
                  </p>
                  {claimData?.dniNumber && (
                    <p className={styles.claimText}>
                      Cédula: <strong>{claimData.dniNumber}</strong>
                    </p>
                  )}
                </div>
              )}
              {claimData && claimData.hasMatch && claimData.canClaim && (
                <Button
                  onClick={handleClaim}
                  isLoading={isClaiming}
                  disabled={!canSubmitClaim}
                >
                  Aceptar
                </Button>
              )}
              {claimData && claimData.hasMatch && claimData.requiresSelection && (
                <Button
                  onClick={handleClaim}
                  isLoading={isClaiming}
                  disabled={!canSubmitClaim}
                >
                  Aceptar
                </Button>
              )}
            </>
          )}

          {/* Vista de Perfil Reclamado */}
          {claimData &&
            !shouldShowClaimSection &&
            claimData.alreadyClaimedByYou &&
            claimData.hasMatch &&
            !showClaimSuccess && (
            <div className={styles.profileClaimedSection}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarCircle}>
                  {displayProfilePhotoUrl ? (
                    <Image
                      src={displayProfilePhotoUrl}
                      alt="Foto de perfil"
                      className={styles.avatarImage}
                      width={72}
                      height={72}
                      unoptimized
                    />
                  ) : (
                    <span>
                      {claimData.professionalName?.charAt(0).toUpperCase() || "P"}
                    </span>
                  )}
                </div>
                <div className={styles.profileHeaderInfo}>
                  <p className={styles.profileSubtitle}>
                    {professionalData?.nickName || "Sin nickname"}
                  </p>
                  <h2 className={styles.profileTitle}>
                    {claimData.professionalName}
                  </h2>
                </div>
              </div>

              <div className={styles.profileGrid}>
                <div className={styles.profileBlock}>
                  <h4 className={styles.blockTitle}>Información</h4>
                  <div className={styles.profileDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Identificación</span>
                      <span className={styles.value}>{claimData.dniNumber || "-"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Teléfono</span>
                      <span className={styles.value}>{professionalData?.phone || "-"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Celular</span>
                      <span className={styles.value}>{professionalData?.mobile || "-"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Empresa</span>
                      <span className={styles.value}>
                        {professionalData?.companyNameCEO || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.profileBlock}>
                  <h4 className={styles.blockTitle}>Enlaces</h4>
                  <div className={styles.linkList}>
                    {professionalData?.website ? (
                      <a
                        href={professionalData.website}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.profileLink}
                      >
                        Sitio web
                      </a>
                    ) : (
                      <span className={styles.emptyValue}>Sin sitio web</span>
                    )}
                    {professionalData?.linkedin ? (
                      <a
                        href={professionalData.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.profileLink}
                      >
                        LinkedIn
                      </a>
                    ) : (
                      <span className={styles.emptyValue}>Sin LinkedIn</span>
                    )}
                    {professionalData?.reelLink ? (
                      <a
                        href={professionalData.reelLink}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.profileLink}
                      >
                        Reel
                      </a>
                    ) : (
                      <span className={styles.emptyValue}>Sin reel</span>
                    )}
                    {professionalData?.rrss ? (
                      <a
                        href={professionalData.rrss}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.profileLink}
                      >
                        Portafolio / RRSS
                      </a>
                    ) : (
                      <span className={styles.emptyValue}>Sin portafolio / RRSS</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.profileBlock}>
                <h4 className={styles.blockTitle}>Biofilmografía</h4>
                <div className={styles.bioGroup}>
                  <p className={styles.bioLabel}>Español</p>
                  <p className={styles.bioText}>
                    {professionalData?.bio ||
                      "Aún no has agregado tu biofilmografía en español."}
                  </p>
                </div>
                <div className={styles.bioGroup}>
                  <p className={styles.bioLabel}>Inglés</p>
                  <p className={styles.bioText}>
                    {professionalData?.bioEn ||
                      "Aún no has agregado tu biofilmografía en inglés."}
                  </p>
                </div>
              </div>

              <div className={styles.rolesSection}>
                <div className={styles.profileBlock}>
                  <h4 className={styles.blockTitle}>Roles principales</h4>
                  {primaryRoles.length > 0 ? (
                    <div className={styles.chipList}>
                      {primaryRoles.map((roleName) => (
                        <span key={roleName} className={styles.roleChip}>
                          {roleName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.participationHint}>Sin roles principales.</p>
                  )}
                </div>

                <div className={styles.profileBlock}>
                  <h4 className={styles.blockTitle}>Roles secundarios</h4>
                  {secondaryRoles.length > 0 ? (
                    <div className={styles.chipList}>
                      {secondaryRoles.map((roleName) => (
                        <span key={roleName} className={styles.roleChip}>
                          {roleName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.participationHint}>Sin roles secundarios.</p>
                  )}
                </div>
              </div>

              <div className={styles.profileBlock}>
                <h4 className={styles.blockTitle}>Galería</h4>
                {displayPortfolioUrls.length > 0 ? (
                  <div className={styles.galleryGrid}>
                    {displayPortfolioUrls.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        alt="Imagen de portafolio"
                        className={styles.galleryImage}
                        width={300}
                        height={220}
                        unoptimized
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.galleryPlaceholderGrid}>
                    <div className={styles.galleryPlaceholder}>Sin imagen</div>
                    <div className={styles.galleryPlaceholder}>Sin imagen</div>
                    <div className={styles.galleryPlaceholder}>Sin imagen</div>
                  </div>
                )}
              </div>

              <div className={styles.participationSection}>
                <h4 className={styles.blockTitle}>Filmografía</h4>

                {isLoadingParticipations ? (
                  <p className={styles.participationHint}>
                    Cargando participaciones...
                  </p>
                ) : participationEntries.length > 0 ? (
                  <div className={styles.participationList}>
                    {participationEntries.map((entry) => {
                      const movieTitle =
                        entry.movieTitle ||
                        movies.find((movie) => movie.id === entry.movieId)
                          ?.title ||
                        `#${entry.movieId}`
                      const roleName =
                        entry.cinematicRoleName ||
                        roles.find((role) => role.id === entry.cinematicRoleId)
                          ?.name ||
                        `#${entry.cinematicRoleId}`

                      return (
                        <div
                          key={entry.localId}
                          className={styles.participationItem}
                        >
                          <div className={styles.participationMeta}>
                            <span>{movieTitle}</span>
                            <span className={styles.participationRole}>
                              {roleName}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.participationHint}>
                    Aún no has agregado participaciones.
                  </p>
                )}
              </div>

              <div className={styles.profileActions}>
                <Button 
                  onClick={() => router.push("/professional-profile/edit")}
                  className={styles.editButton}
                >
                  Editar Perfil
                </Button>
              </div>
            </div>
          )}

          {claimData && !claimData.canClaim && claimData.claimedByAnotherUser && (
            <p className={styles.claimText}>
              {claimData.professionalName
                ? `El perfil profesional ${claimData.professionalName} asociado a tu número de cédula ya fue reclamado por otro usuario.`
                : "El perfil profesional asociado a tu número de cédula ya fue reclamado por otro usuario."}
            </p>
          )}

          {claimData && !claimData.hasMatch && (
            <div className={styles.createProfileSection}>
              <h3 className={styles.claimTitle}>Registrar nuevo perfil</h3>
              <p className={styles.claimText}>
                No se encontró un perfil profesional registrado con tu número de
                cédula. Puedes registrar uno nuevo con tus datos.
              </p>

              {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>👤</span>
                  Información Básica
                </h4>
                <div className={styles.formSectionContent}>
                  <Input
                    label="Nombre completo"
                    value={profile?.fullName || ""}
                    disabled
                  />
                  <Input
                    label="Cédula"
                    value={user?.cedula || ""}
                    disabled
                  />
                  <Input
                    label="Teléfono"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Ej: 02 234 5678"
                    type="tel"
                    inputMode="numeric"
                  />
                  <Input
                    label="Celular"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="Ej: 0999999999"
                    type="tel"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* SECCIÓN 2: DATOS ARTÍSTICOS */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>✨</span>
                  Datos Artísticos y Portafolio
                </h4>
                <div className={styles.formSectionContent}>
                  <Input
                    label="Apodo / Nombre artístico"
                    value={nickName}
                    onChange={(event) => setNickName(event.target.value)}
                    placeholder="Ej: Nombre artístico"
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
                    label="Portafolio o redes sociales"
                    value={rrss}
                    onChange={(event) => setRrss(event.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    label="Reel (YouTube o Vimeo)"
                    value={reelLink}
                    onChange={(event) => setReelLink(event.target.value)}
                    placeholder="https://..."
                  />
                  <div className={styles.portfolioSection}>
                    <label className={styles.portfolioLabel}>Foto de perfil</label>
                    <ImageUpload
                      label=""
                      documentType={AssetTypeEnum.IMAGE}
                      ownerType={AssetOwnerEnum.PROFESSIONAL_PROFILE_PHOTO}
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
                </div>
              </div>

              {/* SECCIÓN 3: EMPRESA */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>🏢</span>
                  Representación Empresarial
                </h4>
                <div className={styles.formSectionContent}>
                  <Input
                    label="Si eres representante legal de una empresa coloca su nombre"
                    value={companyNameCEO}
                    onChange={(event) => setCompanyNameCEO(event.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>

              {/* SECCIÓN 4: ROLES DE ACTIVIDAD */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>🎬</span>
                  Roles de Actividad
                </h4>
                <div className={styles.formSectionContent}>
                  <div className={styles.roleSubsection}>
                    <div className={styles.roleSubsectionTitle}>Actividad Principal 1</div>
                    <div className={styles.roleSubsectionContent}>
                      <Select
                        label="Área"
                        value={primaryArea1}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setPrimaryArea1(nextValue)
                          if (!nextValue) {
                            setPrimaryRole1("")
                            return
                          }
                          const roleMatch = roles.some(
                            (role) =>
                              role.idRoleCategory === Number(nextValue) &&
                              role.id === Number(primaryRole1),
                          )
                          if (!roleMatch) {
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
                        placeholder={
                          primaryArea1 ? "Selecciona un rol" : "Selecciona un área"
                        }
                        disabled={!primaryArea1}
                        options={roles
                          .filter(
                            (role) => role.idRoleCategory === Number(primaryArea1),
                          )
                          .map((role) => ({
                            value: String(role.id),
                            label: role.name,
                          }))}
                      />
                    </div>
                  </div>

                  <div className={styles.roleSubsection}>
                    <div className={styles.roleSubsectionTitle}>Actividad Principal 2</div>
                    <div className={styles.roleSubsectionContent}>
                      <Select
                        label="Área"
                        value={primaryArea2}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setPrimaryArea2(nextValue)
                          if (!nextValue) {
                            setPrimaryRole2("")
                            return
                          }
                          const roleMatch = roles.some(
                            (role) =>
                              role.idRoleCategory === Number(nextValue) &&
                              role.id === Number(primaryRole2),
                          )
                          if (!roleMatch) {
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
                        placeholder={
                          primaryArea2 ? "Selecciona un rol" : "Selecciona un área"
                        }
                        disabled={!primaryArea2}
                        options={roles
                          .filter(
                            (role) => role.idRoleCategory === Number(primaryArea2),
                          )
                          .map((role) => ({
                            value: String(role.id),
                            label: role.name,
                          }))}
                      />
                    </div>
                  </div>

                  <div className={styles.roleSubsection}>
                    <div className={styles.roleSubsectionTitle}>Actividad Secundaria 1</div>
                    <div className={styles.roleSubsectionContent}>
                      <Select
                        label="Área"
                        value={secondaryArea1}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setSecondaryArea1(nextValue)
                          if (!nextValue) {
                            setSecondaryRole1("")
                            return
                          }
                          const roleMatch = roles.some(
                            (role) =>
                              role.idRoleCategory === Number(nextValue) &&
                              role.id === Number(secondaryRole1),
                          )
                          if (!roleMatch) {
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
                          .filter(
                            (role) => role.idRoleCategory === Number(secondaryArea1),
                          )
                          .map((role) => ({
                            value: String(role.id),
                            label: role.name,
                          }))}
                      />
                    </div>
                  </div>

                  <div className={styles.roleSubsection}>
                    <div className={styles.roleSubsectionTitle}>Actividad Secundaria 2</div>
                    <div className={styles.roleSubsectionContent}>
                      <Select
                        label="Área"
                        value={secondaryArea2}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setSecondaryArea2(nextValue)
                          if (!nextValue) {
                            setSecondaryRole2("")
                            return
                          }
                          const roleMatch = roles.some(
                            (role) =>
                              role.idRoleCategory === Number(nextValue) &&
                              role.id === Number(secondaryRole2),
                          )
                          if (!roleMatch) {
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
                          .filter(
                            (role) => role.idRoleCategory === Number(secondaryArea2),
                          )
                          .map((role) => ({
                            value: String(role.id),
                            label: role.name,
                          }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 5: PARTICIPACIONES EN PELÍCULAS */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>🎥</span>
                  Participaciones en Películas
                </h4>
                <div className={styles.formSectionContent}>
                  <div className={styles.movieParticipationsSection}>
                    <div className={styles.movieParticipationsTitle}>
                      Agrega las películas en las que has participado
                    </div>
                    <div className={styles.movieParticipationsContent}>
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
                                <div className={styles.movieSearchEmpty}>
                                  Sin coincidencias
                                </div>
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
                          onChange={(event) =>
                            setParticipationRoleId(event.target.value)
                          }
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

                      {isLoadingParticipations ? (
                        <p className={styles.participationHint}>
                          Cargando participaciones...
                        </p>
                      ) : participationEntries.length > 0 ? (
                        <div className={styles.participationList}>
                          {participationEntries.map((entry) => {
                            const movieTitle =
                              entry.movieTitle ||
                              movies.find((movie) => movie.id === entry.movieId)
                                ?.title ||
                              `#${entry.movieId}`
                            const roleName =
                              entry.cinematicRoleName ||
                              roles.find((role) => role.id === entry.cinematicRoleId)
                                ?.name ||
                              `#${entry.cinematicRoleId}`

                            return (
                              <div
                                key={entry.localId}
                                className={styles.participationItem}
                              >
                                <div className={styles.participationMeta}>
                                  <span>{movieTitle}</span>
                                  <span className={styles.participationRole}>
                                    {roleName}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={styles.participationRemove}
                                  onClick={() =>
                                    handleRemoveParticipation(entry.localId)
                                  }
                                >
                                  Quitar
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className={styles.participationHint}>
                          Aún no has agregado participaciones.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 6: BIOFILMOGRAFÍA */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>📄</span>
                  Información Profesional
                </h4>
                <div className={styles.formSectionContent}>
                  <div className={styles.fullWidthField}>
                    <Textarea
                      label="Biofilmografía"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Cuéntanos sobre tu experiencia y filmografía"
                      rows={4}
                    />
                  </div>
                  <div className={styles.fullWidthField}>
                    <Textarea
                      label="Biofilmografía (Inglés)"
                      value={bioEn}
                      onChange={(event) => setBioEn(event.target.value)}
                      placeholder="Tell us about your experience and filmography"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 7: GALERÍA DE FOTOS */}
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <span className={styles.formSectionIcon}>🖼️</span>
                  Galería de Portafolio
                </h4>
                <div className={styles.formSectionContent}>
                  <div className={styles.fullWidthField}>
                    <div className={styles.portfolioLabel}>
                      Imágenes de portafolio (máximo 5)
                    </div>
                    <MultiImageUpload
                      label=""
                      documentType={AssetTypeEnum.IMAGE}
                      ownerType={AssetOwnerEnum.PROFESSIONAL_PORTFOLIO_IMAGE}
                      maxImages={5}
                      onImagesChange={setPortfolioImageAssetIds}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  onClick={handleCreateProfessional}
                  isLoading={isCreating}
                  disabled={!profile?.fullName || !user?.cedula}
                >
                  Registrar perfil profesional
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
