// src/components/EditProfileModal.tsx
import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import { getProfile, updateProfile } from "../engine/profileEngine"
import { toast } from "react-hot-toast"

interface ProfileData {
  id: number
  role: string
  name: string
  email: string
  mobileNo: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobileNo: ""
  })

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data: ProfileData = await getProfile()
      setFormData({
        name: data.name,
        mobileNo: data.mobileNo
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
      toast.error("Mobile number must be 10 digits")
      return
    }

    try {
      setSaving(true)
      await updateProfile(formData)
      toast.success("Profile updated successfully")
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity duration-350"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-neutral-surface rounded-2xl shadow-premium max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-border">
            <h2 className="text-page-title text-text-primary font-semibold">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-hover rounded-xl transition-all duration-250 hover:scale-105 active:scale-95"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-border border-t-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-bg border border-neutral-border rounded-xl
                             text-base text-text-primary placeholder:text-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             transition-all duration-250 hover:border-text-muted"
                    placeholder="Enter your name"
                    autoFocus
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNo}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 bg-neutral-bg border border-neutral-border rounded-xl
                             text-base text-text-primary placeholder:text-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             transition-all duration-250 hover:border-text-muted"
                    placeholder="10 digit mobile number"
                    maxLength={10}
                  />
                  <p className="text-xs text-text-muted mt-2">Enter 10 digit mobile number</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-neutral-border text-text-secondary rounded-xl
                           hover:bg-neutral-hover hover:border-text-muted
                           transition-all duration-250 font-medium
                           active:scale-[0.98]"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl
                           hover:bg-primary-hover shadow-card hover:shadow-card-hover
                           transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 font-medium
                           active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}