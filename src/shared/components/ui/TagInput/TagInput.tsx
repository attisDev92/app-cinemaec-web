"use client"

import { useState, KeyboardEvent } from "react"
import styles from "./tag-input.module.css"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  maxLength?: number
  disabled?: boolean
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Escribe y presiona Enter",
  label,
  maxLength = 100,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      return
    }

    if (trimmedValue.length > maxLength) {
      setError(`El texto no puede exceder ${maxLength} caracteres`)
      return
    }

    if (value.includes(trimmedValue)) {
      setError("Este valor ya está en la lista")
      return
    }

    onChange([...value, trimmedValue])
    setInputValue("")
    setError(null)
  }

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          disabled={disabled}
          maxLength={maxLength}
        />
        <button
          type="button"
          onClick={addTag}
          className={styles.addButton}
          disabled={disabled || !inputValue.trim()}
        >
          Agregar
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {value.length > 0 && (
        <div className={styles.tagList}>
          {value.map((tag, index) => (
            <div key={index} className={styles.tag}>
              <span className={styles.tagText}>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className={styles.removeButton}
                disabled={disabled}
                aria-label={`Eliminar ${tag}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className={styles.emptyMessage}>
          No hay elementos agregados. Escribe y presiona Enter o haz clic en
          Agregar.
        </p>
      )}
    </div>
  )
}
