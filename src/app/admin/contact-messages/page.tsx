"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Input, Textarea } from "@/shared/components/ui"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { contactUsService } from "@/features/contact-us/services/contact-us.service"
import type { ContactUsMessage } from "@/features/contact-us/types"
import { PermissionEnum, UserRole } from "@/shared/types"
import styles from "./page.module.css"

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

export default function AdminContactMessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()

  const [messages, setMessages] = useState<ContactUsMessage[]>([])
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canAccess = useMemo(
    () =>
      !!user &&
      user.role === UserRole.ADMIN &&
      hasPermission(PermissionEnum.ADMIN_CONTACT_MESSAGES),
    [user, hasPermission],
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user && !canAccess) {
      router.push("/home")
    }
  }, [canAccess, isAuthenticated, isLoading, router, user])

  useEffect(() => {
    const loadMessages = async () => {
      if (isLoading || !canAccess) return

      try {
        setLoadingMessages(true)
        setError(null)

        const data = await contactUsService.getAll()
        setMessages(data)
        setSelectedMessageId((current) => current ?? data[0]?.id ?? null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los mensajes",
        )
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
  }, [canAccess, isLoading])

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return messages

    return messages.filter((message) =>
      [message.name, message.email, message.institution || "", message.message]
        .join(" ")
        .toLowerCase()
        .includes(term),
    )
  }, [messages, search])

  const selectedMessage = useMemo(
    () => filteredMessages.find((message) => message.id === selectedMessageId) || filteredMessages[0] || null,
    [filteredMessages, selectedMessageId],
  )

  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      setSelectedMessageId(filteredMessages[0].id)
    }
  }, [filteredMessages, selectedMessage])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingPage}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || !canAccess) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>Mensajes de Contacto</h1>
            <p>Revisa los mensajes recibidos desde el botón público de Contact Us.</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin")}>Volver al panel</Button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.layout}>
          <section className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, email o mensaje"
              />
              <p className={styles.countLabel}>{filteredMessages.length} mensaje(s)</p>
            </div>

            {loadingMessages ? (
              <div className={styles.loadingList}>Cargando mensajes...</div>
            ) : filteredMessages.length === 0 ? (
              <div className={styles.emptyBox}>No hay mensajes que coincidan con la búsqueda.</div>
            ) : (
              <div className={styles.messageList}>
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    className={`${styles.messageItem} ${selectedMessage?.id === message.id ? styles.messageItemActive : ""}`}
                    onClick={() => setSelectedMessageId(message.id)}
                  >
                    <div className={styles.messageItemTop}>
                      <strong>{message.name}</strong>
                      <span>{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p className={styles.messageItemEmail}>{message.email}</p>
                    <p className={styles.messageItemSnippet}>{message.message}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.detailPanel}>
            {!selectedMessage ? (
              <div className={styles.emptyBox}>Selecciona un mensaje para ver su detalle.</div>
            ) : (
              <div className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <h2>{selectedMessage.name}</h2>
                  <span>{formatDateTime(selectedMessage.createdAt)}</span>
                </div>

                <div className={styles.detailGrid}>
                  <div>
                    <label>Email</label>
                    <Input value={selectedMessage.email} readOnly />
                  </div>
                  <div>
                    <label>Número</label>
                    <Input value={selectedMessage.phone || "No especificado"} readOnly />
                  </div>
                  <div>
                    <label>Institución</label>
                    <Input value={selectedMessage.institution || "No especificada"} readOnly />
                  </div>
                  <div>
                    <label>ID</label>
                    <Input value={String(selectedMessage.id)} readOnly />
                  </div>
                </div>

                <div className={styles.messageBlock}>
                  <label>Mensaje</label>
                  <Textarea value={selectedMessage.message} readOnly rows={10} />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}