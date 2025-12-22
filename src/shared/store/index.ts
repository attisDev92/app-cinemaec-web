import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/store/authSlice"
import profileReducer from "@/features/profile/store/profileSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
