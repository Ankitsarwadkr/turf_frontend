import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../engine/authEngine";
import { useAuthStore } from "../../store/authStore";
import FormField from "../../components/FormField";
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const nav = useNavigate();
    const { loading, clearMessages, error, success } = useAuthStore();
    const token = searchParams.get("token") || "";
    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [tokenError, setTokenError] = useState("");
    useEffect(() => {
        clearMessages();
        // Validate token on mount
        if (!token) {
            setTokenError("Invalid or missing reset token. Please request a new password reset link.");
        }
    }, [token, clearMessages]);
    const validateForm = () => {
        let isValid = true;
        const newErrors = { newPassword: "", confirmPassword: "" };
        // Password validation
        if (!form.newPassword) {
            newErrors.newPassword = "Password is required";
            isValid = false;
        }
        else if (form.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
            isValid = false;
        }
        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        }
        else if (form.newPassword !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setTokenError("Invalid reset token");
            return;
        }
        clearMessages();
        if (!validateForm())
            return;
        try {
            // 🔥 Token IS sent to backend here along with new password
            await resetPassword({
                token, // This comes from the URL
                newPassword: form.newPassword
            });
            // Auto-redirect to login after successful reset
            setTimeout(() => nav("/auth/login"), 3000);
        }
        catch {
            // Error is handled in authEngine
        }
    };
    const setField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: "" }));
    };
    // Password strength indicator component
    const PasswordStrengthIndicator = ({ password }) => {
        const getStrength = (pass) => {
            let score = 0;
            if (pass.length >= 8)
                score++;
            if (/[A-Z]/.test(pass))
                score++;
            if (/[0-9]/.test(pass))
                score++;
            if (/[^A-Za-z0-9]/.test(pass))
                score++;
            return score;
        };
        const strength = getStrength(password);
        const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
        if (!password)
            return null;
        return (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { children: "Password strength:" }), _jsx("span", { className: `font-medium ${strength < 2 ? "text-red-500" :
                                strength < 3 ? "text-yellow-500" :
                                    "text-green-500"}`, children: strengthLabels[strength] })] }), _jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4].map((level) => (_jsx("div", { className: `h-1 flex-1 rounded-full ${level <= strength
                            ? strength < 2
                                ? "bg-red-500"
                                : strength < 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            : "bg-gray-200"}` }, level))) })] }));
    };
    return (_jsxs("div", { className: "max-w-md mx-auto p-6", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Create new password" }), _jsx("p", { className: "text-gray-600", children: "Your new password must be different from previous passwords" })] }), tokenError && (_jsxs("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: tokenError }) })] }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: "/forgot-password", className: "text-sm font-medium text-primary hover:text-primary-hover", children: "Request a new reset link" }) })] })), success && (_jsx("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-green-800", children: success }), _jsx("p", { className: "mt-1 text-sm text-green-700", children: "Redirecting to login page..." })] })] }) })), error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: error }) })] }) })), !tokenError && (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx(FormField, { label: "New password", error: errors.newPassword, children: _jsxs("div", { children: [_jsx("input", { type: "password", value: form.newPassword, onChange: (e) => setField("newPassword", e.target.value), className: `
                  w-full h-12 px-4
                  rounded-xl
                  border ${errors.newPassword ? 'border-red-500' : 'border-neutral-border'}
                  text-sm text-text-primary
                  placeholder:text-text-muted
                  focus:outline-none
                  focus:ring-2 focus:ring-primary
                `, placeholder: "Enter new password", disabled: loading || !!success }), _jsx(PasswordStrengthIndicator, { password: form.newPassword })] }) }), _jsx(FormField, { label: "Confirm new password", error: errors.confirmPassword, children: _jsx("input", { type: "password", value: form.confirmPassword, onChange: (e) => setField("confirmPassword", e.target.value), className: `
                w-full h-12 px-4
                rounded-xl
                border ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-border'}
                text-sm text-text-primary
                placeholder:text-text-muted
                focus:outline-none
                focus:ring-2 focus:ring-primary
              `, placeholder: "Confirm new password", disabled: loading || !!success }) }), _jsx("button", { type: "submit", disabled: loading || !!success, className: "\r\n              w-full h-12\r\n              rounded-xl\r\n              bg-primary\r\n              text-white text-sm font-semibold\r\n              hover:bg-primary-hover\r\n              active:bg-primary-active\r\n              disabled:opacity-60 disabled:cursor-not-allowed\r\n              transition-colors\r\n            ", children: loading ? "Resetting password..." : "Reset password" })] })), _jsx("div", { className: "mt-6 text-center", children: _jsx(Link, { to: "/auth/login", className: "text-sm text-primary hover:text-primary-hover font-medium", children: "\u2190 Back to login" }) }), !tokenError && (_jsxs("div", { className: "mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsx("h3", { className: "text-sm font-medium text-gray-900 mb-2", children: "Password requirements:" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("li", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-green-500 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }), "At least 8 characters long"] }), _jsxs("li", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-gray-300 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), "Should contain uppercase & lowercase letters"] }), _jsxs("li", { className: "flex items-center", children: [_jsx("svg", { className: "h-4 w-4 text-gray-300 mr-2", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), "Should contain numbers or special characters"] })] })] }))] }));
}
