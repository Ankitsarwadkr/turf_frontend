import { logout } from "../engine/authEngine"
import { ReactNode } from "react"

type Props = {
  children?: ReactNode
  className?: string
}

export default function LogoutButton({ children, className = "" }: Props) {
  return (
    <button
      onClick={logout}
      className={`px-4 py-2 rounded transition ${className}`}
    >
      {children || "Logout"}
    </button>
  )
}