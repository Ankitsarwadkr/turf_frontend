// src/flows/customer/CustomerProfile.tsx
import { useEffect, useState } from "react"
import LogoutButton from "../../components/LogoutButton"
import EditProfileModal from "../../components/EditProfileModal"
import { User, Mail, Phone, Settings, HelpCircle, Bell, Edit2, Sparkles } from "lucide-react"
import { getProfile } from "../../engine/profileEngine"
import { toast } from "react-hot-toast"

interface ProfileData {
  id: number
  role: string
  name: string
  email: string
  mobileNo: string
}

export default function CustomerProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getProfile()
      setProfile(data)
    } catch (error: any) {
      console.error("Failed to fetch profile:", error)
      toast.error(error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 animate-scaleIn">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-bg rounded-2xl animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-40 bg-neutral-bg rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-neutral-bg rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-bg rounded-lg animate-pulse"></div>
              <div className="h-4 w-48 bg-neutral-bg rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-bg rounded-lg animate-pulse"></div>
              <div className="h-4 w-36 bg-neutral-bg rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8 animate-fadeIn">
        <p className="text-base text-text-secondary mb-4">Failed to load profile</p>
        <button 
          onClick={fetchProfile}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Profile Header Card */}
        <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center shadow-subtle">
                <User className="text-primary" size={32} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-page-title text-text-primary mb-1">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <p className="text-sm text-text-secondary font-medium">Customer</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 hover:bg-neutral-hover rounded-xl transition-colors"
              aria-label="Edit profile"
            >
              <Edit2 size={20} className="text-text-secondary" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="p-2 bg-neutral-bg rounded-lg">
                <Mail size={16} />
              </div>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="p-2 bg-neutral-bg rounded-lg">
                <Phone size={16} />
              </div>
              <span className="font-medium">{profile.mobileNo}</span>
            </div>
          </div>
        </div>

        {/* Menu Options Card */}
        <div className="bg-neutral-surface rounded-2xl border border-neutral-border mb-5 shadow-card">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover border-b border-neutral-border transition-colors"
          >
            <div className="p-2 bg-neutral-bg rounded-lg">
              <Settings size={20} className="text-text-secondary" />
            </div>
            <span className="font-medium text-text-primary">
              Account Settings
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover border-b border-neutral-border transition-colors">
            <div className="p-2 bg-neutral-bg rounded-lg">
              <Bell size={20} className="text-text-secondary" />
            </div>
            <span className="font-medium text-text-primary">
              Notifications
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover transition-colors">
            <div className="p-2 bg-neutral-bg rounded-lg">
              <HelpCircle size={20} className="text-text-secondary" />
            </div>
            <span className="font-medium text-text-primary">
              Help & Support
            </span>
          </button>
        </div>

        {/* Logout Button - Mobile Only */}
        <div className="lg:hidden">
          <LogoutButton />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchProfile}
      />
    </>
  )
}