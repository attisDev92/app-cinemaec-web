import { apiClient } from "@/lib/api-client"
import { Country, Language, SubGenre, CinematicRole, City } from "../types"

export const catalogService = {
  async getCountries(): Promise<Country[]> {
    return apiClient.get<Country[]>("/catalog/countries")
  },

  async getLanguages(): Promise<Language[]> {
    return apiClient.get<Language[]>("/catalog/languages")
  },

  async getSubGenres(): Promise<SubGenre[]> {
    return apiClient.get<SubGenre[]>("/catalog/subgenres")
  },

  async getCinematicRoles(): Promise<CinematicRole[]> {
    return apiClient.get<CinematicRole[]>("/catalog/cinematic-roles")
  },

  async getCities(): Promise<City[]> {
    return apiClient.get<City[]>("/catalog/cities")
  },
}
