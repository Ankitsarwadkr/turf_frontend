import { create } from "zustand";
export const useAuthStore = create((set) => ({
    role: null,
    status: null,
    isAuthenticated: false,
    hydrated: false,
    loading: false,
    error: null,
    success: null,
    // USER IS AUTHENTICATED
    setSession: (role, status) => set({
        role,
        status,
        isAuthenticated: true,
        hydrated: true,
        loading: false,
        error: null,
        success: null
    }),
    // ✅ USER IS NOT LOGGED IN (NORMAL STATE)
    clearSession: () => set({
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
    logout: () => set({
        role: null,
        status: null,
        isAuthenticated: false,
        hydrated: true,
        loading: false,
        error: null,
        success: null
    }),
    markHydrated: () => set({ hydrated: true })
}));
