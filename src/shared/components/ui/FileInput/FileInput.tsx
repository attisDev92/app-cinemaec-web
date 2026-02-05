import { Input, type InputProps } from "@/shared/components/ui/Input"
import styles from "./file-input.module.css"

interface FileInputProps extends InputProps {
  helperText?: string
}

export function FileInput({ helperText, className = "", ...props }: FileInputProps) {
  return (
    <div className={styles.container}>
      <Input type="file" className={`${styles.input} ${className}`} {...props} />
      {helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  )
}
