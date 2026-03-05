"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import jsPDF from "jspdf"
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
          profilePhoto
            ? toProfileImageProxyUrl(assetService.getPublicAssetUrl(profilePhoto))
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

    const [primaryR, primaryG, primaryB] = hexToRgb("#6d2d8f")
    const [hazBlueR, hazBlueG, hazBlueB] = hexToRgb("#0f3554")
    const [hazVioletR, hazVioletG, hazVioletB] = hexToRgb("#b784cc")
    const [textR, textG, textB] = hexToRgb("#111827")
    const [mutedR, mutedG, mutedB] = hexToRgb("#6b7280")
    const [surfaceR, surfaceG, surfaceB] = hexToRgb("#f9fafb")

    const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
      try {
        const response = await fetch(src)
        if (!response.ok) {
          return null
        }
        const blob = await response.blob()
        return await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve((reader.result as string) || null)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(blob)
        })
      } catch {
        return null
      }
    }


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

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 16
    const maxWidth = pageWidth - margin * 2
    let y = 14

    const paintPageBackground = () => {
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")
    }

    paintPageBackground()

    const ensureSpace = (needed = 8) => {
      if (y + needed > pageHeight - margin) {
        pdf.addPage()
        paintPageBackground()
        y = margin
      }
    }

    const addTitle = (title: string) => {
      ensureSpace(12)
      pdf.setFillColor(surfaceR, surfaceG, surfaceB)
      pdf.rect(margin, y - 5, maxWidth, 9, "F")
      pdf.setTextColor(primaryR, primaryG, primaryB)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.text(title, margin + 2, y + 1)
      y += 10
    }

    const addField = (label: string, value?: string | null) => {
      ensureSpace(8)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, margin, y)

      const printable = value && value.trim() ? value : "-"
      const wrapped = pdf.splitTextToSize(printable, maxWidth - 38)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(mutedR, mutedG, mutedB)
      pdf.text(wrapped, margin + 38, y)
      y += Math.max(7, wrapped.length * 5)
    }

    const addList = (label: string, items: string[]) => {
      ensureSpace(8)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, margin, y)
      y += 6

      if (items.length === 0) {
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(mutedR, mutedG, mutedB)
        pdf.text("-", margin + 4, y)
        y += 6
        return
      }

      items.forEach((item) => {
        ensureSpace(6)
        const wrapped = pdf.splitTextToSize(`• ${item}`, maxWidth - 4)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(mutedR, mutedG, mutedB)
        pdf.text(wrapped, margin + 4, y)
        y += wrapped.length * 5
      })
    }

    const profileTitle =
      professionalData?.nickName?.trim() || claimData.professionalName || "-"

    const iccaLogo = await loadImageWithSize("/images/logos/logo icca.png")
    const hazLogo = await loadImageWithSize(
      "/images/logos/hazcine-horizontal-oscuro1.png",
    )

    pdf.setFillColor(248, 250, 252)
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
    } else {
      pdf.setTextColor(hazBlueR, hazBlueG, hazBlueB)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text("ICCA", margin, 23)
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

    const photoSize = 40
    const photoX = margin
    const photoY = 48

    const embeddedProfilePhoto = getCircularAvatarFromRenderedImage(300)

    if (embeddedProfilePhoto) {
      pdf.addImage(embeddedProfilePhoto, "PNG", photoX, photoY, photoSize, photoSize)
    } else {
      const initial = (profileTitle || "P").trim().charAt(0).toUpperCase() || "P"
      pdf.setDrawColor(hazVioletR, hazVioletG, hazVioletB)
      pdf.setLineWidth(1.6)
      pdf.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1)
      pdf.setFillColor(primaryR, primaryG, primaryB)
      pdf.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text(initial, photoX + photoSize / 2, photoY + photoSize / 2 + 2, {
        align: "center",
      })
    }

    const infoX = photoX + photoSize + 10
    const infoWidth = pageWidth - margin - infoX
    let infoY = 55

    const addSummaryField = (label: string, value?: string | null) => {
      const printable = value && value.trim() ? value : "-"
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.setTextColor(textR, textG, textB)
      pdf.text(`${label}:`, infoX, infoY)

      const wrapped = pdf.splitTextToSize(printable, infoWidth - 28)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(mutedR, mutedG, mutedB)
      pdf.text(wrapped, infoX + 28, infoY)
      infoY += Math.max(6, wrapped.length * 4.5)
    }

    pdf.setTextColor(hazBlueR, hazBlueG, hazBlueB)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(20)
    pdf.text(profileTitle, infoX, 52)

    addSummaryField("Nickname", professionalData?.nickName || "")
    addSummaryField("Nombre", claimData.professionalName)
    addSummaryField("Cédula", claimData.dniNumber || "")
    addSummaryField("Teléfono", professionalData?.phone || "")
    addSummaryField("Celular", professionalData?.mobile || "")

    pdf.setFont("helvetica", "normal")
    if (professionalData?.companyNameCEO?.trim()) {
      addSummaryField("Empresa", professionalData.companyNameCEO)
      addSummaryField("Cargo", "CEO")
    }

    y = Math.max(photoY + photoSize + 10, infoY + 4)

    addTitle("Biofilmografía")
    addField("Español", professionalData?.bio || "")
    addField("Inglés", professionalData?.bioEn || "")

    addTitle("Roles")
    addList("Principales", primaryRoles as string[])
    addList("Secundarios", secondaryRoles as string[])

    addTitle("Filmografía")
    addList(
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

    addTitle("Enlaces")
    addField("Sitio web", professionalData?.website || "")
    addField("LinkedIn", professionalData?.linkedin || "")
    addField("Reel", professionalData?.reelLink || "")
    addField("Portafolio / RRSS", professionalData?.rrss || "")

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
                  onClick={handleDownloadProfilePdf}
                  className={styles.downloadButton}
                >
                  Descargar PDF
                </Button>
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
