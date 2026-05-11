import { apiClient } from "@/lib/api-client"
import { ContactUsMessage, CreateContactUsPayload } from "../types"

export const contactUsService = {
  async create(payload: CreateContactUsPayload): Promise<ContactUsMessage> {
    return apiClient.post<ContactUsMessage>("/contact-us", payload, false)
  },

  async getAll(): Promise<ContactUsMessage[]> {
    return apiClient.get<ContactUsMessage[]>("/contact-us")
  },
}