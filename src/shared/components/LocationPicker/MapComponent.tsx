"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface MapComponentProps {
  center: [number, number]
  marker: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

export default function MapComponent({
  center,
  marker,
  onMapClick,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Inicializar mapa
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Evento de clic en el mapa
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng)
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualizar centro cuando cambia
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, 13)
    }
  }, [center])

  // Actualizar marcador cuando cambia
  useEffect(() => {
    if (!mapRef.current) return

    // Remover marcador anterior
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    // Agregar nuevo marcador
    if (marker) {
      markerRef.current = L.marker(marker, {
        draggable: true,
      }).addTo(mapRef.current)

      // Evento de arrastre del marcador
      markerRef.current.on("dragend", (e: L.DragEndEvent) => {
        const position = e.target.getLatLng()
        onMapClick(position.lat, position.lng)
      })
    }
  }, [marker, onMapClick])

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "var(--border-radius-lg)",
      }}
    />
  )
}
