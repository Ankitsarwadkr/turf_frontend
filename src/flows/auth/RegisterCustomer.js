import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { registerCustomer } from "../../engine/authEngine";
import { useNavigate } from "react-router-dom";
import { validateRegisterCustomer } from "../../shared/validators";
import { useAuthStore } from "../../store/authStore";
import FormField from "../../components/FormField";
export default function RegisterCustomer() {
    const nav = useNavigate();
    const { loading, clearMessages } = useAuthStore();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        mobileNo: ""
    });
    const [fieldErrors, setFieldErrors] = useState({});
    useEffect(() => clearMessages(), []);
    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setFieldErrors(e => ({ ...e, [k]: null }));
    };
    const submit = async () => {
        if (loading)
            return;
        clearMessages();
        setFieldErrors({});
        const err = validateRegisterCustomer(form);
        if (err)
            return setFieldErrors(err);
        try {
            await registerCustomer(form);
            setTimeout(() => nav("/auth/login"), 1200);
        }
        catch { }
    };
    const inputClass = `
    w-full h-12 px-4
    rounded-xl
    border border-neutral-border
    text-text-primary text-sm
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary
    disabled:opacity-60 disabled:cursor-not-allowed
  `;
    return (_jsxs("div", { className: "space-y-6 animate-authCardIn", children: [_jsx("h1", { className: "text-[20px] font-semibold text-text-primary", children: "Create Account" }), _jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { label: "Name", error: fieldErrors.name ?? undefined, children: _jsx("input", { disabled: loading, value: form.name, onChange: e => set("name", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Email", error: fieldErrors.email ?? undefined, children: _jsx("input", { disabled: loading, value: form.email, onChange: e => set("email", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Password", error: fieldErrors.password ?? undefined, children: _jsx("input", { disabled: loading, type: "password", value: form.password, onChange: e => set("password", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Mobile", error: fieldErrors.mobileNo ?? undefined, children: _jsx("input", { disabled: loading, value: form.mobileNo, onChange: e => set("mobileNo", e.target.value), className: inputClass }) })] }), _jsx("button", { disabled: loading, onClick: submit, className: "\r\n          w-full h-12\r\n          rounded-xl\r\n          bg-primary\r\n          text-white text-sm font-semibold\r\n          transition-all duration-150\r\n          hover:bg-primary-hover\r\n          active:bg-primary-active\r\n          active:scale-[0.98]\r\n          disabled:opacity-60\r\n          disabled:cursor-not-allowed\r\n        ", children: loading ? "Processing..." : "Create Account" })] }));
}
