"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Input } from "@/shared/components/ui"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { spaceService } from "@/features/spaces/services/space.service"
import { SpaceReview } from "@/features/spaces/types/space"
import {
  Issue,
  PermissionEnum,
  QuerySpacesDto,
  ReviewForm,
  Space,
  SpaceStatus,
  UserRole,
} from "@/shared/types"
import styles from "./page.module.css"

const statusFilters: { label: string; value: SpaceStatus | "all" }[] = [
  { label: "Pendientes", value: SpaceStatus.PENDING },
  { label: "En revisión", value: SpaceStatus.UNDER_REVIEW },
  { label: "Aprobados", value: SpaceStatus.VERIFIED },
  { label: "Rechazados", value: SpaceStatus.REJECTED },
  { label: "Activos", value: SpaceStatus.ACTIVE },
  { label: "Todos", value: "all" },
]

const decisionToStatus: Record<ReviewForm["decision"], SpaceStatus> = {
  approve: SpaceStatus.VERIFIED,
  request_changes: SpaceStatus.PENDING,
  reject: SpaceStatus.REJECTED,
}

export default function AdminSpacesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()

  const [spaces, setSpaces] = useState<Space[]>([])
  const [statusFilter, setStatusFilter] = useState<SpaceStatus | "all">(
    SpaceStatus.PENDING,
  )
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null)
  const [loadingSpaces, setLoadingSpaces] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<SpaceReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "info" | "files" | "history" | "review"
  >("info")
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    decision: "approve",
    generalComment: "",
    issues: [],
  })
  const [issueDraft, setIssueDraft] = useState<{
    field: string
    comment: string
    severity: Issue["severity"]
  }>({
    field: "",
    comment: "",
    severity: "medium",
  })

  const selectedSpace = useMemo(
    () => spaces.find((space) => space.id === selectedSpaceId) || null,
    [spaces, selectedSpaceId],
  )

  const reviewableFields = [
    { value: "name", label: "Nombre del espacio", section: "Básica" },
    { value: "type", label: "Tipo de espacio", section: "Básica" },
    { value: "province", label: "Provincia", section: "Básica" },
    { value: "city", label: "Ciudad", section: "Básica" },
    { value: "address", label: "Dirección", section: "Básica" },
    { value: "email", label: "Email del espacio", section: "Básica" },
    { value: "phone", label: "Teléfono", section: "Básica" },
    { value: "description", label: "Descripción", section: "Básica" },
    { value: "target", label: "Público objetivo", section: "Básica" },
    { value: "mainActivity", label: "Actividad principal", section: "Básica" },
    {
      value: "managerName",
      label: "Nombre del responsable",
      section: "Personal administrativo",
    },
    {
      value: "managerPhone",
      label: "Teléfono del responsable",
      section: "Personal administrativo",
    },
    {
      value: "managerEmail",
      label: "Email del responsable",
      section: "Personal administrativo",
    },
    {
      value: "technicianInCharge",
      label: "Técnico a cargo",
      section: "Personal técnico",
    },
    {
      value: "technicianRole",
      label: "Rol del técnico",
      section: "Personal técnico",
    },
    {
      value: "technicianPhone",
      label: "Teléfono del técnico",
      section: "Personal técnico",
    },
    {
      value: "technicianEmail",
      label: "Email del técnico",
      section: "Personal técnico",
    },
    { value: "capacity", label: "Capacidad", section: "Infraestructura" },
    {
      value: "projectionEquipment",
      label: "Equipos de proyección",
      section: "Infraestructura",
    },
    {
      value: "soundEquipment",
      label: "Equipos de sonido",
      section: "Infraestructura",
    },
    { value: "screen", label: "Pantalla", section: "Infraestructura" },
    {
      value: "boxofficeRegistration",
      label: "Registro de taquilla",
      section: "Servicios",
    },
    {
      value: "accessibilities",
      label: "Accesibilidades",
      section: "Servicios",
    },
    { value: "services", label: "Servicios", section: "Servicios" },
    {
      value: "operatingHistory",
      label: "Historial operativo",
      section: "Servicios",
    },
    { value: "logoId", label: "Logo", section: "Archivos" },
    { value: "photosId", label: "Fotos", section: "Archivos" },
    {
      value: "ciDocument",
      label: "Documento de identidad",
      section: "Archivos",
    },
    { value: "rucDocument", label: "Documento RUC", section: "Archivos" },
    {
      value: "managerDocument",
      label: "Documento del responsable",
      section: "Archivos",
    },
    { value: "serviceBill", label: "Factura de servicio", section: "Archivos" },
    {
      value: "operatingLicense",
      label: "Licencia de operación",
      section: "Archivos",
    },
  ]

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (
      !isLoading &&
      user &&
      (user.role !== UserRole.ADMIN ||
        !hasPermission(PermissionEnum.ADMIN_SPACES))
    ) {
      router.push("/home")
    }
  }, [isAuthenticated, isLoading, user, hasPermission, router])

  const fetchSpaces = useCallback(async () => {
    setLoadingSpaces(true)
    setError(null)

    try {
      const query: QuerySpacesDto | undefined =
        statusFilter === "all"
          ? { page: 1, limit: 25 }
          : { status: statusFilter, page: 1, limit: 25 }

      const response = await spaceService.getSpaces(query)
      const items = response.data || []
      setSpaces(items)

      if (!items.length) {
        setSelectedSpaceId(null)
        return
      }

      if (
        selectedSpaceId &&
        items.some((item) => item.id === selectedSpaceId)
      ) {
        return
      }

      setSelectedSpaceId(items[0].id)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar espacios"
      setError(message)
    } finally {
      setLoadingSpaces(false)
    }
  }, [selectedSpaceId, statusFilter])

  useEffect(() => {
    if (!isLoading && user && hasPermission(PermissionEnum.ADMIN_SPACES)) {
      fetchSpaces()
    }
  }, [fetchSpaces, hasPermission, isLoading, user])

  const fetchReviews = useCallback(async (spaceId: number) => {
    setLoadingReviews(true)
    try {
      const reviewsData = await spaceService.getReviews(spaceId)
      setReviews(reviewsData)
    } catch (err) {
      console.error("Error al cargar revisiones:", err)
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }, [])

  useEffect(() => {
    if (selectedSpaceId) {
      fetchReviews(selectedSpaceId)
    } else {
      setReviews([])
    }
  }, [selectedSpaceId, fetchReviews])

  const handleMarkUnderReview = async (spaceId: number) => {
    setSaving(true)
    setError(null)

    try {
      await spaceService.updateSpaceStatus(spaceId, {
        status: SpaceStatus.UNDER_REVIEW,
      })
      await fetchSpaces()
      setSelectedSpaceId(spaceId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedSpace) return

    // Validar que request_changes tenga al menos un issue
    if (
      reviewForm.decision === "request_changes" &&
      (!reviewForm.issues || reviewForm.issues.length === 0)
    ) {
      setError("Debes agregar al menos una observación para solicitar cambios")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const nextStatus = decisionToStatus[reviewForm.decision]

      await spaceService.updateSpaceStatus(selectedSpace.id, {
        status: nextStatus,
        rejectionReason:
          reviewForm.decision === "reject"
            ? reviewForm.generalComment
            : undefined,
      })

      await spaceService.submitReview(selectedSpace.id, {
        ...reviewForm,
        issues:
          reviewForm.issues && reviewForm.issues.length > 0
            ? reviewForm.issues
            : undefined,
      })

      await fetchSpaces()

      // Reset form
      setReviewForm({
        decision: "approve",
        generalComment: "",
        issues: [],
      })
      setIssueDraft({
        field: "",
        comment: "",
        severity: "medium",
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo enviar la revisión"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const addIssue = () => {
    if (!issueDraft.field.trim() || !issueDraft.comment.trim()) return

    setReviewForm((prev) => ({
      ...prev,
      issues: [...(prev.issues || []), { ...issueDraft }],
    }))

    setIssueDraft({ field: "", comment: "", severity: "medium" })
  }

  const removeIssue = (index: number) => {
    setReviewForm((prev) => ({
      ...prev,
      issues: (prev.issues || []).filter((_, i) => i !== index),
    }))
  }

  const badgeLabel = (status: SpaceStatus) => {
    switch (status) {
      case SpaceStatus.UNDER_REVIEW:
        return "En revisión"
      case SpaceStatus.VERIFIED:
        return "Aprobado"
      case SpaceStatus.REJECTED:
        return "Rechazado"
      case SpaceStatus.ACTIVE:
        return "Activo"
      default:
        return "Pendiente"
    }
  }

  const badgeClass = (status: SpaceStatus) => {
    switch (status) {
      case SpaceStatus.UNDER_REVIEW:
        return styles.badgeReview
      case SpaceStatus.VERIFIED:
        return styles.badgeVerified
      case SpaceStatus.REJECTED:
        return styles.badgeRejected
      case SpaceStatus.ACTIVE:
        return styles.badgeActive
      default:
        return styles.badgePending
    }
  }

  if (isLoading) {
    return null
  }

  if (
    !user ||
    user.role !== UserRole.ADMIN ||
    !hasPermission(PermissionEnum.ADMIN_SPACES)
  ) {
    return null
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Panel de control · Espacios REA</p>
          <h1 className={styles.title}>Revisión y aprobación</h1>
          <p className={styles.subtitle}>
            Revisa espacios nuevos, marca observaciones y aprueba cuando todo
            esté listo.
          </p>
        </div>
        <div className={styles.filters}>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`${styles.filterChip} ${
                statusFilter === filter.value ? styles.filterChipActive : ""
              }`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <main className={styles.layout}>
        <section className={styles.listPane}>
          <div className={styles.listHeader}>
            <div>
              <h2>Espacios</h2>
              <p className={styles.caption}>
                Filtrados por estado: {statusFilter}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={fetchSpaces}
              disabled={loadingSpaces}
            >
              {loadingSpaces ? "Actualizando..." : "Refrescar"}
            </Button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {loadingSpaces ? (
            <div className={styles.emptyState}>Cargando espacios...</div>
          ) : !spaces.length ? (
            <div className={styles.emptyState}>
              No hay espacios para este estado.
            </div>
          ) : (
            <div className={styles.cards}>
              {spaces.map((space) => (
                <button
                  key={space.id}
                  className={`${styles.card} ${
                    selectedSpaceId === space.id ? styles.cardActive : ""
                  }`}
                  onClick={() => setSelectedSpaceId(space.id)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardHeaderText}>
                      <p className={styles.cardKicker}>{space.province}</p>
                      <h3 className={styles.cardTitle}>{space.name}</h3>
                      <p className={styles.cardMeta}>{space.city}</p>
                    </div>
                    <span
                      className={`${styles.badge} ${badgeClass(space.status)}`}
                    >
                      {badgeLabel(space.status)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className={styles.detailPane}>
          {!selectedSpace ? (
            <div className={styles.placeholder}>
              Selecciona un espacio para revisar.
            </div>
          ) : (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div>
                  <p className={styles.cardKicker}>{selectedSpace.city}</p>
                  <h2 className={styles.detailTitle}>{selectedSpace.name}</h2>
                  <p className={styles.caption}>{selectedSpace.province}</p>
                </div>
                <div className={styles.detailBadges}>
                  <span
                    className={`${styles.badge} ${badgeClass(selectedSpace.status)}`}
                  >
                    {badgeLabel(selectedSpace.status)}
                  </span>
                  {selectedSpace.status === SpaceStatus.PENDING && (
                    <Button
                      variant="secondary"
                      className={styles.smallButton}
                      onClick={() => handleMarkUnderReview(selectedSpace.id)}
                      disabled={saving}
                    >
                      {saving ? "Actualizando..." : "Tomar en revisión"}
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === "info" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  📋 Información general
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "files" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("files")}
                >
                  📎 Archivos adjuntos
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "history" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  📜 Historial ({reviews.length})
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "review" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("review")}
                >
                  ✍️ Nueva revisión
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === "info" && (
                  <div className={styles.detailGrid}>
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>
                        Información básica
                      </h4>
                      <div className={styles.fieldGroup}>
                        <div>
                          <p className={styles.fieldLabel}>Nombre</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.name}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Tipo</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.type}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Provincia</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.province}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Ciudad</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.city}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Dirección</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.address}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Email</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.email}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Teléfono</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.phone}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>Descripción</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.description}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Público objetivo</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.target}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>
                            Actividad principal
                          </p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.mainActivity}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>
                        Personal administrativo
                      </h4>
                      <div className={styles.fieldGroup}>
                        <div>
                          <p className={styles.fieldLabel}>Nombre</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.managerName}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Teléfono</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.managerPhone}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Email</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.managerEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>Personal técnico</h4>
                      <div className={styles.fieldGroup}>
                        <div>
                          <p className={styles.fieldLabel}>Técnico a cargo</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.technicianInCharge}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Rol</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.technicianRole}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Teléfono</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.technicianPhone}
                          </p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Email</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.technicianEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>Infraestructura</h4>
                      <div className={styles.fieldGroup}>
                        <div>
                          <p className={styles.fieldLabel}>Capacidad</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.capacity} personas
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>
                            Equipos de proyección
                          </p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.projectionEquipment.join(", ")}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>Equipos de sonido</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.soundEquipment.join(", ")}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>Pantalla</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.screen.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>
                        Servicios y operación
                      </h4>
                      <div className={styles.fieldGroup}>
                        <div>
                          <p className={styles.fieldLabel}>
                            Registro de taquilla
                          </p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.boxofficeRegistration}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>Accesibilidades</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.accessibilities.join(", ")}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>Servicios</p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.services.join(", ")}
                          </p>
                        </div>
                        <div className={styles.fullWidth}>
                          <p className={styles.fieldLabel}>
                            Historial operativo
                          </p>
                          <p className={styles.fieldValue}>
                            {selectedSpace.operatingHistory}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "files" && (
                  <div className={styles.filesGrid}>
                    {/* Logo */}
                    <div className={styles.fileSection}>
                      <h4 className={styles.sectionTitle}>Logo del espacio</h4>
                      {selectedSpace.assets?.logo ? (
                        <div className={styles.assetCard}>
                          <div className={styles.assetPreview}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedSpace.assets.logo.url}
                              alt="Logo"
                              className={styles.logoPreview}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                const placeholder = e.currentTarget
                                  .nextElementSibling as HTMLElement
                                if (placeholder)
                                  placeholder.style.display = "flex"
                              }}
                            />
                            <div
                              className={styles.assetPlaceholder}
                              style={{ display: "none" }}
                            >
                              🖼️
                              <p>No disponible</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.noData}>Sin logo</p>
                      )}
                    </div>

                    {/* Fotos */}
                    <div className={styles.fileSection}>
                      <h4 className={styles.sectionTitle}>
                        Fotos del espacio (
                        {selectedSpace.assets?.photos.length || 0})
                      </h4>
                      {selectedSpace.assets?.photos.length ? (
                        <div className={styles.photosGrid}>
                          {selectedSpace.assets.photos.map((photo, index) => (
                            <div key={photo.id} className={styles.assetCard}>
                              <div className={styles.assetPreview}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.url}
                                  alt={`Foto ${index + 1}`}
                                  className={styles.photoPreview}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                    const placeholder = e.currentTarget
                                      .nextElementSibling as HTMLElement
                                    if (placeholder)
                                      placeholder.style.display = "flex"
                                  }}
                                />
                                <div
                                  className={styles.assetPlaceholder}
                                  style={{ display: "none" }}
                                >
                                  📷
                                  <p>No disponible</p>
                                </div>
                              </div>
                              <p className={styles.assetId}>Foto {index + 1}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.noData}>Sin fotos</p>
                      )}
                    </div>

                    {/* Documentos Legales */}
                    <div className={styles.fileSection}>
                      <h4 className={styles.sectionTitle}>
                        Documentos legales
                      </h4>
                      {!selectedSpace.assets?.documents.ci &&
                      !selectedSpace.assets?.documents.ruc &&
                      !selectedSpace.assets?.documents.manager &&
                      !selectedSpace.assets?.documents.serviceBill &&
                      !selectedSpace.assets?.documents.operatingLicense ? (
                        <p className={styles.noData}>
                          No hay documentos disponibles
                        </p>
                      ) : (
                        <div className={styles.documentsGrid}>
                          {selectedSpace.assets?.documents.ci && (
                            <div className={styles.documentCard}>
                              <div className={styles.documentIcon}>📄</div>
                              <div className={styles.documentInfo}>
                                <p className={styles.documentName}>
                                  Cédula de identidad
                                </p>
                                <a
                                  href={selectedSpace.assets.documents.ci.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.viewLink}
                                >
                                  Ver documento →
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedSpace.assets?.documents.ruc && (
                            <div className={styles.documentCard}>
                              <div className={styles.documentIcon}>📋</div>
                              <div className={styles.documentInfo}>
                                <p className={styles.documentName}>RUC</p>
                                <a
                                  href={selectedSpace.assets.documents.ruc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.viewLink}
                                >
                                  Ver documento →
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedSpace.assets?.documents.manager && (
                            <div className={styles.documentCard}>
                              <div className={styles.documentIcon}>👤</div>
                              <div className={styles.documentInfo}>
                                <p className={styles.documentName}>
                                  Documento del responsable
                                </p>
                                <a
                                  href={
                                    selectedSpace.assets.documents.manager.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.viewLink}
                                >
                                  Ver documento →
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedSpace.assets?.documents.serviceBill && (
                            <div className={styles.documentCard}>
                              <div className={styles.documentIcon}>🧾</div>
                              <div className={styles.documentInfo}>
                                <p className={styles.documentName}>
                                  Factura de servicio
                                </p>
                                <a
                                  href={
                                    selectedSpace.assets.documents.serviceBill
                                      .url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.viewLink}
                                >
                                  Ver documento →
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedSpace.assets?.documents.operatingLicense && (
                            <div className={styles.documentCard}>
                              <div className={styles.documentIcon}>📜</div>
                              <div className={styles.documentInfo}>
                                <p className={styles.documentName}>
                                  Licencia de operación
                                </p>
                                <a
                                  href={
                                    selectedSpace.assets.documents
                                      .operatingLicense.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.viewLink}
                                >
                                  Ver documento →
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className={styles.historyContent}>
                    {loadingReviews ? (
                      <p className={styles.caption}>Cargando historial...</p>
                    ) : reviews.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>No hay revisiones previas para este espacio</p>
                      </div>
                    ) : (
                      <div className={styles.timeline}>
                        {reviews.map((review) => (
                          <div key={review.id} className={styles.timelineItem}>
                            <div className={styles.timelineHeader}>
                              <span
                                className={`${styles.badge} ${badgeClass(
                                  review.decision === "approve"
                                    ? SpaceStatus.VERIFIED
                                    : review.decision === "reject"
                                      ? SpaceStatus.REJECTED
                                      : SpaceStatus.UNDER_REVIEW,
                                )}`}
                              >
                                {review.decision === "approve"
                                  ? "Aprobado"
                                  : review.decision === "reject"
                                    ? "Rechazado"
                                    : "Cambios solicitados"}
                              </span>
                              <span className={styles.timelineDate}>
                                {new Date(review.createdAt).toLocaleDateString(
                                  "es-EC",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            {review.generalComment && (
                              <p className={styles.timelineComment}>
                                {review.generalComment}
                              </p>
                            )}
                            {review.issues && review.issues.length > 0 && (
                              <div className={styles.timelineIssues}>
                                <p className={styles.fieldLabel}>
                                  Observaciones:
                                </p>
                                {review.issues.map(
                                  (issue: Issue, idx: number) => (
                                    <div
                                      key={idx}
                                      className={styles.timelineIssue}
                                    >
                                      <strong>{issue.field}:</strong>{" "}
                                      {issue.comment}
                                      {issue.severity && (
                                        <span className={styles.issueSeverity}>
                                          {" "}
                                          ({issue.severity})
                                        </span>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.section}>
                  <h3>Notas de revisión</h3>
                  <div className={styles.radioGroup}>
                    {[
                      { value: "approve", label: "Aprobar" },
                      { value: "request_changes", label: "Solicitar cambios" },
                      { value: "reject", label: "Rechazar" },
                    ].map((option) => (
                      <label key={option.value} className={styles.radioOption}>
                        <input
                          type="radio"
                          name="decision"
                          value={option.value}
                          checked={reviewForm.decision === option.value}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              decision: e.target
                                .value as ReviewForm["decision"],
                            }))
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className={styles.controlGroup}>
                    <label htmlFor="generalComment">Comentario general</label>
                    <textarea
                      id="generalComment"
                      className={styles.textarea}
                      placeholder="Notas visibles para el solicitante"
                      value={reviewForm.generalComment || ""}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          generalComment: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.controlGroup}>
                    <div className={styles.controlHeader}>
                      <label>Observaciones puntuales</label>
                      <Button
                        variant="secondary"
                        className={styles.ghostButton}
                        onClick={addIssue}
                      >
                        Añadir observación
                      </Button>
                    </div>

                    <div className={styles.issueComposer}>
                      <div className={styles.selectWrapper}>
                        <label>Campo a observar</label>
                        <select
                          value={issueDraft.field}
                          onChange={(e) =>
                            setIssueDraft((prev) => ({
                              ...prev,
                              field: e.target.value,
                            }))
                          }
                        >
                          <option value="">Selecciona un campo...</option>
                          {reviewableFields.map((field) => (
                            <optgroup key={field.section} label={field.section}>
                              {reviewableFields
                                .filter((f) => f.section === field.section)
                                .map((f) => (
                                  <option key={f.value} value={f.value}>
                                    {f.label}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Comentario"
                        placeholder="Qué falta o se debe corregir"
                        value={issueDraft.comment}
                        onChange={(e) =>
                          setIssueDraft((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                      />
                      <div className={styles.selectWrapper}>
                        <label>Severidad</label>
                        <select
                          value={issueDraft.severity}
                          onChange={(e) =>
                            setIssueDraft((prev) => ({
                              ...prev,
                              severity: e.target.value as Issue["severity"],
                            }))
                          }
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                    </div>

                    {(reviewForm.issues || []).length > 0 && (
                      <div className={styles.issuesList}>
                        {(reviewForm.issues || []).map((issue, index) => {
                          const fieldInfo = reviewableFields.find(
                            (f) => f.value === issue.field,
                          )
                          return (
                            <div
                              key={`${issue.field}-${index}`}
                              className={styles.issueItem}
                            >
                              <div>
                                <p className={styles.issueField}>
                                  {fieldInfo?.label || issue.field}
                                </p>
                                <p className={styles.issueComment}>
                                  {issue.comment}
                                </p>
                                <p className={styles.issueSeverity}>
                                  Severidad: {issue.severity}
                                </p>
                              </div>
                              <button
                                className={styles.removeBtn}
                                onClick={() => removeIssue(index)}
                                aria-label="Quitar observación"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    onClick={fetchSpaces}
                    disabled={saving}
                  >
                    Volver a cargar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitReview}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar revisión"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
