import React, { TextareaHTMLAttributes } from "react"
import styles from "./Textarea.module.css"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export function Textarea({
  label,
  error,
  helper,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className={styles.textarea}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={`${styles.textareaField} ${error ? styles.error : ""} ${className}`}
        {...props}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
      {helper && !error && <p className={styles.helper}>{helper}</p>}
    </div>
  )
}
