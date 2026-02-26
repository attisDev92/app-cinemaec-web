"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card } from "@/shared/components/ui"
import { MovieForm } from "@/app/admin/movies/page"
import styles from "./page.module.css"

function MovieRegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const existingMovieId = searchParams.get("existingMovieId")
  const supportDocumentAssetId = searchParams.get("supportDocumentAssetId")
  const claimRequestId = searchParams.get("claimRequestId")
  const requestSubmitted = searchParams.get("requestSubmitted") === "1"

  const mode = useMemo(() => {
    if (existingMovieId) {
      return "existing"
    }
    return "new"
  }, [existingMovieId])

  if (mode === "new") {
    return <MovieForm mode="user" />
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Solicitud registrada</h1>

          <Card>
            {requestSubmitted && (
              <div className={styles.successNotice}>
                Tu solicitud fue enviada correctamente y será revisada por el equipo
                administrador.
              </div>
            )}

            <p className={styles.text}>
              Se detectó una película existente para solicitud de modificación.
            </p>
            <p className={styles.text}>ID de película: {existingMovieId}</p>
            <p className={styles.text}>Documento de respaldo: {supportDocumentAssetId}</p>
            <p className={styles.text}>Solicitud registrada: {claimRequestId}</p>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/movies-management/new")}
              >
                Volver
              </Button>
              <Button type="button" onClick={() => router.push("/movies-management")}>
                Finalizar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function MovieRegisterPage() {
  return (
    <Suspense fallback={<MovieForm mode="user" />}>
      <MovieRegisterPageContent />
    </Suspense>
  )
}
