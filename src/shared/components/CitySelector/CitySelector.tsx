"use client"

import React, { useEffect } from "react"
import { getProvinceByName } from "@/shared/data/ecuador-locations"
import styles from "./CitySelector.module.css"

interface CitySelectorProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
  province: string
  onProvinceChange?: () => void
}

export function CitySelector({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "Selecciona una ciudad",
  province,
  onProvinceChange,
}: CitySelectorProps) {
  const cities = province ? getProvinceByName(province)?.cities || [] : []
  const isDisabled = !province || cities.length === 0

  // Limpiar la ciudad cuando cambia la provincia
  useEffect(() => {
    if (onProvinceChange && value && !cities.includes(value)) {
      onProvinceChange()
    }
  }, [province, cities, value, onProvinceChange])

  return (
    <div className={styles.container}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.select} ${error ? styles.selectError : ""}`}
        required={required}
        disabled={isDisabled}
      >
        <option value="">
          {isDisabled ? "Primero selecciona una provincia" : placeholder}
        </option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
