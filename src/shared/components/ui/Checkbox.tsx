import React, { InputHTMLAttributes } from "react"
import styles from "./Checkbox.module.css"

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  variant?: "default" | "pill"
}

export function Checkbox({
  label,
  variant = "default",
  className = "",
  checked,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`${styles.checkbox} ${variant === "pill" ? styles.pill : ""} ${checked ? styles.checked : ""} ${className}`}
    >
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        {...props}
      />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
