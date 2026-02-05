// src/flows/owner/OwnerProfile.tsx
import { useEffect, useState } from "react"
import LogoutButton from "../../components/LogoutButton"
import EditProfileModal from "../../components/EditProfileModal"
import { User, Mail, Phone, Settings, HelpCircle, Bell, Edit2, Crown } from "lucide-react"
import { getProfile } from "../../engine/profileEngine"
import { toast } from "react-hot-toast"

interface ProfileData {
  id: number
  role: string
  name: string
  email: string
  mobileNo: string
  subscriptionStatus?: string
  subscriptionAmount?: number
}

export default function OwnerProfile() {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-border border-t-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-base text-text-secondary mb-4">Failed to load profile</p>
        <button 
          onClick={fetchProfile}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover
                   transition-all duration-250 font-medium shadow-card hover:shadow-card-hover
                   active:scale-[0.98]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 shadow-card 
                      hover:shadow-card-hover transition-all duration-350">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center
                            shadow-subtle transition-transform duration-250 hover:scale-105">
                <User className="text-primary" size={32} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-page-title text-text-primary font-semibold mb-1">
                  {profile.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Crown size={14} className="text-primary" />
                  <p className="text-sm text-text-secondary font-medium">Turf Owner</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 hover:bg-neutral-hover rounded-xl transition-all duration-250 
                       hover:scale-105 active:scale-95 group"
            >
              <Edit2 size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary
                          hover:text-text-primary transition-colors duration-250 group">
              <div className="p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-colors">
                <Mail size={16} />
              </div>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary
                          hover:text-text-primary transition-colors duration-250 group">
              <div className="p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-colors">
                <Phone size={16} />
              </div>
              <span className="font-medium">{profile.mobileNo}</span>
            </div>
          </div>

          {/* Subscription Status */}
          {profile.subscriptionStatus && (
            <div className="mt-5 pt-5 border-t border-neutral-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-primary">Subscription Status</span>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-subtle
                               transition-all duration-250 hover:scale-105 ${
                  profile.subscriptionStatus === 'ACTIVE' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  {profile.subscriptionStatus}
                </span>
              </div>
              {profile.subscriptionAmount && (
                <div className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl">
                  <span className="text-sm font-medium text-text-secondary">Monthly Amount</span>
                  <span className="text-base font-semibold text-primary">
                    ₹{profile.subscriptionAmount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Options Card */}
        <div className="bg-neutral-surface rounded-2xl border border-neutral-border mb-5 shadow-card overflow-hidden">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover 
                     transition-all duration-250 border-b border-neutral-border group
                     active:scale-[0.99]"
          >
            <div className="p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle 
                          group-hover:text-primary transition-all duration-250">
              <Settings size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
              Account Settings
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover 
                           transition-all duration-250 border-b border-neutral-border group
                           active:scale-[0.99]">
            <div className="p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-all duration-250">
              <Bell size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
              Notifications
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover 
                           transition-all duration-250 group active:scale-[0.99]">
            <div className="p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-all duration-250">
              <HelpCircle size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
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