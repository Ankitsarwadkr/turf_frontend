import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { forgotPassword } from "../../engine/authEngine"
import { useAuthStore } from "../../store/authStore"
import FormField from "../../components/FormField"

export default function ForgotPassword() {
  const nav = useNavigate()
  const { loading, clearMessages, error, success } = useAuthStore()
  
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    
    if (!validateEmail()) return
    
    try {
      await forgotPassword(email)
      // Optionally redirect after success
      // setTimeout(() => nav("/login"), 3000)
    } catch {
      // Error is handled in authEngine
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reset your password
        </h1>
        <p className="text-gray-600">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Email address" error={emailError}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            className={`
              w-full h-12 px-4
              rounded-xl
              border ${emailError ? 'border-red-500' : 'border-neutral-border'}
              text-sm text-text-primary
              placeholder:text-text-muted
              focus:outline-none
              focus:ring-2 focus:ring-primary
            `}
            placeholder="you@example.com"
            disabled={loading}
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full h-12
            rounded-xl
            bg-primary
            text-white text-sm font-semibold
            hover:bg-primary-hover
            active:bg-primary-active
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          ← Back to login
        </Link>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              The reset link will be valid for 1 hour. If you don't receive an email, please check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}