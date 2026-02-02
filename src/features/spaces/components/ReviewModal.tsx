"use client"

import { useState, useMemo } from "react"
import { ReviewForm, Issue, SpaceReviewDecisionEnum } from "@/shared/types"
import { spaceService } from "@/features/spaces/services/space.service"
import styles from "./ReviewModal.module.css"

interface SpaceForReview {
  id: number | string
  name: string
  status?: string
}

interface ReviewModalProps {
  space: SpaceForReview
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const SPACE_FIELDS = [
  { id: "name", label: "Nombre del Espacio" },
  { id: "capacity", label: "Capacidad" },
  { id: "address", label: "Dirección" },
  { id: "coordinates", label: "Coordenadas" },
  { id: "amenities", label: "Amenidades" },
  { id: "managerName", label: "Nombre del Gerente" },
  { id: "managerEmail", label: "Email del Gerente" },
  { id: "managerPhone", label: "Teléfono del Gerente" },
  { id: "description", label: "Descripción" },
  { id: "photos", label: "Fotos" },
  { id: "insurance", label: "Seguro" },
]

export const ReviewModal = ({
  space,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) => {
  const [decision, setDecision] = useState<SpaceReviewDecisionEnum>(
    SpaceReviewDecisionEnum.APPROVE,
  )
  const [generalComment, setGeneralComment] = useState("")
  const [issues, setIssues] = useState<Issue[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isRequestChanges = useMemo(
    () => decision === SpaceReviewDecisionEnum.REQUEST_CHANGES,
    [decision],
  )

  const addIssue = () => {
    setIssues([...issues, { field: "", comment: "" }])
  }

  const removeIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index))
  }

  const updateIssue = (index: number, field: keyof Issue, value: string) => {
    const updatedIssues = [...issues]
    updatedIssues[index] = {
      ...updatedIssues[index],
      [field]: value,
    }
    setIssues(updatedIssues)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validar que si es request_changes, haya al menos un issue
    if (isRequestChanges && issues.length === 0) {
      setError("Debes agregar al menos un problema cuando solicitas cambios")
      return
    }

    // Validar que todos los issues tengan campo y comentario
    if (issues.some((issue) => !issue.field || !issue.comment)) {
      setError("Todos los problemas deben tener campo y comentario")
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData: ReviewForm = {
        decision,
        ...(generalComment && { generalComment }),
        ...(issues.length > 0 && { issues }),
      }

      await spaceService.submitReview(Number(space.id), reviewData)

      setSuccess(
        decision === SpaceReviewDecisionEnum.APPROVE
          ? "Espacio aprobado exitosamente"
          : decision === SpaceReviewDecisionEnum.REJECT
            ? "Espacio rechazado"
            : "Cambios solicitados al propietario",
      )

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        resetForm()
        onClose()
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al enviar la revisión. Intenta nuevamente.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setDecision(SpaceReviewDecisionEnum.APPROVE)
    setGeneralComment("")
    setIssues([])
    setError(null)
    setSuccess(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Revisar Espacio</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.spaceInfo}>
          <h3>{space.name}</h3>
          <p className={styles.status}>Estado: {space.status || "Pendiente"}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Decision Buttons */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Decisión</label>
            <div className={styles.decisionGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === SpaceReviewDecisionEnum.APPROVE}
                  onChange={(e) =>
                    setDecision(e.target.value as SpaceReviewDecisionEnum)
                  }
                />
                <span className={styles.radioLabel}>✓ Aprobar</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="decision"
                  value="request_changes"
                  checked={
                    decision === SpaceReviewDecisionEnum.REQUEST_CHANGES
                  }
                  onChange={(e) =>
                    setDecision(e.target.value as SpaceReviewDecisionEnum)
                  }
                />
                <span className={styles.radioLabel}>⚠ Solicitar Cambios</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === SpaceReviewDecisionEnum.REJECT}
                  onChange={(e) =>
                    setDecision(e.target.value as SpaceReviewDecisionEnum)
                  }
                />
                <span className={styles.radioLabel}>✕ Rechazar</span>
              </label>
            </div>
          </div>

          {/* General Comment */}
          <div className={styles.section}>
            <label className={styles.label}>
              {isRequestChanges
                ? "Comentario General (Opcional)"
                : "Comentario (Opcional)"}
            </label>
            <textarea
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Issues Section (only for request_changes) */}
          {isRequestChanges && (
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                Problemas a Corregir
              </label>
              {issues.length === 0 ? (
                <p className={styles.noIssues}>
                  No hay problemas agregados. Haz clic en &quot;Agregar
                  Problema&quot; para para comenzar.
                </p>
              ) : (
                <div className={styles.issuesList}>
                  {issues.map((issue, index) => (
                    <div key={index} className={styles.issueCard}>
                      <div className={styles.issueContent}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Campo a Corregir
                          </label>
                          <select
                            value={issue.field}
                            onChange={(e) =>
                              updateIssue(index, "field", e.target.value)
                            }
                            className={styles.select}
                          >
                            <option value="">Selecciona un campo...</option>
                            {SPACE_FIELDS.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>
                            Comentario / Especificación
                          </label>
                          <textarea
                            value={issue.comment}
                            onChange={(e) =>
                              updateIssue(index, "comment", e.target.value)
                            }
                            placeholder="Describe qué necesita corregirse..."
                            rows={2}
                            className={styles.textarea}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIssue(index)}
                        className={styles.removeButton}
                        aria-label="Eliminar problema"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addIssue}
                className={styles.addIssueButton}
              >
                + Agregar Problema
              </button>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          {/* Action Buttons */}
          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.submitButton} ${
                decision === SpaceReviewDecisionEnum.APPROVE
                  ? styles.approveButton
                  : decision === SpaceReviewDecisionEnum.REJECT
                    ? styles.rejectButton
                    : styles.changesButton
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Revisión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
