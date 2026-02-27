"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { usePathname } from "next/navigation"
import { Button } from "@/shared/components/ui"
import { UserRole, PermissionEnum } from "@/shared/types"
import { LegalStatus } from "@/features/profile/types"
import { NotificationDropdown } from "@/shared/components/NotificationDropdown"
import styles from "./Navbar.module.css"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const { profile } = useProfile()
  const pathname = usePathname()
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const adminDropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role === UserRole.ADMIN
  const isUserRole = user?.role === UserRole.USER

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      // Error handled by logout function
    }
  }

  // Determinar el nombre a mostrar
  const displayName =
    profile?.legalStatus === LegalStatus.LEGAL_ENTITY
      ? profile?.tradeName
      : profile?.fullName || user?.email

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsServicesOpen(false)
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(target)
      ) {
        setIsAdminOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const adminModules = [
    {
      id: "dashboard",
      label: "Panel de Control",
      icon: "📊",
      route: "/admin",
      permission: PermissionEnum.ADMIN_SPACES,
    },
    {
      id: "spaces",
      label: "Gestión de Espacios",
      icon: "🎬",
      route: "/admin/spaces",
      permission: PermissionEnum.ADMIN_SPACES,
    },
    {
      id: "movies",
      label: "Gestión de Películas",
      icon: "🎥",
      route: "/admin/movies-management",
      permission: PermissionEnum.ADMIN_MOVIES,
    },
    {
      id: "requests",
      label: "Solicitudes de Películas",
      icon: "📋",
      route: "/admin/movie-requests",
      permission: PermissionEnum.APPROVE_MOVIES_REQUEST,
    },
    {
      id: "users",
      label: "Gestión de Usuarios",
      icon: "👥",
      route: "/admin/users",
      permission: PermissionEnum.ADMIN_USERS,
    },
    {
      id: "roles",
      label: "Roles y Permisos",
      icon: "🔐",
      route: "/admin/roles",
      permission: PermissionEnum.ASSIGN_ROLES,
    },
    {
      id: "reports",
      label: "Reportes",
      icon: "📊",
      route: "/admin/reports",
      permission: PermissionEnum.VIEW_REPORTS,
    },
    {
      id: "export",
      label: "Exportar Datos",
      icon: "📥",
      route: "/admin/export",
      permission: PermissionEnum.EXPORT_DATA,
    },
  ]

  const allowedAdminModules = adminModules.filter((module) =>
    hasPermission(module.permission),
  )

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <Link href="/" className={styles.logo}>
              CinemaEC
            </Link>

            {isAuthenticated && isUserRole && (
              <div className={styles.menu}>
                <div className={styles.dropdown} ref={dropdownRef}>
                  <button
                    className={`${styles.dropdownButton} ${
                      pathname === "/home" ||
                      pathname?.startsWith("/rea-spaces") ||
                      pathname?.startsWith("/movies-management") ||
                      pathname?.startsWith("/professional-profile") ||
                      pathname === "/profile"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                  >
                    Menú
                    <span
                      className={`${styles.dropdownArrow} ${isServicesOpen ? styles.open : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  {isServicesOpen && (
                    <div className={styles.dropdownMenu}>
                      <Link
                        href="/home"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        🏠 Home
                      </Link>
                      <Link
                        href="/profile"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        👤 Mi Perfil
                      </Link>
                      <Link
                        href="/notifications"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        🔔 Notificaciones
                      </Link>
                      <div className={styles.dropdownDivider}></div>
                      <div className={styles.dropdownSectionTitle}>Vive Cine</div>
                      <Link
                        href="/rea-spaces/register"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        ✍️ Registrar Espacio Audiovisual
                      </Link>
                      <Link
                        href="/rea-spaces"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        🎬 Gestionar Espacios Audiovisuales (REA)
                      </Link>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        👤 Usuario del Banco de Contenidos
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        🎞️ Banco de Contenidos
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        🎓 Talleres y Capacitaciones
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <div className={styles.dropdownSectionTitle}>Haz Cine</div>
                      {profile?.legalStatus === LegalStatus.LEGAL_ENTITY ? (
                        <div
                          className={styles.dropdownItem + " " + styles.disabled}
                        >
                          🏢 Directorio de Empresas
                          <span className={styles.comingSoon}>Próximamente</span>
                        </div>
                      ) : (
                        <Link
                          href="/professional-profile"
                          className={styles.dropdownItem}
                          onClick={() => setIsServicesOpen(false)}
                        >
                          👤 Perfil de Profesionales
                        </Link>
                      )}
                      <Link
                        href="/movies-management"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        🎬 Gestión de Películas
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAuthenticated && isAdmin && allowedAdminModules.length > 0 && (
              <div className={styles.menu}>
                <div className={styles.dropdown} ref={adminDropdownRef}>
                  <button
                    className={`${styles.dropdownButton} ${pathname?.startsWith("/admin") ? styles.active : ""}`}
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                  >
                    Admin
                    <span
                      className={`${styles.dropdownArrow} ${isAdminOpen ? styles.open : ""}`}
                    >
                      ▼
                    </span>
                  </button>

                  {isAdminOpen && (
                    <div className={styles.dropdownMenu}>
                      {allowedAdminModules.map((module) => (
                        <Link
                          key={module.id}
                          href={module.route}
                          className={styles.dropdownItem}
                          onClick={() => setIsAdminOpen(false)}
                        >
                          {module.icon} {module.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.rightSection}>
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <span className={styles.greeting}>Hola, {displayName}</span>
                <Button
                  onClick={handleLogout}
                  variant="danger"
                  className={styles.logoutButton}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.navLink}>
                  Iniciar Sesión
                </Link>
                <Link href="/register" className={styles.registerButton}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
