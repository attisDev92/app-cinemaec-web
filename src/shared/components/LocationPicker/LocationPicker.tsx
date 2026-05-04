"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import styles from "./LocationPicker.module.css"

// Importación dinámica para evitar SSR issues con Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Cargando mapa...</div>,
})

export interface LocationData {
  address: string
  latitude: number
  longitude: number
  province?: string
  city?: string
}

interface LocationPickerProps {
  label?: string
  value: LocationData
  onChange: (location: LocationData) => void
  province?: string
  city?: string
  error?: string
  required?: boolean
}

export function LocationPicker({
  label = "Ubicación",
  value,
  onChange,
  province,
  city,
  error,
  required = false,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value.address || "")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<
    Array<{
      place_id: number
      display_name: string
      lat: string
      lon: string
      address?: Record<string, string>
    }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  )

  // Actualizar búsqueda cuando cambian provincia o ciudad
  useEffect(() => {
    if (province && city) {
      setSearchQuery(`${city}, ${province}, Ecuador`)
    }
  }, [province, city])

  // Función de autocompletado
  const handleAutocomplete = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const encodedQuery = encodeURIComponent(query)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&countrycodes=ec`,
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch (error) {
      console.error("Error al obtener sugerencias:", error)
      setSuggestions([])
    }
  }

  // Manejar cambio de texto con debounce
  const handleSearchInputChange = (newQuery: string) => {
    setSearchQuery(newQuery)

    // Limpiar el timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Crear nuevo timer
    const timer = setTimeout(() => {
      handleAutocomplete(newQuery)
    }, 300)

    setDebounceTimer(timer)
  }

  // Seleccionar sugerencia
  const handleSelectSuggestion = (suggestion: {
    place_id: number
    display_name: string
    lat: string
    lon: string
    address?: Record<string, string>
  }) => {
    // Extraer provincia y ciudad del address
    const address = suggestion.address ?? {}
    const province = address.state ?? address.province ?? ""
    const city =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      ""

    onChange({
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      province,
      city,
    })
    setSearchQuery(suggestion.display_name)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación
      const query = encodeURIComponent(searchQuery)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        // Extraer provincia y ciudad del address
        const address = result.address || {}
        const province = address.state || address.province || ""
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          ""

        onChange({
          address: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          province,
          city,
        })
      } else {
        alert("No se encontró la dirección. Intenta con otra búsqueda.")
      }
    } catch (error) {
      console.error("Error al buscar dirección:", error)
      alert("Error al buscar la dirección. Intenta nuevamente.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleMapClick = (latitude: number, longitude: number) => {
    // Geocodificación inversa
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
    )
      .then((res) => res.json())
      .then((data) => {
        // Extraer provincia y ciudad del address
        const address = data.address || {}
        const province = address.state || address.province || ""
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          ""

        onChange({
          address: data.display_name || `${latitude}, ${longitude}`,
          latitude,
          longitude,
          province,
          city,
        })
      })
      .catch((error) => {
        console.error("Error en geocodificación inversa:", error)
        onChange({
          address: `${latitude}, ${longitude}`,
          latitude,
          longitude,
        })
      })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      <div className={styles.hint}>
        💡 Busca la dirección o haz clic en el mapa para colocar el pin
      </div>
      {/* Campo de búsqueda */}
      <div className={styles.searchContainer}>
        <div className={styles.autocompleteWrapper}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Buscar dirección..."
            className={styles.searchInput}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id || index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={styles.suggestionItem}
                >
                  <span className={styles.suggestionIcon}>📍</span>
                  <span className={styles.suggestionText}>
                    {suggestion.display_name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className={styles.searchButton}
        >
          {isSearching ? "Buscando..." : "🔍 Buscar"}
        </button>
      </div>

      {/* Mapa interactivo */}
      <div className={styles.mapWrapper}>
        <MapComponent
          center={
            value.latitude && value.longitude
              ? [value.latitude, value.longitude]
              : [-0.2201641, -78.5123274] // Centro Histórico de Quito
          }
          marker={
            value.latitude && value.longitude
              ? [value.latitude, value.longitude]
              : null
          }
          onMapClick={handleMapClick}
        />
      </div>

      {/* Información de ubicación */}
      {value.latitude !== 0 && value.longitude !== 0 && (
        <div className={styles.locationInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>📍 Dirección:</span>
            <span className={styles.infoValue}>{value.address}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>📐 Coordenadas:</span>
            <span className={styles.infoValue}>
              {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
