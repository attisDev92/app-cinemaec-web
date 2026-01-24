import styles from './Loader.module.css'

interface LoaderProps {
  message?: string
}

export const Loader = ({ message = 'Cargando...' }: LoaderProps) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
      <p>{message}</p>
    </div>
  )
}
