import { apiClient } from "@/lib/api-client"
import { CreateMoviePayload, Movie } from "../types"

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
}
