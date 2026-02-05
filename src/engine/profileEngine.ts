import { api } from "../shared/api"

// -------------------- GET PROFILE --------------------

export const getProfile = async () => {
  try {
    const res = await api.get("/profile")
    return res.data
  } catch (e: any) {
    const msg = e?.response?.data?.message || "Failed to fetch profile"
    throw new Error(msg)
  }
}

// -------------------- UPDATE PROFILE --------------------

export const updateProfile = async (data: { name: string; mobileNo: string }) => {
  try {
    const res = await api.put("/profile/update", data)
    return res.data
  } catch (e: any) {
    const msg = e?.response?.data?.message || "Failed to update profile"
    throw new Error(msg)
  }
}