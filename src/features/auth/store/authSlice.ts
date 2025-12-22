import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { ExtendedUser } from "@/shared/types"
import { authService } from "@/features/auth/services/auth.service"

interface AuthState {
  user: ExtendedUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
}

// Async thunks
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      // Verificar si la sesión es válida (no expirada)
      if (!authService.isSessionValid()) {
        authService.clearSession()
        return null
      }

      const storedUser = authService.getStoredUser()
      const token = authService.getStoredToken()

      if (storedUser && token) {
        // Verificar token con el backend usando /users/me
        try {
          const currentUser = await authService.getCurrentUser()
          return currentUser
        } catch {
          // Si el token es inválido, limpiar todo
          authService.clearSession()
          return null
        }
      }
      return null
    } catch (error) {
      authService.clearSession()
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al inicializar",
      )
    }
  },
)

export const loginAsync = createAsyncThunk(
  "users/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.login(credentials)
      return response.user
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al iniciar sesión",
      )
    }
  },
)

export const registerAsync = createAsyncThunk(
  "users/register",
  async (
    credentials: {
      email: string
      cedula: string
      password: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.register(credentials)
      // El backend solo confirma el registro, no autentica
      return response
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al registrarse",
      )
    }
  },
)

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al cerrar sesión",
      )
    }
  },
)

export const refreshUserAsync = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = await authService.getCurrentUser()
      return currentUser
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al actualizar usuario",
      )
    }
  },
)

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<ExtendedUser>) => {
      state.user = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Initialize
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })

    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false
        // No autenticar automáticamente - el usuario debe hacer login
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Refresh User
    builder
      .addCase(refreshUserAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshUserAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(refreshUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { updateUser, clearError } = authSlice.actions
export default authSlice.reducer
