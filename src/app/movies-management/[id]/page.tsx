"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card } from "@/shared/components/ui"
import { movieService } from "@/features/movies/services/movie.service"
import styles from "./page.module.css"

type MovieProfessionalRelation = {
  cinematicRole?: { id?: number }
  professional?: {
    name?: string
    profilePhotoAsset?: { url?: string | null }
  }
}

type MovieCompanyRelation = {
  companyId?: number
  participation?: string
  company?: { name?: string }
}

type MovieProfileDetail = {
  id: number
  title?: string
  titleEn?: string | null
  type?: string
  genre?: string
  releaseYear?: number | null
  synopsis?: string
  durationMinutes?: number
  classification?: string
  projectStatus?: string
  status?: string
  country?: { name?: string }
  languages?: Array<{ name?: string }>
  professionals?: MovieProfessionalRelation[]
  companies?: MovieCompanyRelation[]
}

export default function MovieProjectProfilePage() {
  const params = useParams()
  const router = useRouter()
  const movieId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    if (movieId) {
      router.replace(`/public/movies/${movieId}`)
    }
  }, [movieId, router])

  return null
}
