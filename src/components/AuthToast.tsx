import { useAuthStore } from "../store/authStore"

export default function AuthToast() {
  const { error, success } = useAuthStore()
  if (!error && !success) return null

  const isError = Boolean(error)

  return (
    <div
      className={`
        mb-4
        px-4 py-3
        text-sm leading-relaxed
        rounded-xl border
        animate-authCardIn
        transition-all
        ${
          isError
            ? "bg-red-50 text-danger border-red-200"
            : "bg-secondary-light text-primary border-green-200"
        }
      `}
    >
      {error || success}
    </div>
  )
}