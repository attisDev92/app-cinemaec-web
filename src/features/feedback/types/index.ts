// Feedback Types
export interface Feedback {
  id: string
  userId: string
  filmRequestId: string
  filmId: string
  spaceId: string
  // Información de la exhibición
  actualDate: string
  actualAudience: number
  ticketsSold?: number
  revenue?: number
  // Evaluación técnica
  technicalQuality: 1 | 2 | 3 | 4 | 5
  technicalIssues?: string
  // Evaluación de la audiencia
  audienceReception: 1 | 2 | 3 | 4 | 5
  audienceComments?: string
  // Evaluación general
  overallExperience: 1 | 2 | 3 | 4 | 5
  wouldRequestAgain: boolean
  recommendations?: string
  // Media
  photos?: string[]
  // Metadata
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateFeedbackData {
  filmRequestId: string
  actualDate: string
  actualAudience: number
  ticketsSold?: number
  revenue?: number
  technicalQuality: 1 | 2 | 3 | 4 | 5
  technicalIssues?: string
  audienceReception: 1 | 2 | 3 | 4 | 5
  audienceComments?: string
  overallExperience: 1 | 2 | 3 | 4 | 5
  wouldRequestAgain: boolean
  recommendations?: string
  photos?: string[]
}

export type UpdateFeedbackData = Partial<CreateFeedbackData>
