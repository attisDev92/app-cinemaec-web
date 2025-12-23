"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { usePathname } from "next/navigation"
import { Button } from "@/shared/components/ui"
import { UserRole } from "@/shared/types/auth"
import { LegalStatus } from "@/features/profile/types"
import { NotificationDropdown } from "@/shared/components/NotificationDropdown"
import styles from "./Navbar.module.css"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { profile } = useProfile()
  const pathname = usePathname()
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <Link href="/" className={styles.logo}>
              CinemaEC
            </Link>

            {isAuthenticated && (
              <div className={styles.menu}>
                {/* Menú desplegable de servicios */}
                <div className={styles.dropdown} ref={dropdownRef}>
                  <button
                    className={`${styles.dropdownButton} ${
                      pathname === "/home" ||
                      pathname === "/rea-spaces" ||
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
                      <Link
                        href="/rea-spaces"
                        className={styles.dropdownItem}
                        onClick={() => setIsServicesOpen(false)}
                      >
                        🎬 Red de Espacios Audiovisuales
                      </Link>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        🎞️ Banco de Contenidos
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        📍 Catálogo de Locaciones
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                      <div
                        className={styles.dropdownItem + " " + styles.disabled}
                      >
                        🏢 Directorio de Productoras
                        <span className={styles.comingSoon}>Próximamente</span>
                      </div>
                    </div>
                  )}
                </div>

                {user?.role === UserRole.ADMIN && (
                  <Link
                    href="/admin"
                    className={`${styles.menuLink} ${pathname?.startsWith("/admin") ? styles.active : ""}`}
                  >
                    Admin
                  </Link>
                )}
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
