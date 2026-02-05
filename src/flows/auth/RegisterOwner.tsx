import { useState, useEffect } from "react"
import { registerOwner } from "../../engine/authEngine"
import { useNavigate } from "react-router-dom"
import { validateRegisterOwner } from "../../shared/validators"
import { useAuthStore } from "../../store/authStore"
import FormField from "../../components/FormField"

export default function RegisterOwner() {
  const nav = useNavigate()
  const { loading, clearMessages } = useAuthStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [transitioning, setTransitioning] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    subscriptionAmount: "",
    docType: "",
    document: null as File | null
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  useEffect(() => clearMessages(), [])

  const set = (k: keyof typeof form, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(e => ({ ...e, [k]: null }))
  }

  /* ---------- STEP VALIDATION ---------- */

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = "Name required"
    if (!form.email) errs.email = "Email required"
    if (!form.password) errs.password = "Password required"
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match"

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (!validateStep1()) return
    setTransitioning(true)
    setTimeout(() => {
      setStep(2)
      setTransitioning(false)
    }, 120)
  }

  const goBack = () => {
    setTransitioning(true)
    setTimeout(() => {
      setStep(1)
      setTransitioning(false)
    }, 120)
  }

  /* ---------- SUBMIT ---------- */

  const submit = async () => {
    if (loading) return
    clearMessages()
    setFieldErrors({})

    const err = validateRegisterOwner({
      ...form,
      subscriptionAmount: Number(form.subscriptionAmount)
    })
    if (err) return setFieldErrors(err)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "confirmPassword") fd.append(k, v as any)
    })

    try {
      await registerOwner(fd)
      setTimeout(() => nav("/pending"), 1200)
    } catch {}
  }

  const inputClass = `
    w-full h-12 px-4 rounded-xl
    border border-neutral-border
    text-sm text-text-primary
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary
  `

  const stepClass = `
    transition-all duration-200 ease-out
    ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
  `

  return (
    <div className="space-y-6 animate-authCardIn">
      {/* TITLE */}
      <div className="space-y-1">
        <h1 className="text-[20px] font-semibold text-text-primary">
          Register as Owner
        </h1>
        <p className="text-sm text-text-secondary">
          Step {step} of 2
        </p>
      </div>

      {/* PROGRESS */}
      <div className="flex gap-2">
        <div className={`h-1 flex-1 rounded ${step >= 1 ? "bg-primary" : "bg-neutral-border"}`} />
        <div className={`h-1 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-neutral-border"}`} />
      </div>

      {/* STEP CONTENT */}
      {step === 1 && (
        <div className={`${stepClass} space-y-4`}>
          <FormField label="Name" error={fieldErrors.name ?? undefined}>
            <input value={form.name} onChange={e => set("name", e.target.value)} className={inputClass} />
          </FormField>

          <FormField label="Email" error={fieldErrors.email ?? undefined}>
            <input value={form.email} onChange={e => set("email", e.target.value)} className={inputClass} />
          </FormField>

          <FormField label="Password" error={fieldErrors.password ?? undefined}>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} className={inputClass} />
          </FormField>

          <FormField label="Confirm Password" error={fieldErrors.confirmPassword ?? undefined}>
            <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className={inputClass} />
          </FormField>

          <button
            onClick={goNext}
            className="w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold
                       hover:bg-primary-hover active:bg-primary-active active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={`${stepClass} space-y-4`}>
          <FormField label="Mobile Number" error={fieldErrors.mobileNo ?? undefined}>
            <input value={form.mobileNo} onChange={e => set("mobileNo", e.target.value)} className={inputClass} />
          </FormField>

          <FormField label="Subscription Amount" error={fieldErrors.subscriptionAmount ?? undefined}>
            <input type="number" value={form.subscriptionAmount} onChange={e => set("subscriptionAmount", e.target.value)} className={inputClass} />
          </FormField>

          <FormField label="Document Type" error={fieldErrors.docType ?? undefined}>
            <select value={form.docType} onChange={e => set("docType", e.target.value)} className={inputClass}>
              <option value="">Select document type</option>
              <option value="GST">GST</option>
              <option value="PAN">PAN</option>
              <option value="AADHAR">AADHAR</option>
              <option value="OTHER">OTHER</option>
            </select>
          </FormField>

          <FormField label="Verification Document" error={fieldErrors.document ?? undefined}>
            <input type="file" onChange={e => set("document", e.target.files?.[0] || null)} />
          </FormField>

          <div className="flex gap-3">
            <button
              onClick={goBack}
              className="flex-1 h-12 rounded-xl border border-neutral-border
                         text-sm font-semibold active:scale-[0.98]"
            >
              Back
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-primary text-white
                         text-sm font-semibold hover:bg-primary-hover
                         active:bg-primary-active active:scale-[0.98]
                         disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}