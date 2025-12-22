"use client"

import React from "react"
import { ecuadorProvinces } from "@/shared/data/ecuador-locations"
import styles from "./ProvinceSelector.module.css"

interface ProvinceSelectorProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export function ProvinceSelector({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "Selecciona una provincia",
}: ProvinceSelectorProps) {
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
      >
        <option value="">{placeholder}</option>
        {ecuadorProvinces.map((province) => (
          <option key={province.code} value={province.name}>
            {province.name}
          </option>
        ))}
      </select>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
