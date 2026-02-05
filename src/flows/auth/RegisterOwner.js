import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { registerOwner } from "../../engine/authEngine";
import { useNavigate } from "react-router-dom";
import { validateRegisterOwner } from "../../shared/validators";
import { useAuthStore } from "../../store/authStore";
import FormField from "../../components/FormField";
export default function RegisterOwner() {
    const nav = useNavigate();
    const { loading, clearMessages } = useAuthStore();
    const [step, setStep] = useState(1);
    const [transitioning, setTransitioning] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobileNo: "",
        subscriptionAmount: "",
        docType: "",
        document: null
    });
    const [fieldErrors, setFieldErrors] = useState({});
    useEffect(() => clearMessages(), []);
    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setFieldErrors(e => ({ ...e, [k]: null }));
    };
    /* ---------- STEP VALIDATION ---------- */
    const validateStep1 = () => {
        const errs = {};
        if (!form.name)
            errs.name = "Name required";
        if (!form.email)
            errs.email = "Email required";
        if (!form.password)
            errs.password = "Password required";
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = "Passwords do not match";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const goNext = () => {
        if (!validateStep1())
            return;
        setTransitioning(true);
        setTimeout(() => {
            setStep(2);
            setTransitioning(false);
        }, 120);
    };
    const goBack = () => {
        setTransitioning(true);
        setTimeout(() => {
            setStep(1);
            setTransitioning(false);
        }, 120);
    };
    /* ---------- SUBMIT ---------- */
    const submit = async () => {
        if (loading)
            return;
        clearMessages();
        setFieldErrors({});
        const err = validateRegisterOwner({
            ...form,
            subscriptionAmount: Number(form.subscriptionAmount)
        });
        if (err)
            return setFieldErrors(err);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (k !== "confirmPassword")
                fd.append(k, v);
        });
        try {
            await registerOwner(fd);
            setTimeout(() => nav("/pending"), 1200);
        }
        catch { }
    };
    const inputClass = `
    w-full h-12 px-4 rounded-xl
    border border-neutral-border
    text-sm text-text-primary
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary
  `;
    const stepClass = `
    transition-all duration-200 ease-out
    ${transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}
  `;
    return (_jsxs("div", { className: "space-y-6 animate-authCardIn", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-[20px] font-semibold text-text-primary", children: "Register as Owner" }), _jsxs("p", { className: "text-sm text-text-secondary", children: ["Step ", step, " of 2"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: `h-1 flex-1 rounded ${step >= 1 ? "bg-primary" : "bg-neutral-border"}` }), _jsx("div", { className: `h-1 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-neutral-border"}` })] }), step === 1 && (_jsxs("div", { className: `${stepClass} space-y-4`, children: [_jsx(FormField, { label: "Name", error: fieldErrors.name ?? undefined, children: _jsx("input", { value: form.name, onChange: e => set("name", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Email", error: fieldErrors.email ?? undefined, children: _jsx("input", { value: form.email, onChange: e => set("email", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Password", error: fieldErrors.password ?? undefined, children: _jsx("input", { type: "password", value: form.password, onChange: e => set("password", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Confirm Password", error: fieldErrors.confirmPassword ?? undefined, children: _jsx("input", { type: "password", value: form.confirmPassword, onChange: e => set("confirmPassword", e.target.value), className: inputClass }) }), _jsx("button", { onClick: goNext, className: "w-full h-12 rounded-xl bg-primary text-white text-sm font-semibold\r\n                       hover:bg-primary-hover active:bg-primary-active active:scale-[0.98]", children: "Continue" })] })), step === 2 && (_jsxs("div", { className: `${stepClass} space-y-4`, children: [_jsx(FormField, { label: "Mobile Number", error: fieldErrors.mobileNo ?? undefined, children: _jsx("input", { value: form.mobileNo, onChange: e => set("mobileNo", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Subscription Amount", error: fieldErrors.subscriptionAmount ?? undefined, children: _jsx("input", { type: "number", value: form.subscriptionAmount, onChange: e => set("subscriptionAmount", e.target.value), className: inputClass }) }), _jsx(FormField, { label: "Document Type", error: fieldErrors.docType ?? undefined, children: _jsxs("select", { value: form.docType, onChange: e => set("docType", e.target.value), className: inputClass, children: [_jsx("option", { value: "", children: "Select document type" }), _jsx("option", { value: "GST", children: "GST" }), _jsx("option", { value: "PAN", children: "PAN" }), _jsx("option", { value: "AADHAR", children: "AADHAR" }), _jsx("option", { value: "OTHER", children: "OTHER" })] }) }), _jsx(FormField, { label: "Verification Document", error: fieldErrors.document ?? undefined, children: _jsx("input", { type: "file", onChange: e => set("document", e.target.files?.[0] || null) }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: goBack, className: "flex-1 h-12 rounded-xl border border-neutral-border\r\n                         text-sm font-semibold active:scale-[0.98]", children: "Back" }), _jsx("button", { onClick: submit, disabled: loading, className: "flex-1 h-12 rounded-xl bg-primary text-white\r\n                         text-sm font-semibold hover:bg-primary-hover\r\n                         active:bg-primary-active active:scale-[0.98]\r\n                         disabled:opacity-60", children: loading ? "Submitting…" : "Submit" })] })] }))] }));
}
