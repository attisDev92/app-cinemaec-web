"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Button } from "@/shared/components/ui"
import styles from "./not-found.module.css"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.content}>
            <div className={styles.errorCode}>404</div>

            <h1 className={styles.title}>Página no encontrada</h1>

            <p className={styles.description}>
              Lo sentimos, la página que estás buscando no existe o ha sido
              movida.
            </p>

            <div className={styles.illustration}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className={styles.actions}>
              <Button onClick={() => router.back()} variant="secondary">
                ← Volver atrás
              </Button>

              <Link href="/">
                <Button variant="primary">Ir al inicio</Button>
              </Link>
            </div>

            <div className={styles.links}>
              <p className={styles.linksTitle}>Enlaces útiles:</p>
              <div className={styles.linksList}>
                <Link href="/login" className={styles.link}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className={styles.link}>
                  Registrarse
                </Link>
                <Link href="/home" className={styles.link}>
                  Página principal
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
