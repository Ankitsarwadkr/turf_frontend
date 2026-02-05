import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function ProtectedRoute() {
  const { isAuthenticated, role, status } = useAuthStore()

  console.log("ProtectedRoute", {
    isAuthenticated,
    role,
    status,
    path: window.location.pathname,
  })

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (role === "OWNER" && status === "PENDING") {
    return <Navigate to="/pending" replace />
  }

  return <Outlet />
}