import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { login, bootstrapSession } from "../../engine/authEngine";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { validateLogin } from "../../shared/validators";
import FormField from "../../components/FormField";
export default function Login() {
    const nav = useNavigate();
    const { loading, clearMessages } = useAuthStore();
    const [form, setForm] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    useEffect(() => clearMessages(), []);
    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setFieldErrors(e => ({ ...e, [k]: undefined }));
    };
    const submit = async () => {
        clearMessages();
        setFieldErrors({});
        const err = validateLogin(form);
        if (err)
            return setFieldErrors(err);
        try {
            await login(form);
            await bootstrapSession();
            const { role, status } = useAuthStore.getState();
            if (role === "OWNER" && status === "PENDING")
                nav("/pending");
            else if (role === "OWNER")
                nav("/app/owner");
            else if (role === "CUSTOMER")
                nav("/app/customer");
            else
                nav("/app/admin");
        }
        catch { }
    };
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold text-text-primary mb-6", children: "Login" }), _jsx(FormField, { label: "Email", error: fieldErrors.email, children: _jsx("input", { value: form.email, onChange: e => set("email", e.target.value), className: "\r\n            w-full h-12 px-4\r\n            rounded-xl\r\n            border border-neutral-border\r\n            text-sm text-text-primary\r\n            placeholder:text-text-muted\r\n            focus:outline-none\r\n            focus:ring-2 focus:ring-primary\r\n          " }) }), _jsx(FormField, { label: "Password", error: fieldErrors.password, children: _jsx("input", { type: "password", value: form.password, onChange: e => set("password", e.target.value), className: "\r\n            w-full h-12 px-4\r\n            rounded-xl\r\n            border border-neutral-border\r\n            text-sm text-text-primary\r\n            placeholder:text-text-muted\r\n            focus:outline-none\r\n            focus:ring-2 focus:ring-primary\r\n          " }) }), _jsx("button", { disabled: loading, onClick: submit, className: "\r\n          w-full h-12 mt-4\r\n          rounded-xl\r\n          bg-primary\r\n          text-white text-sm font-semibold\r\n          hover:bg-primary-hover\r\n          active:bg-primary-active\r\n          disabled:opacity-60\r\n        ", children: loading ? "Processing..." : "Login" }), _jsx("div", { className: "mt-4 text-center", children: _jsx(Link, { to: "/forgot-password", className: "text-sm text-primary hover:text-primary-hover font-medium", children: "Forgot your password?" }) })] }));
}
