import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

export default function RoleGate({ allow }: { allow: string[] }) {
  const { role } = useAuthStore()
  if (!role || !allow.includes(role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}