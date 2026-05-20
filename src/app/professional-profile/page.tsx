"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import jsPDF from "jspdf"
import { createPortal } from "react-dom"
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
  const MOBILE_PATTERN = /^\+?[0-9()\-\s]{7,30}$/

  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { profile, loadProfile } = useProfile()
  const { categories } = useRoleCategories()
  const { roles } = useCinematicRoles()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [movieSearch, setMovieSearch] = useState("")
  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false)
  const [loadErrorMessages, setLoadErrorMessages] = useState<string[]>([])
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
  const [bioError, setBioError] = useState("")
  const [bioEnError, setBioEnError] = useState("")
  const [mobileError, setMobileError] = useState("")
  const [profilePhotoError, setProfilePhotoError] = useState("")
  const [extendedBiofilmography, setExtendedBiofilmography] = useState("")
  const [extendedBioError, setExtendedBioError] = useState("")
  const [imdbProfile, setImdbProfile] = useState("")
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

  const openLoadErrorModal = (messages: string[]) => {
    setLoadErrorMessages(messages)
    setShowLoadErrorModal(true)
  }

  const closeLoadErrorModal = () => {
    setShowLoadErrorModal(false)
  }

  const toProfileImageProxyUrl = (url: string): string =>
    `/api/image-proxy?url=${encodeURIComponent(url)}`

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
    setBioError("")
    setBioEnError("")
    setMobileError("")
    setProfilePhotoError("")
    setExtendedBiofilmography("")
    setExtendedBioError("")
    setImdbProfile("")
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
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo verificar el perfil profesional"

        setError(message)
        openLoadErrorModal([
          "Ocurrió un error al verificar tu perfil profesional.",
          message,
        ])
        setIsChecking(false)
      }
    }

    runCheck()
  }, [user, profile, authLoading, loadProfile])

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

        const profilePhotoFromProfessional = professionalData?.profilePhotoAssetId
          ? await assetService
              .getAsset(professionalData.profilePhotoAssetId)
              .catch(() => null)
          : null

        // Fallback seguro: si no existe assetId en el perfil, usar solo un asset subido
        // por el usuario autenticado para evitar mostrar fotos de terceros.
        const profilePhotoFallback =
          profilePhotoAssets.find((asset) => asset.userId === user?.id) || null

        const profilePhoto = profilePhotoFromProfessional || profilePhotoFallback
        setDisplayProfilePhotoUrl(
          profilePhoto
            ? `${toProfileImageProxyUrl(assetService.getPublicAssetUrl(profilePhoto))}&v=${profilePhoto.id}`
            : null,
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
  }, [
    claimData?.alreadyClaimedByYou,
    claimData?.professionalId,
    professionalData?.profilePhotoAssetId,
    user?.id,
  ])

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
    setBioError("")
    setBioEnError("")
    setMobileError("")
    setProfilePhotoError("")
    setExtendedBioError("")

    if (!profile?.fullName || !user?.cedula) {
      setError("Completa tu perfil para registrar un profesional")
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
      setExtendedBioError("Este campo es obligatorio")
      hasError = true
    } else if (extendedBiofilmography.length > 1000) {
      setExtendedBioError("Máximo 1000 caracteres")
      hasError = true
    }

    if (hasError) {
      setError("Revisa los campos obligatorios y los límites de caracteres.")
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
        mobile: trimmedMobile || null,
        website: website || null,
        linkedin: linkedin || null,
        rrss: rrss || null,
        bio: trimmedBio,
        bioEn: bioEn.trim() || null,
        extendedBiofilmography: trimmedExtendedBio,
        imdbProfile: imdbProfile.trim() || null,
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

  const handleDownloadProfilePdf = async () => {
    if (!claimData?.alreadyClaimedByYou || !claimData.professionalId) {
      return
    }

    const hexToRgb = (hex: string): [number, number, number] => {
      const normalized = hex.replace("#", "")
      if (normalized.length !== 6) {
        return [17, 24, 39]
      }
      return [
        Number.parseInt(normalized.slice(0, 2), 16),
        Number.parseInt(normalized.slice(2, 4), 16),
        Number.parseInt(normalized.slice(4, 6), 16),
      ]
    }

    const [primaryR, primaryG, primaryB] = hexToRgb("#ff6b6b")
    const [hazBlueR, hazBlueG, hazBlueB] = hexToRgb("#1a1f2e")
    const [hazVioletR, hazVioletG, hazVioletB] = hexToRgb("#9aa7b2")
    const [textR, textG, textB] = hexToRgb("#111827")
    const [mutedR, mutedG, mutedB] = hexToRgb("#6b7280")
    const [surfaceR, surfaceG, surfaceB] = hexToRgb("#f9fafb")
    const [linkR, linkG, linkB] = hexToRgb("#1d4ed8")

    const loadImageWithSize = async (
      src: string,
    ): Promise<{ dataUrl: string; width: number; height: number } | null> => {
      try {
        return await new Promise((resolve) => {
          const image = new window.Image()
          image.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = image.width
            canvas.height = image.height
            const context = canvas.getContext("2d")

            if (!context) {
              resolve(null)
              return
            }

            context.drawImage(image, 0, 0)
            resolve({
              dataUrl: canvas.toDataURL("image/png"),
              width: image.width,
              height: image.height,
            })
          }
          image.onerror = () => resolve(null)
          image.src = src
        })
      } catch {
        return null
      }
    }

    const getCircularAvatarFromRenderedImage = (size = 240): string | null => {
      const imageElement = document.getElementById(
        "professional-profile-avatar",
      ) as HTMLImageElement | null

      if (!imageElement || !imageElement.complete || imageElement.naturalWidth === 0) {
        return null
      }

      try {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext("2d")

        if (!context) {
          return null
        }

        context.save()
        context.beginPath()
        context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        context.closePath()
        context.clip()

        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, size, size)

        const widthScale = size / imageElement.naturalWidth
        const heightScale = size / imageElement.naturalHeight
        const scale = Math.min(widthScale, heightScale)

        const drawWidth = imageElement.naturalWidth * scale
        const drawHeight = imageElement.naturalHeight * scale
        const drawX = (size - drawWidth) / 2
        const drawY = (size - drawHeight) / 2

        context.drawImage(
          imageElement,
          drawX,
          drawY,
          drawWidth,
          drawHeight,
        )
        context.restore()

        return canvas.toDataURL("image/png")
      } catch {
        return null
      }
    }

    const iccaLogo = await loadImageWithSize("/images/logos/logo icca.png")
    const hazLogo = await loadImageWithSize(
      "/images/logos/hazcine-horizontal-oscuro1.png",
    )
    const profileTitle =
      professionalData?.nickName?.trim() || claimData.professionalName || "-"
    const embeddedProfilePhoto = getCircularAvatarFromRenderedImage(300)

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 16
    const maxWidth = pageWidth - margin * 2
    const contentTop = 46
    const bottomLimit = pageHeight - margin
    const labelWidth = 54
    const valueX = margin + labelWidth
    const valueWidth = maxWidth - labelWidth
    let y = contentTop

    const normalizeExternalUrl = (value?: string | null): string | null => {
      const raw = String(value || "").trim()
      if (!raw) {
        return null
      }
      if (/^https?:\/\//i.test(raw)) {
        return raw
      }
      return `https://${raw}`
    }

    const toPrintable = (value?: string | null): string => {
      const text = String(value || "").trim()
      return text || "-"
    }

    const drawPageHeader = () => {
      pdf.setFillColor(245, 247, 250)
      pdf.rect(0, 0, pageWidth, 40, "F")
      pdf.setFillColor(hazBlueR, hazBlueG, hazBlueB)
      pdf.rect(0, 0, pageWidth, 7, "F")
      pdf.setFillColor(primaryR, primaryG, primaryB)
      pdf.rect(0, 33, pageWidth, 7, "F")

      if (iccaLogo) {
        const logoMaxWidth = 52
        const logoMaxHeight = 20
        const logoRatio = iccaLogo.width / iccaLogo.height
        let renderWidth = logoMaxWidth
        let renderHeight = renderWidth / logoRatio

        if (renderHeight > logoMaxHeight) {
          renderHeight = logoMaxHeight
          renderWidth = renderHeight * logoRatio
        }

        pdf.addImage(
          iccaLogo.dataUrl,
          "PNG",
          margin,
          10 + (logoMaxHeight - renderHeight) / 2,
          renderWidth,
          renderHeight,
        )
      }

      if (hazLogo) {
        const hazMaxWidth = 54
        const hazMaxHeight = 22
        const hazRatio = hazLogo.width / hazLogo.height
        let hazRenderWidth = hazMaxWidth
        let hazRenderHeight = hazRenderWidth / hazRatio

        if (hazRenderHeight > hazMaxHeight) {
          hazRenderHeight = hazMaxHeight
          hazRenderWidth = hazRenderHeight * hazRatio
        }

        pdf.addImage(
          hazLogo.dataUrl,
          "PNG",
          pageWidth - margin - hazRenderWidth,
          9 + (hazMaxHeight - hazRenderHeight) / 2,
          hazRenderWidth,
          hazRenderHeight,
        )
      }
    }

    const addPage = () => {
      pdf.addPage()
      drawPageHeader()
      y = contentTop
    }

    const ensureSpace = (needed = 6) => {
      if (y + needed > bottomLimit) {
        addPage()
      }
    }

    const drawSectionTitle = (title: string) => {
      ensureSpace(11)
      pdf.setFillColor(250, 250, 250)
      pdf.roundedRect(margin, y - 6, maxWidth, 10, 2, 2, "F")
      pdf.setDrawColor(229, 231, 235)
      pdf.setLineWidth(0.3)
      pdf.line(margin, y + 5, margin + maxWidth, y + 5)
      pdf.setTextColor(primaryR, primaryG, primaryB)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.text(title, margin + 2, y + 1)
      y += 10
    }

    const drawWrappedText = (
      text: string,
      x: number,
      width: number,
      options?: {
        lineHeight?: number
        color?: [number, number, number]
        linkUrl?: string
      },
    ) => {
      const lineHeight = options?.lineHeight ?? 5
      const lines = pdf.splitTextToSize(text, width) as string[]
      const color = options?.color || [mutedR, mutedG, mutedB]

      pdf.setTextColor(color[0], color[1], color[2])
      lines.forEach((line) => {
        ensureSpace(lineHeight + 1)
        pdf.text(line, x, y)

        if (options?.linkUrl) {
          const textWidth = Math.min(pdf.getTextWidth(line), width)
          pdf.link(x, y - lineHeight + 1, textWidth, lineHeight, {
            url: options.linkUrl,
          })
        }

        y += lineHeight
      })
    }

    const addField = (
      label: string,
      value?: string | null,
      options?: { link?: boolean },
    ) => {
      ensureSpace(7)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, margin, y)

      const printable = toPrintable(value)
      const linkUrl = options?.link ? normalizeExternalUrl(value) : null

      pdf.setFont("helvetica", "normal")
      drawWrappedText(printable, valueX, valueWidth, {
        lineHeight: 5,
        color: linkUrl ? [linkR, linkG, linkB] : [mutedR, mutedG, mutedB],
        linkUrl: linkUrl || undefined,
      })

      y += 1
    }

    const addListField = (label: string, items: string[]) => {
      ensureSpace(8)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, margin, y)
      y += 6

      if (items.length === 0) {
        pdf.setFont("helvetica", "normal")
        drawWrappedText("-", margin + 4, maxWidth - 4)
        y += 1
        return
      }

      pdf.setFont("helvetica", "normal")
      items.forEach((item) => {
        drawWrappedText(`• ${item}`, margin + 4, maxWidth - 4)
      })
      y += 1
    }

    const addChipField = (label: string, items: string[], isPrimary = true) => {
      ensureSpace(10)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, margin, y)
      y += 5

      if (items.length === 0) {
        pdf.setFont("helvetica", "normal")
        drawWrappedText("-", margin + 4, maxWidth - 4)
        y += 1
        return
      }

      let chipX = margin + 2
      const chipHeight = 6

      items.forEach((item) => {
        const text = String(item || "").trim()
        if (!text) {
          return
        }

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)
        const chipWidth = Math.min(pdf.getTextWidth(text) + 7, maxWidth - 2)

        if (chipX + chipWidth > margin + maxWidth - 1) {
          chipX = margin + 2
          y += chipHeight + 2
        }

        ensureSpace(chipHeight + 2)
        if (isPrimary) {
          pdf.setFillColor(255, 236, 236)
          pdf.setTextColor(185, 28, 28)
        } else {
          pdf.setFillColor(241, 245, 249)
          pdf.setTextColor(100, 116, 139)
        }
        pdf.roundedRect(chipX, y - 4.7, chipWidth, chipHeight, 2, 2, "F")
        pdf.text(text, chipX + 3.5, y - 0.5)
        chipX += chipWidth + 2
      })

      y += chipHeight + 3
    }

    drawPageHeader()

    const photoSize = 28
    const photoX = margin
    const photoY = 49

    if (embeddedProfilePhoto) {
      pdf.addImage(embeddedProfilePhoto, "PNG", photoX, photoY, photoSize, photoSize)
    } else {
      const initial = (profileTitle || "P").trim().charAt(0).toUpperCase() || "P"
      pdf.setDrawColor(hazVioletR, hazVioletG, hazVioletB)
      pdf.setLineWidth(1.2)
      pdf.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1)
      pdf.setFillColor(primaryR, primaryG, primaryB)
      pdf.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(13)
      pdf.text(initial, photoX + photoSize / 2, photoY + photoSize / 2 + 2, {
        align: "center",
      })
    }

    if (professionalData?.nickName?.trim()) {
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(8)
      pdf.setTextColor(primaryR, primaryG, primaryB)
      pdf.text("NOMBRE ARTISTICO", margin + photoSize + 8, 54)
    }

    pdf.setTextColor(hazBlueR, hazBlueG, hazBlueB)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(16)
    pdf.text(profileTitle, margin + photoSize + 8, 61)

    if (professionalData?.nickName?.trim()) {
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(mutedR, mutedG, mutedB)
      pdf.text(claimData.professionalName || "-", margin + photoSize + 8, 67)
    }

    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.5)
    pdf.line(margin, 78, margin + maxWidth, 78)

    y = 84

    const primaryRoleText = (primaryRoles as string[]).join(", ")
    const secondaryRoleText = (secondaryRoles as string[]).join(", ")
    const ceoText = professionalData?.companyNameCEO?.trim()
      ? `Si. ${professionalData.companyNameCEO.trim()}`
      : "No especificado"
    const emailText =
      String(professionalData?.email || "").trim() ||
      String(user?.email || "").trim() ||
      "-"
    const publicProfileLink = `${window.location.origin}/public/professionals/${claimData.professionalId}`

    const links = [
      { label: "Sitio web", value: professionalData?.website || null },
      { label: "LinkedIn", value: professionalData?.linkedin || null },
      { label: "Portafolio / RRSS", value: professionalData?.rrss || null },
      { label: "Reel", value: professionalData?.reelLink || null },
      { label: "IMDb", value: professionalData?.imdbProfile || null },
      { label: "Perfil público", value: publicProfileLink },
    ]

    drawSectionTitle("Información general")
    addField("Nombre artístico", professionalData?.nickName || "")
    addField("Nombre", claimData.professionalName || professionalData?.name || "")
    addField("Si es CEO de una empresa", ceoText)
    addChipField("Actividad principal", primaryRoles as string[], true)
    addChipField("Actividades secundarias", secondaryRoles as string[], false)
    addField("Email", emailText)

    drawSectionTitle("Links")
    links.forEach((link) => {
      addField(link.label, link.value, { link: true })
    })

    drawSectionTitle("Biofilmografía")
    addField("Bio en español", professionalData?.bio || "")
    addField("Bio en inglés", professionalData?.bioEn || "")
    addField("Bio larga", professionalData?.extendedBiofilmography || "")

    drawSectionTitle("Filmografía")
    addListField(
      "Participaciones",
      participationEntries.map((entry) => {
        const movieTitle =
          entry.movieTitle ||
          movies.find((movie) => movie.id === entry.movieId)?.title ||
          `#${entry.movieId}`
        const roleName =
          entry.cinematicRoleName ||
          roles.find((role) => role.id === entry.cinematicRoleId)?.name ||
          `#${entry.cinematicRoleId}`
        return `${movieTitle} — ${roleName}`
      }),
    )

    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i += 1) {
      pdf.setPage(i)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(148, 163, 184)
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
        align: "right",
      })
    }

    const safeName = (claimData.professionalName || "perfil-profesional")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    pdf.save(`${safeName || "perfil-profesional"}.pdf`)
  }

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
                      id="professional-profile-avatar"
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
                <div className={styles.profileBlock} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, width: "100%", maxWidth: "100%" }}>
                  <div style={{ flex: 1 }}>
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
                  <div className={styles.profileActions} style={{ marginTop: 0, display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
                    <Button
                      onClick={() => {
                        if (professionalData?.id) {
                          window.open(`/public/professionals/${professionalData.id}`, "_blank")
                        }
                      }}
                      className={styles.previewButton}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
                    >
                      <span role="img" aria-label="Vista previa">👁️</span> Vista previa
                    </Button>
                    <Button 
                      onClick={() => router.push("/professional-profile/edit")}
                      className={styles.editButton}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
                    >
                      <span role="img" aria-label="Editar">✏️</span> Editar Perfil
                    </Button>
                    <Button
                      onClick={handleDownloadProfilePdf}
                      className={styles.downloadButton}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
                    >
                      <span role="img" aria-label="Descargar">⬇️</span> Descargar PDF
                    </Button>
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
                    onChange={(event) => {
                      setMobile(event.target.value)
                      setMobileError("")
                    }}
                    placeholder="Ej: 0999999999"
                    type="tel"
                    inputMode="tel"
                    error={mobileError}
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
                    label="Perfil de IMDB"
                    value={imdbProfile}
                    onChange={(event) => setImdbProfile(event.target.value)}
                    placeholder="https://www.imdb.com/name/nm0000000/"
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
                          setBioEn(event.target.value)
                          setBioEnError("")
                        } else {
                          setBioEn(event.target.value.slice(0, 300))
                          setBioEnError("Máximo 300 caracteres")
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
                        setExtendedBiofilmography(event.target.value.slice(0, 1000))
                        setExtendedBioError("")
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
                      deleteAssetOnRemove={true}
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
