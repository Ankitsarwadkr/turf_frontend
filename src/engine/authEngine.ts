import { api } from "../shared/api"
import { useAuthStore } from "../store/authStore"

const fail = (e: any) => {
  const msg = e?.response?.data?.message || "Unexpected server error"
  useAuthStore.getState().setError(msg)
  useAuthStore.getState().setLoading(false)
  throw new Error(msg)
}

// -------------------- REGISTER CUSTOMER --------------------

export const registerCustomer = async (data: any) => {
  try {
    useAuthStore.getState().setLoading(true)
    const res = await api.post("/auth/register/customer", data)
    useAuthStore.getState().setSuccess("Registration successful. Please login.")
    useAuthStore.getState().setLoading(false)
    return res
  } catch (e) {
    fail(e)
  }
}

// -------------------- REGISTER OWNER --------------------

export const registerOwner = async (fd: FormData) => {
  try {
    useAuthStore.getState().setLoading(true)
    const res = await api.post("/auth/register/owner", fd)
    useAuthStore.getState().setSuccess("Owner registered. Await admin approval.")
    useAuthStore.getState().setLoading(false)
    return res
  } catch (e) {
    fail(e)
  }
}

// -------------------- LOGIN --------------------

export const login = async (data: any) => {
  try {
    useAuthStore.getState().setLoading(true)
    const res = await api.post("/auth/login", data)

    useAuthStore.getState().setSession(
      res.data.role,
      res.data.status
    )

    useAuthStore.getState().setSuccess("Login successful")
    useAuthStore.getState().setLoading(false)
    return res
  } catch (e) {
    fail(e)
  }
}

// -------------------- SESSION BOOTSTRAP (CRITICAL FIX) --------------------

export const bootstrapSession = async () => {
  try {
    const res = await api.get("/auth/me")
    useAuthStore.getState().setSession(
      res.data.role,
      res.data.status
    )
  } catch (e: any) {
    // ✅ NOT LOGGED IN — THIS IS NORMAL
    if (e?.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }
  } finally {
    useAuthStore.getState().markHydrated()
  }
}

// -------------------- LOGOUT --------------------

export async function logout() {
  try {
    await api.post("/auth/logout")
  } finally {
    useAuthStore.getState().logout()
  }
}
// -------------------- FORGOT PASSWORD --------------------

export const forgotPassword = async (email: string) => {
  try {
    useAuthStore.getState().setLoading(true)
    const res = await api.post("/auth/forget-password", { email })
    useAuthStore.getState().setSuccess("If an account exists, a reset link has been sent to your email.")
    useAuthStore.getState().setLoading(false)
    return res
  } catch (e) {
    fail(e)
  }
}

// -------------------- RESET PASSWORD --------------------

export const resetPassword = async (data: { token: string; newPassword: string }) => {
  try {
    useAuthStore.getState().setLoading(true)
    const res = await api.post("/auth/reset-password", data)
    useAuthStore.getState().setSuccess("Password reset successful. Please login with your new password.")
    useAuthStore.getState().setLoading(false)
    return res
  } catch (e) {
    fail(e)
  }
}