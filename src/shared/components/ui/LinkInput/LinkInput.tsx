import { Input, type InputProps } from "@/shared/components/ui/Input"
import styles from "./link-input.module.css"

interface LinkInputProps extends InputProps {
  helperText?: string
}

export function LinkInput({ helperText, className = "", ...props }: LinkInputProps) {
  return (
    <div className={styles.container}>
      <Input type="url" className={`${styles.input} ${className}`} {...props} />
      {helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  )
}
