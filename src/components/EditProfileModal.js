import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/EditProfileModal.tsx
import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { getProfile, updateProfile } from "../engine/profileEngine";
import { toast } from "react-hot-toast";
export default function EditProfileModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        mobileNo: ""
    });
    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setFormData({
                name: data.name,
                mobileNo: data.mobileNo
            });
        }
        catch (error) {
            toast.error(error.message || "Failed to load profile");
            onClose();
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
            toast.error("Mobile number must be 10 digits");
            return;
        }
        try {
            setSaving(true);
            await updateProfile(formData);
            toast.success("Profile updated successfully");
            onSuccess();
            onClose();
        }
        catch (error) {
            toast.error(error.message || "Failed to update profile");
        }
        finally {
            setSaving(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity duration-350", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: "relative bg-neutral-surface rounded-2xl shadow-premium max-w-md w-full", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-neutral-border", children: [_jsx("h2", { className: "text-page-title text-text-primary font-semibold", children: "Edit Profile" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-neutral-hover rounded-xl transition-all duration-250 hover:scale-105 active:scale-95", children: _jsx(X, { size: 20, className: "text-text-secondary" }) })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-2 border-neutral-border border-t-primary" }) })) : (_jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Full Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-4 py-3 bg-neutral-bg border border-neutral-border rounded-xl\r\n                             text-base text-text-primary placeholder:text-text-muted\r\n                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary\r\n                             transition-all duration-250 hover:border-text-muted", placeholder: "Enter your name", autoFocus: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Mobile Number" }), _jsx("input", { type: "tel", value: formData.mobileNo, onChange: (e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') }), className: "w-full px-4 py-3 bg-neutral-bg border border-neutral-border rounded-xl\r\n                             text-base text-text-primary placeholder:text-text-muted\r\n                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary\r\n                             transition-all duration-250 hover:border-text-muted", placeholder: "10 digit mobile number", maxLength: 10 }), _jsx("p", { className: "text-xs text-text-muted mt-2", children: "Enter 10 digit mobile number" })] })] }), _jsxs("div", { className: "flex gap-3 mt-8", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-3 border border-neutral-border text-text-secondary rounded-xl\r\n                           hover:bg-neutral-hover hover:border-text-muted\r\n                           transition-all duration-250 font-medium\r\n                           active:scale-[0.98]", disabled: saving, children: "Cancel" }), _jsx("button", { type: "submit", disabled: saving, className: "flex-1 px-4 py-3 bg-primary text-white rounded-xl\r\n                           hover:bg-primary-hover shadow-card hover:shadow-card-hover\r\n                           transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed\r\n                           flex items-center justify-center gap-2 font-medium\r\n                           active:scale-[0.98]", children: saving ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" }), _jsx("span", { children: "Saving..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { size: 18 }), _jsx("span", { children: "Save Changes" })] })) })] })] }))] }) })] }));
}
