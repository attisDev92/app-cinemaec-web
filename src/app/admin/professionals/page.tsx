"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { professionalsService, type Professional } from "@/features/professionals"
import { PermissionEnum, UserRole } from "@/shared/types"
import styles from "./professionals.module.css"

export default function AdminProfessionalsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { hasPermission } = usePermissions()

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    name: "",
    dniNumber: "",
    claimStatus: "all",
  })

  const hasAdminProfessionalsPermission =
    user?.role === UserRole.ADMIN &&
    hasPermission(PermissionEnum.ADMIN_PROFESSIONALS)

  useEffect(() => {
    if (!authLoading && user && !hasAdminProfessionalsPermission) {
      router.push("/admin")
    }
  }, [authLoading, user, hasAdminProfessionalsPermission, router])

  useEffect(() => {
    const loadProfessionals = async () => {
      if (!hasAdminProfessionalsPermission) return

      try {
        setIsLoading(true)
        const data = await professionalsService.getAll()
        setProfessionals(data)
        setError(null)
      } catch (err) {
        setError(
          (err as { message?: string })?.message ||
            "No se pudieron cargar los profesionales registrados",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProfessionals()
  }, [hasAdminProfessionalsPermission])

  const filteredProfessionals = useMemo(() => {
    const nameQuery = filters.name.trim().toLowerCase()
    const dniQuery = filters.dniNumber.trim()

    return professionals.filter((professional) => {
      const matchesName =
        !nameQuery || professional.name.toLowerCase().includes(nameQuery)
      const matchesDni = !dniQuery || (professional.dniNumber || "").includes(dniQuery)
      const matchesClaimStatus =
        filters.claimStatus === "all" ||
        (filters.claimStatus === "claimed"
          ? Boolean(professional.ownerId)
          : !professional.ownerId)

      return matchesName && matchesDni && matchesClaimStatus
    })
  }, [professionals, filters])

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  if (!user || !hasAdminProfessionalsPermission) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Acceso denegado</h2>
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Revisión de Profesionales</h1>
            <p className={styles.subtitle}>
              Consulta profesionales registrados y su estado de reclamación
            </p>
          </div>
          <button className={styles.backBtn} onClick={() => router.push("/admin")}>
            ← Volver al Panel
          </button>
        </header>

        {error && (
          <div className={styles.alert} data-type="error">
            <span className={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando profesionales...</p>
          </div>
        ) : (
          <>
            <div className={styles.statsBar}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{filteredProfessionals.length}</span>
                <span className={styles.statLabel}>Total filtrado</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {filteredProfessionals.filter((item) => item.ownerId).length}
                </span>
                <span className={styles.statLabel}>Reclamados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {filteredProfessionals.filter((item) => !item.ownerId).length}
                </span>
                <span className={styles.statLabel}>Sin reclamar</span>
              </div>
            </div>

            <div className={styles.filtersBar}>
              <div className={styles.filterField}>
                <label htmlFor="filter-name">Nombre</label>
                <input
                  id="filter-name"
                  type="text"
                  placeholder="Buscar por nombre"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label htmlFor="filter-dni">Cédula</label>
                <input
                  id="filter-dni"
                  type="text"
                  placeholder="Buscar por cédula"
                  value={filters.dniNumber}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dniNumber: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label htmlFor="filter-claim-status">Estado de reclamación</label>
                <select
                  id="filter-claim-status"
                  value={filters.claimStatus}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, claimStatus: e.target.value }))
                  }
                >
                  <option value="all">Todos</option>
                  <option value="claimed">Reclamados</option>
                  <option value="unclaimed">Sin reclamar</option>
                </select>
              </div>

              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={() =>
                  setFilters({
                    name: "",
                    dniNumber: "",
                    claimStatus: "all",
                  })
                }
              >
                Limpiar filtros
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Contacto</th>
                    <th>Vinculado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessionals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        No hay profesionales que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    filteredProfessionals
                      .slice()
                      .sort((a, b) => b.id - a.id)
                      .map((professional) => (
                        <tr key={professional.id}>
                          <td className={styles.idCell}>{professional.id}</td>
                          <td className={styles.nameCell}>{professional.name}</td>
                          <td>{professional.dniNumber || "-"}</td>
                          <td>
                            {professional.mobile || professional.phone || "Sin contacto"}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                professional.ownerId ? styles.active : styles.inactive
                              }`}
                            >
                              {professional.ownerId
                                ? `Sí (Usuario #${professional.ownerId})`
                                : "No"}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
