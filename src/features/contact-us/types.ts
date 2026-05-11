export interface CreateContactUsPayload {
  name: string
  institution?: string
  email: string
  phone?: string
  message: string
}

export interface ContactUsMessage {
  id: number
  name: string
  institution?: string | null
  email: string
  phone?: string | null
  message: string
  createdAt: string
  updatedAt: string
}