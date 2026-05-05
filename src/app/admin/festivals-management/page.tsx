"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { festivalService } from "@/features/festivals/services/festival.service"
import { FestivalManagementTable } from "@/features/festivals/components/FestivalManagementTable"
import { Festival } from "@/features/festivals/types"
import { Navbar } from "@/shared/components/Navbar"
import { PermissionEnum, UserRole } from "@/shared/types"
import styles from "./page.module.css"

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

const includesNormalized = (source: string, query: string) =>
  normalizeText(source).includes(normalizeText(query))

export default function FestivalsAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [festivalsLoading, setFestivalsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "claims">("list")
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    active: "all",
    call: "all",
  })

  const hasFestivalsAdminPermission = hasPermission(PermissionEnum.ADMIN_FESTIVALS)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && (user.role !== UserRole.ADMIN || !hasFestivalsAdminPermission)) {
        router.push("/home")
      } else {
        loadFestivals()
      }
    }
  }, [isAuthenticated, isLoading, user, router, hasFestivalsAdminPermission])

  const loadFestivals = async () => {
    try {
      setFestivalsLoading(true)
      setError(null)
      const data = await festivalService.getAll()
      setFestivals(data)
    } catch (err: unknown) {
      const apiError = err as {
        message?: string
        statusCode?: number
        isNetworkError?: boolean
      }

      if (apiError.statusCode === 401) {
        setError("Tu sesión expiró. Inicia sesión nuevamente.")
        return
      }

      if (apiError.isNetworkError) {
        setError("No se pudo conectar con el servidor.")
        return
      }

      console.error("Error loading festivals:", err)
      setError(apiError.message || "Error al cargar los festivales")
    } finally {
      setFestivalsLoading(false)
    }
  }

  const handleDeleteFestival = async (id: number) => {
    try {
      await festivalService.delete(id)
    } catch (err) {
      console.error("Error deleting festival:", err)
      throw err
    }
  }

  const festivalTypeOptions = useMemo(
    () =>
      [...new Set(festivals.map((festival) => festival.type).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [festivals],
  )

  const filteredFestivals = useMemo(() => {
    const { name, type, active, call } = filters

    return festivals.filter((festival) => {
      const matchesName =
        !name.trim() || includesNormalized(festival.name || "", name.trim())
      const matchesType = !type || festival.type === type
      const matchesActive =
        active === "all" ||
        (active === "active" ? festival.isActive : !festival.isActive)
      const matchesCall =
        call === "all" ||
        (call === "open" ? festival.hasCall : !festival.hasCall)

      return matchesName && matchesType && matchesActive && matchesCall
    })
  }, [filters, festivals])

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.loadingMessage}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (
    !isAuthenticated ||
    (user && (user.role !== UserRole.ADMIN || !hasFestivalsAdminPermission))
  ) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.errorMessage}>
            No tienes permiso para acceder a esta página
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Administración de Festivales</h1>
          <p>Gestiona todos los festivales, muestras y proyectos registrados en el sistema</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "list" ? styles.active : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Lista de Festivales ({festivals.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "claims" ? styles.active : ""}`}
            onClick={() => setActiveTab("claims")}
          >
            Solicitudes (0)
          </button>
          <button
            className={styles.tab}
            onClick={() => router.push("/admin/festivals/new")}
          >
            Crear Nuevo Festival
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.tabContent}>
          {activeTab === "list" && (
            <>
              <div className={styles.filtersBar}>
                <div className={styles.filterField}>
                  <label htmlFor="festival-name-filter">Nombre</label>
                  <input
                    id="festival-name-filter"
                    type="text"
                    placeholder="Buscar por nombre de festival"
                    value={filters.name}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="festival-type-filter">Tipo</label>
                  <select
                    id="festival-type-filter"
                    value={filters.type}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, type: event.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    {festivalTypeOptions.map((typeOption) => (
                      <option key={typeOption} value={typeOption}>
                        {typeOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="festival-active-filter">Activo</label>
                  <select
                    id="festival-active-filter"
                    value={filters.active}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, active: event.target.value }))
                    }
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                <div className={styles.filterField}>
                  <label htmlFor="festival-call-filter">Convocatoria</label>
                  <select
                    id="festival-call-filter"
                    value={filters.call}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, call: event.target.value }))
                    }
                  >
                    <option value="all">Todos</option>
                    <option value="open">Abierta</option>
                    <option value="closed">Cerrada</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={() =>
                    setFilters({
                      name: "",
                      type: "",
                      active: "all",
                      call: "all",
                    })
                  }
                >
                  Limpiar filtros
                </button>
              </div>

              {!festivalsLoading && (
                <div className={styles.filterResults}>
                  Mostrando {filteredFestivals.length} de {festivals.length} festival(es)
                </div>
              )}

              <FestivalManagementTable
                festivals={filteredFestivals}
                isLoading={festivalsLoading}
                onRefresh={loadFestivals}
                onDelete={handleDeleteFestival}
              />
            </>
          )}

          {activeTab === "claims" && (
            <div className={styles.emptyClaims}>No hay solicitudes de festivales</div>
          )}
        </div>
      </div>
    </div>
  )
}
