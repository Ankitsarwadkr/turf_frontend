import { create } from "zustand"

export type Role = "CUSTOMER" | "OWNER" | "ADMIN" | null
export type Status = "PENDING" | "ACTIVE" | "REJECTED" | null

interface AuthState {
  role: Role
  status: Status
  isAuthenticated: boolean
  hydrated: boolean
  loading: boolean
  error: string | null
  success: string | null

  setSession: (role: Role, status: Status) => void
  clearSession: () => void           // ✅ SOFT RESET
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
  setSuccess: (msg: string | null) => void
  clearMessages: () => void
  logout: () => void                 // ✅ HARD RESET
  markHydrated: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  status: null,
  isAuthenticated: false,
  hydrated: false,
  loading: false,
  error: null,
  success: null,

  // USER IS AUTHENTICATED
  setSession: (role, status) =>
    set({
      role,
      status,
      isAuthenticated: true,
      hydrated: true,
      loading: false,
      error: null,
      success: null
    }),

  // ✅ USER IS NOT LOGGED IN (NORMAL STATE)
  clearSession: () =>
    set({
      role: null,
      status: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      success: null
    }),

  setLoading: (v) => set({ loading: v }),

  setError: (msg) => set({ error: msg, success: null }),

  setSuccess: (msg) => set({ success: msg, error: null }),

  clearMessages: () => set({ error: null, success: null }),

  // ❌ ONLY FOR EXPLICIT LOGOUT
  logout: () =>
    set({
      role: null,
      status: null,
      isAuthenticated: false,
      hydrated: true,
      loading: false,
      error: null,
      success: null
    }),

  markHydrated: () => set({ hydrated: true })
}))