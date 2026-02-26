interface Environment {
  apiUrl: string
  environment: string
}

export const environment: Environment = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  environment: process.env.NEXT_PUBLIC_ENV || "development",
}
