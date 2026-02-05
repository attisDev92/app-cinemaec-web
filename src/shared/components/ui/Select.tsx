import React, { SelectHTMLAttributes } from "react"
import styles from "./Select.module.css"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className={styles.select}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        className={`${styles.selectField} ${error ? styles.error : ""} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  )
}
