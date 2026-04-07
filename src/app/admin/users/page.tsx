"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PermissionEnum, UserRole } from "@/shared/types"
import { useUserList } from "@/features/users/hooks/useUserList"
import styles from "./users.module.css"

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { users, loading, error } = useUserList()
  const [filters, setFilters] = useState({
    email: "",
    cedula: "",
    status: "all",
  })

  // Filtrar solo usuarios regulares (no admins)
  const regularUsers = users.filter((u) => u.role === UserRole.USER)

  const filteredUsers = useMemo(() => {
    const emailQuery = filters.email.trim().toLowerCase()
    const cedulaQuery = filters.cedula.trim()

    return regularUsers.filter((u) => {
      const matchesEmail =
        !emailQuery || u.email.toLowerCase().includes(emailQuery)
      const matchesCedula = !cedulaQuery || u.cedula.includes(cedulaQuery)
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" ? u.isActive : !u.isActive)

      return matchesEmail && matchesCedula && matchesStatus
    })
  }, [regularUsers, filters])

  // Verificar permisos
  const hasAdminUsersPermission =
    user?.role === UserRole.ADMIN &&
    user?.permissions?.includes(PermissionEnum.ADMIN_USERS)

  // Redirigir si no tienes el permiso requerido
  useEffect(() => {
    if (!authLoading && user) {
      if (!hasAdminUsersPermission) {
        router.push("/admin")
      }
    }
  }, [user, authLoading, router, hasAdminUsersPermission])

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

  if (!user || !hasAdminUsersPermission) {
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
            <h1 className={styles.title}>Gestión de Usuarios</h1>
            <p className={styles.subtitle}>
              Visualiza y administra usuarios del sistema
            </p>
          </div>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/admin")}
          >
            ← Volver al Panel
          </button>
        </header>

        {error && (
          <div className={styles.alert} data-type="error">
            <span className={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className={styles.statsBar}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{filteredUsers.length}</span>
                <span className={styles.statLabel}>Total Usuarios</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {filteredUsers.filter((u) => u.isActive).length}
                </span>
                <span className={styles.statLabel}>Activos</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {filteredUsers.filter((u) => u.profileId).length}
                </span>
                <span className={styles.statLabel}>Con Perfil</span>
              </div>
            </div>

            <div className={styles.filtersBar}>
              <div className={styles.filterField}>
                <label htmlFor="filter-email">Email</label>
                <input
                  id="filter-email"
                  type="text"
                  placeholder="Buscar por email"
                  value={filters.email}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label htmlFor="filter-cedula">Cédula</label>
                <input
                  id="filter-cedula"
                  type="text"
                  placeholder="Buscar por cédula"
                  value={filters.cedula}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, cedula: e.target.value }))
                  }
                />
              </div>

              <div className={styles.filterField}>
                <label htmlFor="filter-status">Estado</label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="all">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={() =>
                  setFilters({ email: "", cedula: "", status: "all" })
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
                    <th>Email</th>
                    <th>Cédula</th>
                    <th>Perfil</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyState}>
                        No hay usuarios que coincidan con los filtros
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className={styles.idCell}>{userItem.id}</td>
                        <td className={styles.email}>{userItem.email}</td>
                        <td>{userItem.cedula}</td>
                        <td>
                          {userItem.profileId ? (
                            <span className={styles.statusBadge}>
                              ✅ Completo
                            </span>
                          ) : (
                            <span
                              className={`${styles.statusBadge} ${styles.inactive}`}
                            >
                              ❌ Incompleto
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              userItem.isActive
                                ? styles.active
                                : styles.inactive
                            }`}
                          >
                            {userItem.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className={styles.date}>
                          {userItem.lastLogin
                            ? new Date(userItem.lastLogin).toLocaleDateString(
                                "es-EC",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Nunca"}
                        </td>
                        <td>
                          <button
                            className={styles.btnAction}
                            onClick={() =>
                              router.push(`/admin/users/${userItem.id}/profile`)
                            }
                            title="Ver perfil completo"
                          >
                            Ver Perfil
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.info}>
              <h3>ℹ️ Información</h3>
              <ul>
                <li>
                  Esta sección muestra solo usuarios con rol{" "}
                  <strong>USER</strong>
                </li>
                <li>
                  Puedes ver el perfil completo de cada usuario haciendo clic en
                  &quot;Ver Perfil&quot;
                </li>
                <li>
                  Para gestionar roles y permisos de administradores, ve a{" "}
                  <strong>Roles y Permisos</strong> en el panel de
                  administración
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  )
}
