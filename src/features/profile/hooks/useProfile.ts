import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks"
import {
  fetchProfile,
  updateProfileAsync,
  clearProfile,
  clearError,
} from "../store/profileSlice"
import { UpdateProfileData } from "../types"

export function useProfile() {
  const dispatch = useAppDispatch()
  const { profile, isLoading, error } = useAppSelector((state) => state.profile)

  const loadProfile = useCallback(async () => {
    await dispatch(fetchProfile())
  }, [dispatch])

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      const result = await dispatch(updateProfileAsync(data))
      if (updateProfileAsync.fulfilled.match(result)) {
        return result.payload
      } else {
        throw new Error((result.payload as string) || "Error al actualizar")
      }
    },
    [dispatch],
  )

  const clear = useCallback(() => {
    dispatch(clearProfile())
  }, [dispatch])

  const clearProfileError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    clearProfile: clear,
    clearError: clearProfileError,
  }
}
