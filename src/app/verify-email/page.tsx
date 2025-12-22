"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import styles from "./page.module.css"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h1 className={styles.title}>¡Verifica tu email!</h1>

            <p className={styles.description}>
              Hemos enviado un correo de verificación a:
            </p>

            <p className={styles.email}>{email}</p>

            <div className={styles.instructions}>
              <p className={styles.instructionText}>
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace
                de verificación para activar tu cuenta.
              </p>

              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepText}>
                    Abre tu correo electrónico
                  </span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepText}>
                    Busca el email de CinemaEC
                  </span>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepText}>
                    Haz clic en el enlace de verificación
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.notes}>
              <p className={styles.note}>
                💡 <strong>Nota:</strong> Si no ves el correo, revisa tu carpeta
                de spam o correo no deseado.
              </p>
            </div>

            <div className={styles.actions}>
              <Link href="/login">
                <Button variant="primary">Ir al inicio de sesión</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
