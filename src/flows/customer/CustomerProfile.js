import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/flows/customer/CustomerProfile.tsx
import { useEffect, useState } from "react";
import LogoutButton from "../../components/LogoutButton";
import EditProfileModal from "../../components/EditProfileModal";
import { User, Mail, Phone, Settings, HelpCircle, Bell, Edit2, Sparkles } from "lucide-react";
import { getProfile } from "../../engine/profileEngine";
import { toast } from "react-hot-toast";
export default function CustomerProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    useEffect(() => {
        fetchProfile();
    }, []);
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data);
        }
        catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error(error.message || "Failed to load profile");
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 animate-scaleIn", children: [_jsx("div", { className: "flex items-center justify-between mb-5", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-20 h-20 bg-neutral-bg rounded-2xl animate-pulse" }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-6 w-40 bg-neutral-bg rounded animate-pulse" }), _jsx("div", { className: "h-4 w-24 bg-neutral-bg rounded animate-pulse" })] })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-neutral-bg rounded-lg animate-pulse" }), _jsx("div", { className: "h-4 w-48 bg-neutral-bg rounded animate-pulse" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-neutral-bg rounded-lg animate-pulse" }), _jsx("div", { className: "h-4 w-36 bg-neutral-bg rounded animate-pulse" })] })] })] }) }));
    }
    if (!profile) {
        return (_jsxs("div", { className: "text-center py-8 animate-fadeIn", children: [_jsx("p", { className: "text-base text-text-secondary mb-4", children: "Failed to load profile" }), _jsx("button", { onClick: fetchProfile, className: "px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors", children: "Retry" })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-2xl mx-auto animate-fadeIn", children: [_jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center shadow-subtle", children: _jsx(User, { className: "text-primary", size: 32, strokeWidth: 2 }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-page-title text-text-primary mb-1", children: profile.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { size: 14, className: "text-primary" }), _jsx("p", { className: "text-sm text-text-secondary font-medium", children: "Customer" })] })] })] }), _jsx("button", { onClick: () => setIsEditModalOpen(true), className: "p-3 hover:bg-neutral-hover rounded-xl transition-colors", "aria-label": "Edit profile", children: _jsx(Edit2, { size: 20, className: "text-text-secondary" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm text-text-secondary", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg", children: _jsx(Mail, { size: 16 }) }), _jsx("span", { className: "font-medium", children: profile.email })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm text-text-secondary", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg", children: _jsx(Phone, { size: 16 }) }), _jsx("span", { className: "font-medium", children: profile.mobileNo })] })] })] }), _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border mb-5 shadow-card", children: [_jsxs("button", { onClick: () => setIsEditModalOpen(true), className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover border-b border-neutral-border transition-colors", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg", children: _jsx(Settings, { size: 20, className: "text-text-secondary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: "Account Settings" })] }), _jsxs("button", { className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover border-b border-neutral-border transition-colors", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg", children: _jsx(Bell, { size: 20, className: "text-text-secondary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: "Notifications" })] }), _jsxs("button", { className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover transition-colors", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg", children: _jsx(HelpCircle, { size: 20, className: "text-text-secondary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: "Help & Support" })] })] }), _jsx("div", { className: "lg:hidden", children: _jsx(LogoutButton, {}) })] }), _jsx(EditProfileModal, { isOpen: isEditModalOpen, onClose: () => setIsEditModalOpen(false), onSuccess: fetchProfile })] }));
}
