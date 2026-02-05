import { Outlet, useLocation } from "react-router-dom"
import AuthToast from "../components/AuthToast"

export default function AuthLayout() {
  const { pathname } = useLocation()

  // Status screens must be quiet
  const hideToast =
    pathname.includes("/auth/pending") ||
    pathname.includes("/auth/unauthorized")

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
      <div
        className="
          w-full max-w-sm
          bg-neutral-surface
          border border-neutral-border
          rounded-xl
          shadow-xl
          p-6
          space-y-6

          opacity-0 scale-[0.98]
          animate-authCardIn
        "
      >
        {!hideToast && <AuthToast />}
        <Outlet />
      </div>
    </div>
  )
}