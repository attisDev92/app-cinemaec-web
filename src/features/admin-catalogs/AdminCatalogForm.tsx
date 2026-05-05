"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { adminCatalogService } from "./services/admin-catalog.service"
import { assetService } from "@/features/assets/services/asset.service"
import { festivalService } from "@/features/festivals/services/festival.service"
import { movieService } from "@/features/movies/services/movie.service"
import { professionalsService } from "@/features/professionals/services/professionals.service"
import { AssetOwnerEnum, AssetTypeEnum } from "@/shared/types"
import type { CatalogFestival, CatalogMovie, CatalogProfessional } from "./types"
import styles from "./admin-catalogs.module.css"

interface AdminCatalogFormProps {
  catalogId?: string
}

/* ── tiny generic multi-select hook ── */
function useRelationSelector<T extends { id: number }>(
  allItems: T[],
  getLabel: (item: T) => string,
  initial: T[] = [],
) {
  const [selected, setSelected] = useState<T[]>(initial)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = useMemo(
    () =>
      allItems.filter(
        (item) =>
          !selected.find((s) => s.id === item.id) &&
          getLabel(item).toLowerCase().includes(search.toLowerCase()),
      ),
    [allItems, selected, search, getLabel],
  )

  const add = (item: T) => {
    setSelected((prev) => [...prev, item])
    setSearch("")
    setOpen(false)
  }

  const remove = (id: number) => {
    setSelected((prev) => prev.filter((s) => s.id !== id))
  }

  return { selected, setSelected, search, setSearch, open, setOpen, filtered, add, remove }
}

export function AdminCatalogForm({ catalogId }: AdminCatalogFormProps) {
  const router = useRouter()
  const isEditing = useMemo(() => Boolean(catalogId && catalogId !== "new"), [catalogId])

  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [description, setDescription] = useState("")
  const [imageId, setImageId] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  /* ── relation data ── */
  const [allMovies, setAllMovies] = useState<CatalogMovie[]>([])
  const [allFestivals, setAllFestivals] = useState<CatalogFestival[]>([])
  const [allProfessionals, setAllProfessionals] = useState<CatalogProfessional[]>([])

  const movies = useRelationSelector<CatalogMovie>(allMovies, (m) => m.title)
  const festivals = useRelationSelector<CatalogFestival>(allFestivals, (f) => f.name)
  const professionals = useRelationSelector<CatalogProfessional>(allProfessionals, (p) => p.name)

  /* ── load reference data ── */
  useEffect(() => {
    void movieService.getAll().then((data) =>
      setAllMovies(data.map((m) => ({ id: m.id, title: m.title })))
    )
    void festivalService.getAll().then((data) =>
      setAllFestivals(data.map((f) => ({ id: f.id, name: f.name })))
    )
    void professionalsService.getAll().then((data) =>
      setAllProfessionals(data.map((p) => ({ id: p.id, name: p.name })))
    )
  }, [])

  /* ── load catalog in edit mode ── */
  useEffect(() => {
    if (!isEditing || !catalogId) return

    let cancelled = false

    const loadCatalog = async () => {
      try {
        setLoading(true)
        setError(null)
        const catalog = await adminCatalogService.getById(Number(catalogId))
        if (cancelled) return

        setName(catalog.name)
        setYear(String(catalog.year))
        setDescription(catalog.description ?? "")
        setImageId(catalog.imageId)

        if (catalog.imageAsset?.url) {
          setImagePreview(assetService.getPublicAssetUrl(catalog.imageAsset))
        }

        if (catalog.movies) {
          movies.setSelected(catalog.movies.map((m) => ({ id: m.id, title: m.title })))
        }
        if (catalog.festivals) {
          festivals.setSelected(catalog.festivals.map((f) => ({ id: f.id, name: f.name })))
        }
        if (catalog.professionals) {
          professionals.setSelected(catalog.professionals.map((p) => ({ id: p.id, name: p.name })))
        }
      } catch (err) {
        console.error("Error loading catalog:", err)
        if (!cancelled) {
          setError("No se pudo cargar el catálogo")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogId, isEditing])

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const uploaded = await assetService.uploadAsset(
        file,
        AssetTypeEnum.IMAGE,
        AssetOwnerEnum.CATALOG_IMAGE,
      )

      setImageId(uploaded.id)
      setImagePreview(uploaded.url)
      setSuccess("Imagen subida correctamente")
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const parsedYear = Number(year)

    if (!name.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      setError("El año debe ser un entero entre 1900 y 2100")
      return
    }

    if (!imageId) {
      setError("Debes subir una imagen")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload = {
        name: name.trim(),
        year: parsedYear,
        imageId,
        description: description.trim() || undefined,
        movieIds: movies.selected.map((m) => m.id),
        festivalIds: festivals.selected.map((f) => f.id),
        professionalIds: professionals.selected.map((p) => p.id),
      }

      if (isEditing && catalogId) {
        await adminCatalogService.update(Number(catalogId), payload)
        setSuccess("Catálogo actualizado correctamente")
      } else {
        await adminCatalogService.create(payload)
        setSuccess("Catálogo creado correctamente")
      }

      router.push("/admin/catalogs-management")
    } catch (err) {
      console.error("Error saving catalog:", err)
      setError("No se pudo guardar el catálogo")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.loadingMessage}>Cargando catálogo...</div>
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="catalog-name">Nombre</label>
        <input
          id="catalog-name"
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del catálogo"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="catalog-year">Año</label>
        <input
          id="catalog-year"
          className={styles.input}
          type="number"
          min={1900}
          max={2100}
          value={year}
          onChange={(event) => setYear(event.target.value)}
          placeholder="2026"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="catalog-image">Imagen</label>
        <input
          id="catalog-image"
          className={styles.input}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleImageUpload(file)
            }
          }}
          disabled={uploading}
          required={!imageId}
        />
      </div>

      {imagePreview ? (
        <img src={imagePreview} alt="Vista previa" className={styles.thumb} />
      ) : (
        <div className={styles.placeholder}>Sin imagen cargada</div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="catalog-description">Descripción (opcional)</label>
        <textarea
          id="catalog-description"
          className={styles.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descripción del catálogo"
        />
      </div>

      {/* ── Películas ── */}
      <div className={styles.relationField}>
        <span className={styles.label}>Películas</span>
        <div className={styles.relationSearchRow}>
          <input
            className={styles.relationSearch}
            placeholder="Buscar película..."
            value={movies.search}
            onChange={(e) => { movies.setSearch(e.target.value); movies.setOpen(true) }}
            onFocus={() => movies.setOpen(true)}
          />
        </div>
        {movies.open && movies.search.length > 0 && movies.filtered.length > 0 && (
          <div className={styles.relationDropdown}>
            {movies.filtered.slice(0, 30).map((m) => (
              <div key={m.id} className={styles.relationOption} onClick={() => movies.add(m)}>
                {m.title}
              </div>
            ))}
          </div>
        )}
        <div className={styles.relationTags}>
          {movies.selected.length === 0 ? (
            <span className={styles.relationEmpty}>Sin películas seleccionadas</span>
          ) : (
            movies.selected.map((m) => (
              <span key={m.id} className={styles.relationTag}>
                {m.title}
                <button type="button" className={styles.relationTagRemove} onClick={() => movies.remove(m.id)}>×</button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Festivales ── */}
      <div className={styles.relationField}>
        <span className={styles.label}>Festivales</span>
        <div className={styles.relationSearchRow}>
          <input
            className={styles.relationSearch}
            placeholder="Buscar festival..."
            value={festivals.search}
            onChange={(e) => { festivals.setSearch(e.target.value); festivals.setOpen(true) }}
            onFocus={() => festivals.setOpen(true)}
          />
        </div>
        {festivals.open && festivals.search.length > 0 && festivals.filtered.length > 0 && (
          <div className={styles.relationDropdown}>
            {festivals.filtered.slice(0, 30).map((f) => (
              <div key={f.id} className={styles.relationOption} onClick={() => festivals.add(f)}>
                {f.name}
              </div>
            ))}
          </div>
        )}
        <div className={styles.relationTags}>
          {festivals.selected.length === 0 ? (
            <span className={styles.relationEmpty}>Sin festivales seleccionados</span>
          ) : (
            festivals.selected.map((f) => (
              <span key={f.id} className={styles.relationTag}>
                {f.name}
                <button type="button" className={styles.relationTagRemove} onClick={() => festivals.remove(f.id)}>×</button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Profesionales ── */}
      <div className={styles.relationField}>
        <span className={styles.label}>Profesionales</span>
        <div className={styles.relationSearchRow}>
          <input
            className={styles.relationSearch}
            placeholder="Buscar profesional..."
            value={professionals.search}
            onChange={(e) => { professionals.setSearch(e.target.value); professionals.setOpen(true) }}
            onFocus={() => professionals.setOpen(true)}
          />
        </div>
        {professionals.open && professionals.search.length > 0 && professionals.filtered.length > 0 && (
          <div className={styles.relationDropdown}>
            {professionals.filtered.slice(0, 30).map((p) => (
              <div key={p.id} className={styles.relationOption} onClick={() => professionals.add(p)}>
                {p.name}
              </div>
            ))}
          </div>
        )}
        <div className={styles.relationTags}>
          {professionals.selected.length === 0 ? (
            <span className={styles.relationEmpty}>Sin profesionales seleccionados</span>
          ) : (
            professionals.selected.map((p) => (
              <span key={p.id} className={styles.relationTag}>
                {p.name}
                <button type="button" className={styles.relationTagRemove} onClick={() => professionals.remove(p.id)}>×</button>
              </span>
            ))
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.toolbar}>
        <button type="submit" className={`${styles.button} ${styles.primary}`} disabled={saving || uploading}>
          {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => router.push("/admin/catalogs-management")}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}


