export default function FormField({
  label,
  error,
  children
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1 transition-all">
      {/* Label */}
      <label
        className={`
          block text-xs font-medium
          transition-colors
          ${error ? "text-danger" : "text-text-secondary"}
        `}
      >
        {label}
      </label>

      {/* Input wrapper */}
      <div
        className={`
          transition-all
          ${error ? "ring-1 ring-danger rounded-xl" : ""}
        `}
      >
        {children}
      </div>

      {/* Error message */}
      <div
        className={`
          min-h-[14px]
          text-xs
          transition-all
          ${error ? "text-danger opacity-100" : "opacity-0"}
        `}
      >
        {error}
      </div>
    </div>
  )
}