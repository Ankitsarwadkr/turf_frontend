import { useNavigate } from "react-router-dom"

export default function Unauthorized() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
      <div
        className="
          w-full
          max-w-sm
          bg-neutral-surface
          rounded-xl
          shadow-lg
          border border-neutral-border
          p-6
          text-center
          space-y-6
        "
      >
        {/* Title */}
        <h1 className="text-[20px] font-semibold text-danger">
          Access Denied
        </h1>

        {/* Body */}
        <p className="text-sm text-text-secondary leading-relaxed">
          You are not authorized to access this page.
        </p>

        {/* CTA */}
        <button
          onClick={() => nav("/auth/login")}
          className="
            w-full
            h-12
            bg-primary
            text-white
            text-sm
            font-semibold
            rounded-xl
            hover:bg-primary-hover
            active:bg-primary-active
          "
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}