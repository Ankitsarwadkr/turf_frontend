import { useAuthStore } from "../../store/authStore"
import { useNavigate } from "react-router-dom"

export default function Pending() {
  const { clearMessages } = useAuthStore()
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
      <div className="w-full px-4">
        <div
          className="
            mx-auto
            max-w-sm
            bg-neutral-surface
            rounded-xl
            shadow-lg
            p-6
            text-center
            space-y-5
            animate-authCardIn
          "
        >
          <h1 className="text-[20px] font-semibold text-text-primary">
            Approval Pending
          </h1>

          <p className="text-sm text-text-secondary leading-relaxed">
            Your owner account is under verification.
            <br />
            You’ll be able to access the dashboard once approved.
          </p>

          <button
            onClick={() => {
              clearMessages()
              nav("/auth/login")
            }}
            className="
              w-full h-12
              bg-primary
              text-white
              text-sm font-semibold
              rounded-xl
              transition-all
              hover:bg-primary-hover
              active:bg-primary-active
              active:scale-[0.98]
            "
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}