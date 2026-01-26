"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PermissionEnum, UserRole } from "@/shared/types"
import { useUserList } from "@/features/users/hooks/useUserList"
import styles from "../users/users.module.css"

export default function RolesAdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { users, loading, error } = useUserList()
  const [searchId, setSearchId] = useState("")
  const [searchError, setSearchError] = useState("")

  // Verificar permisos
  const hasAssignRolesPermission =
    user?.role === UserRole.ADMIN &&
    user?.permissions?.includes(PermissionEnum.ASSIGN_ROLES)

  // Redirigir si no tienes el permiso requerido
  useEffect(() => {
    if (!authLoading && user) {
      if (!hasAssignRolesPermission) {
        router.push("/admin")
      }
    }
  }, [user, authLoading, router, hasAssignRolesPermission])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError("")

    const id = parseInt(searchId.trim())
    if (isNaN(id) || id <= 0) {
      setSearchError("Por favor ingresa un ID de usuario válido")
      return
    }

    router.push(`/admin/users/${id}/permissions`)
  }

  const handleManagePermissions = (userId: number) => {
    router.push(`/admin/users/${userId}/permissions`)
  }

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

  if (!user || !hasAssignRolesPermission) {
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
            <h1 className={styles.title}>🔐 Roles y Permisos</h1>
            <p className={styles.subtitle}>
              Asigna y gestiona roles y permisos de usuarios del sistema
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
                <span className={styles.statValue}>{users.length}</span>
                <span className={styles.statLabel}>Total Usuarios</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {users.filter((u) => u.role === UserRole.ADMIN).length}
                </span>
                <span className={styles.statLabel}>Administradores</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {users.filter((u) => u.isActive).length}
                </span>
                <span className={styles.statLabel}>Activos</span>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Cédula</th>
                    <th>Rol</th>
                    <th>Permisos</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyState}>
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className={styles.idCell}>{userItem.id}</td>
                        <td className={styles.email}>{userItem.email}</td>
                        <td>{userItem.cedula}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              styles[userItem.role]
                            }`}
                          >
                            {userItem.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {userItem.role === UserRole.ADMIN ? (
                            <div className={styles.permissions}>
                              {userItem.permissions &&
                              userItem.permissions.length > 0 ? (
                                <>
                                  <span className={styles.permissionCount}>
                                    {userItem.permissions.length} permiso(s)
                                  </span>
                                  <div className={styles.permissionTooltip}>
                                    {userItem.permissions.join(", ")}
                                  </div>
                                </>
                              ) : (
                                <span className={styles.noPermissions}>
                                  Sin permisos
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={styles.na}>N/A</span>
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
                            onClick={() => handleManagePermissions(userItem.id)}
                            title="Gestionar roles y permisos"
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className={styles.searchCard} style={{ marginTop: "2rem" }}>
          <div className={styles.searchHeader}>
            <h2 className={styles.searchTitle}>🔍 O Buscar por ID</h2>
            <p className={styles.searchDescription}>
              Si prefieres, ingresa el ID del usuario directamente
            </p>
          </div>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="userId" className={styles.label}>
                ID de Usuario
              </label>
              <input
                id="userId"
                type="text"
                className={styles.input}
                placeholder="Ej: 3"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value)
                  setSearchError("")
                }}
              />
              {searchError && (
                <span className={styles.inputError}>{searchError}</span>
              )}
            </div>

            <button type="submit" className={styles.btnPrimary}>
              Buscar Usuario
            </button>
          </form>
        </div>

        <div className={styles.info}>
          <h3>ℹ️ Información importante</h3>
          <ul>
            <li>
              Solo usuarios con rol <strong>ADMIN</strong> pueden tener permisos
              asignados
            </li>
            <li>
              Los administradores deben tener al menos{" "}
              <strong>1 permiso</strong> asignado
            </li>
            <li>
              Click en <strong>"Gestionar"</strong> para editar el rol y
              permisos de cualquier usuario
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
