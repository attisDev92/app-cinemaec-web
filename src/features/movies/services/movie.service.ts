import { apiClient } from "@/lib/api-client"
import { CreateMoviePayload, Movie } from "../types"

export interface MovieClaimRequestAdminItem {
  id: number
  status: "pending" | "approved" | "rejected"
  observation: string | null
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
  reviewedByUserId: number | null
  reviewedByUser: {
    id: number
    email: string
  } | null
  movie: {
    id: number
    title: string
    titleEn: string | null
    releaseYear: number | null
    type: string
    genre: string
    status: string
    ownerId: number | null
  }
  claimant: {
    id: number
    email: string
    cedula: string
  }
  supportDocument: {
    id: number
    url: string
    documentType: string
    ownerType: string
    createdAt: string
  }
}

export interface MovieClaimRequestUserItem {
  id: number
  status: "pending" | "approved" | "rejected"
  observation: string | null
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
  reviewedByUserId: number | null
  reviewedByUser: {
    id: number
    email: string
  } | null
  movie: {
    id: number
    title: string
    titleEn: string | null
    releaseYear: number | null
    type: string
    genre: string
    status: string
    ownerId: number | null
  }
  supportDocument: {
    id: number
    url: string
    documentType: string
    ownerType: string
    createdAt: string
  }
}

export const movieService = {
  async getAll(): Promise<Movie[]> {
    return apiClient.get<Movie[]>("/movies")
  },

  async getById(id: number): Promise<Movie> {
    return apiClient.get<Movie>(`/movies/${id}`)
  },

  async create(payload: CreateMoviePayload): Promise<Movie> {
    return apiClient.post<Movie>("/movies", payload)
  },

  async update(
    id: number,
    payload: Partial<CreateMoviePayload>,
  ): Promise<Movie> {
    return apiClient.put<Movie>(`/movies/${id}`, payload)
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/movies/${id}`)
  },

  async toggleActive(id: number): Promise<Movie> {
    return apiClient.put<Movie>(`/movies/${id}/toggle-active`, {})
  },

  async updateStatus(
    id: number,
    status: "draft" | "in_review" | "approved" | "rejected" | "archived",
  ): Promise<Movie> {
    return apiClient.patch<Movie>(`/movies/${id}/status`, { status })
  },

  async createClaimRequest(payload: {
    movieId: number
    supportDocumentAssetId: number
  }): Promise<{
    id: number
    movieId: number
    claimantUserId: number
    supportDocumentAssetId: number
    status: "pending" | "approved" | "rejected"
    createdAt: string
    updatedAt: string
  }> {
    return apiClient.post("/movies/claim-requests", payload)
  },

  async getMyClaimRequests(): Promise<MovieClaimRequestUserItem[]> {
    return apiClient.get<MovieClaimRequestUserItem[]>("/movies/claim-requests/mine")
  },

  async getAdminClaimRequests(): Promise<MovieClaimRequestAdminItem[]> {
    return apiClient.get<MovieClaimRequestAdminItem[]>("/movies/claim-requests/admin")
  },

  async reviewClaimRequest(
    id: number,
    payload: {
      status: "approved" | "rejected"
      observation?: string
    },
  ): Promise<{
    id: number
    status: "approved" | "rejected"
    observation: string | null
    reviewedByUserId: number | null
    reviewedAt: string | null
    updatedAt: string
  }> {
    return apiClient.patch(`/movies/claim-requests/${id}/review`, payload)
  },
}
