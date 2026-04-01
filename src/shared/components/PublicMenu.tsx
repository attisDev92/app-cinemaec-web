"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./PublicMenu.module.css"

export function PublicMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <div className={styles.publicMenuContainer}>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="Menú"
        aria-expanded={isOpen}
      >
        <span className={styles.line1}></span>
        <span className={styles.line2}></span>
        <span className={styles.line3}></span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={closeMenu} />
      )}

      <nav className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuClose}>
          <button
            className={styles.closeBtn}
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className={styles.menuContent}>
          <h3 className={styles.menuTitle}>Explora</h3>
          
          <Link
            href="/public/catalog"
            className={styles.menuItem}
            onClick={closeMenu}
          >
            📽️ Catálogo de Proyectos
          </Link>

          <Link
            href="/public/professionals"
            className={styles.menuItem}
            onClick={closeMenu}
          >
            👥 Profesionales
          </Link>

          <Link
            href="/public/ecuatorian-movies"
            className={styles.menuItem}
            onClick={closeMenu}
          >
            🎬 Películas Ecuatorianas
          </Link>
        </div>
      </nav>
    </div>
  )
}
