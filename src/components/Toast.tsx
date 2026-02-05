import { useToastStore } from "../store/toastStore"
import { useEffect } from "react"

export default function Toasts() {
  const { toasts, remove } = useToastStore()

  useEffect(() => {
    toasts.forEach(t => {
      setTimeout(() => remove(t.id), 3500)
    })
  }, [toasts])

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-card text-sm font-medium transition-all duration-300 animate-slideUp border backdrop-blur-sm
            ${t.type === "error"
              ? "bg-red-50/95 text-danger border-red-200"
              : "bg-green-50/95 text-success border-green-200"}
          `}
        >
          <div className="flex items-center gap-2">
            {t.type === "error" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}