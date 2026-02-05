import { useState, useEffect } from "react"
import { login, bootstrapSession } from "../../engine/authEngine"
import { useNavigate, Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { validateLogin } from "../../shared/validators"
import FormField from "../../components/FormField"

type LoginErrors = {
  email?: string
  password?: string
}

export default function Login() {
  const nav = useNavigate()
  const { loading, clearMessages } = useAuthStore()

  const [form, setForm] = useState({ email: "", password: "" })
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({})

  useEffect(() => clearMessages(), [])

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: undefined }))
  }

  const submit = async () => {
    clearMessages()
    setFieldErrors({})

    const err = validateLogin(form)
    if (err) return setFieldErrors(err)

    try {
      await login(form)
      await bootstrapSession()

      const { role, status } = useAuthStore.getState()
      if (role === "OWNER" && status === "PENDING") nav("/pending")
      else if (role === "OWNER") nav("/app/owner")
      else if (role === "CUSTOMER") nav("/app/customer")
      else nav("/app/admin")
    } catch {}
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-xl font-semibold text-text-primary mb-6">
        Login
      </h1>

      {/* Email */}
      <FormField label="Email" error={fieldErrors.email}>
        <input
          value={form.email}
          onChange={e => set("email", e.target.value)}
          className="
            w-full h-12 px-4
            rounded-xl
            border border-neutral-border
            text-sm text-text-primary
            placeholder:text-text-muted
            focus:outline-none
            focus:ring-2 focus:ring-primary
          "
        />
      </FormField>

      {/* Password */}
      <FormField label="Password" error={fieldErrors.password}>
        <input
          type="password"
          value={form.password}
          onChange={e => set("password", e.target.value)}
          className="
            w-full h-12 px-4
            rounded-xl
            border border-neutral-border
            text-sm text-text-primary
            placeholder:text-text-muted
            focus:outline-none
            focus:ring-2 focus:ring-primary
          "
        />
      </FormField>

      {/* CTA */}
      <button
        disabled={loading}
        onClick={submit}
        className="
          w-full h-12 mt-4
          rounded-xl
          bg-primary
          text-white text-sm font-semibold
          hover:bg-primary-hover
          active:bg-primary-active
          disabled:opacity-60
        "
      >
        {loading ? "Processing..." : "Login"}
      </button>

      {/* Forgot Password Link */}
      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  )
}