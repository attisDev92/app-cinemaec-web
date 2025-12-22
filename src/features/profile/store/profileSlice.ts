import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { Profile, UpdateProfileData } from "@/features/profile/types"
import { userService } from "@/features/auth/services/auth.service"

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const profile = await userService.getProfile()
      return profile
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Error al obtener el perfil",
      )
    }
  },
)

export const updateProfileAsync = createAsyncThunk(
  "profile/update",
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      const profile = await userService.updateProfile(data)
      return profile
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil",
      )
    }
  },
)

// Slice
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as Omit<
          Profile,
          "birthdate" | "createdAt" | "updatedAt"
        > & {
          birthdate: string | null
          createdAt: string
          updatedAt: string
        }
        state.profile = {
          ...payload,
          birthdate: payload.birthdate ? new Date(payload.birthdate) : null,
          createdAt: new Date(payload.createdAt),
          updatedAt: new Date(payload.updatedAt),
        }
        state.error = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as Omit<
          Profile,
          "birthdate" | "createdAt" | "updatedAt"
        > & {
          birthdate: string | null
          createdAt: string
          updatedAt: string
        }
        state.profile = {
          ...payload,
          birthdate: payload.birthdate ? new Date(payload.birthdate) : null,
          createdAt: new Date(payload.createdAt),
          updatedAt: new Date(payload.updatedAt),
        }
        state.error = null
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearProfile, clearError } = profileSlice.actions
export default profileSlice.reducer
