"use client"

import { Provider } from "react-redux"
import { store } from "./index"
import { useEffect } from "react"
import { initializeAuth } from "@/features/auth/store/authSlice"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar autenticación al montar
    store.dispatch(initializeAuth())
  }, [])

  return <Provider store={store}>{children}</Provider>
}
