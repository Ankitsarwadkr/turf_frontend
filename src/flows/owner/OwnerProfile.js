import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/flows/owner/OwnerProfile.tsx
import { useEffect, useState } from "react";
import LogoutButton from "../../components/LogoutButton";
import EditProfileModal from "../../components/EditProfileModal";
import { User, Mail, Phone, Settings, HelpCircle, Bell, Edit2, Crown } from "lucide-react";
import { getProfile } from "../../engine/profileEngine";
import { toast } from "react-hot-toast";
export default function OwnerProfile() {
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
        return (_jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-2 border-neutral-border border-t-primary" }) }));
    }
    if (!profile) {
        return (_jsxs("div", { className: "text-center py-16", children: [_jsx("p", { className: "text-base text-text-secondary mb-4", children: "Failed to load profile" }), _jsx("button", { onClick: fetchProfile, className: "px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover\r\n                   transition-all duration-250 font-medium shadow-card hover:shadow-card-hover\r\n                   active:scale-[0.98]", children: "Retry" })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border p-6 mb-5 shadow-card \r\n                      hover:shadow-card-hover transition-all duration-350", children: [_jsxs("div", { className: "flex items-center justify-between mb-5", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center\r\n                            shadow-subtle transition-transform duration-250 hover:scale-105", children: _jsx(User, { className: "text-primary", size: 32, strokeWidth: 2 }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-page-title text-text-primary font-semibold mb-1", children: profile.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Crown, { size: 14, className: "text-primary" }), _jsx("p", { className: "text-sm text-text-secondary font-medium", children: "Turf Owner" })] })] })] }), _jsx("button", { onClick: () => setIsEditModalOpen(true), className: "p-3 hover:bg-neutral-hover rounded-xl transition-all duration-250 \r\n                       hover:scale-105 active:scale-95 group", children: _jsx(Edit2, { size: 20, className: "text-text-secondary group-hover:text-primary transition-colors" }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm text-text-secondary\r\n                          hover:text-text-primary transition-colors duration-250 group", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-colors", children: _jsx(Mail, { size: 16 }) }), _jsx("span", { className: "font-medium", children: profile.email })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm text-text-secondary\r\n                          hover:text-text-primary transition-colors duration-250 group", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-colors", children: _jsx(Phone, { size: 16 }) }), _jsx("span", { className: "font-medium", children: profile.mobileNo })] })] }), profile.subscriptionStatus && (_jsxs("div", { className: "mt-5 pt-5 border-t border-neutral-border", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "text-sm font-semibold text-text-primary", children: "Subscription Status" }), _jsx("span", { className: `px-3 py-1.5 rounded-xl text-xs font-semibold shadow-subtle
                               transition-all duration-250 hover:scale-105 ${profile.subscriptionStatus === 'ACTIVE'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-danger/10 text-danger'}`, children: profile.subscriptionStatus })] }), profile.subscriptionAmount && (_jsxs("div", { className: "flex items-center justify-between p-3 bg-neutral-bg rounded-xl", children: [_jsx("span", { className: "text-sm font-medium text-text-secondary", children: "Monthly Amount" }), _jsxs("span", { className: "text-base font-semibold text-primary", children: ["\u20B9", profile.subscriptionAmount] })] }))] }))] }), _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border mb-5 shadow-card overflow-hidden", children: [_jsxs("button", { onClick: () => setIsEditModalOpen(true), className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover \r\n                     transition-all duration-250 border-b border-neutral-border group\r\n                     active:scale-[0.99]", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle \r\n                          group-hover:text-primary transition-all duration-250", children: _jsx(Settings, { size: 20, className: "text-text-secondary group-hover:text-primary transition-colors" }) }), _jsx("span", { className: "font-medium text-text-primary group-hover:text-primary transition-colors", children: "Account Settings" })] }), _jsxs("button", { className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover \r\n                           transition-all duration-250 border-b border-neutral-border group\r\n                           active:scale-[0.99]", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-all duration-250", children: _jsx(Bell, { size: 20, className: "text-text-secondary group-hover:text-primary transition-colors" }) }), _jsx("span", { className: "font-medium text-text-primary group-hover:text-primary transition-colors", children: "Notifications" })] }), _jsxs("button", { className: "w-full flex items-center gap-3 px-6 py-4 hover:bg-neutral-hover \r\n                           transition-all duration-250 group active:scale-[0.99]", children: [_jsx("div", { className: "p-2 bg-neutral-bg rounded-lg group-hover:bg-primary-subtle transition-all duration-250", children: _jsx(HelpCircle, { size: 20, className: "text-text-secondary group-hover:text-primary transition-colors" }) }), _jsx("span", { className: "font-medium text-text-primary group-hover:text-primary transition-colors", children: "Help & Support" })] })] }), _jsx("div", { className: "lg:hidden", children: _jsx(LogoutButton, {}) })] }), _jsx(EditProfileModal, { isOpen: isEditModalOpen, onClose: () => setIsEditModalOpen(false), onSuccess: fetchProfile })] }));
}
