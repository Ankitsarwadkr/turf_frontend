import { useState, useEffect } from "react"
import { registerCustomer } from "../../engine/authEngine"
import { useNavigate } from "react-router-dom"
import { validateRegisterCustomer } from "../../shared/validators"
import { useAuthStore } from "../../store/authStore"
import FormField from "../../components/FormField"

export default function RegisterCustomer() {
  const nav = useNavigate()
  const { loading, clearMessages } = useAuthStore()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: ""
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  useEffect(() => clearMessages(), [])

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: null }))
  }

  const submit = async () => {
    if (loading) return

    clearMessages()
    setFieldErrors({})

    const err = validateRegisterCustomer(form)
    if (err) return setFieldErrors(err)

    try {
      await registerCustomer(form)
      setTimeout(() => nav("/auth/login"), 1200)
    } catch {}
  }

  const inputClass = `
    w-full h-12 px-4
    rounded-xl
    border border-neutral-border
    text-text-primary text-sm
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary
    disabled:opacity-60 disabled:cursor-not-allowed
  `

  return (
    <div className="space-y-6 animate-authCardIn">
      {/* Title */}
      <h1 className="text-[20px] font-semibold text-text-primary">
        Create Account
      </h1>

      {/* Form */}
      <div className="space-y-4">
        <FormField label="Name" error={fieldErrors.name ?? undefined}>
          <input
            disabled={loading}
            value={form.name}
            onChange={e => set("name", e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Email" error={fieldErrors.email ?? undefined}>
          <input
            disabled={loading}
            value={form.email}
            onChange={e => set("email", e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Password" error={fieldErrors.password ?? undefined}>
          <input
            disabled={loading}
            type="password"
            value={form.password}
            onChange={e => set("password", e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Mobile" error={fieldErrors.mobileNo ?? undefined}>
          <input
            disabled={loading}
            value={form.mobileNo}
            onChange={e => set("mobileNo", e.target.value)}
            className={inputClass}
          />
        </FormField>
      </div>

      {/* CTA */}
      <button
        disabled={loading}
        onClick={submit}
        className="
          w-full h-12
          rounded-xl
          bg-primary
          text-white text-sm font-semibold
          transition-all duration-150
          hover:bg-primary-hover
          active:bg-primary-active
          active:scale-[0.98]
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
      >
        {loading ? "Processing..." : "Create Account"}
      </button>
    </div>
  )
}