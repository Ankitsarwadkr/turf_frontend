import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getTurfById, updateTurf } from "../../engine/ownerEngine";
import FormField from "../../components/FormField";
import { useToastStore } from "../../store/toastStore";
import { ChevronLeft } from "lucide-react";
export default function EditTurfPage() {
    const { turfId } = useParams();
    const nav = useNavigate();
    const push = useToastStore(s => s.push);
    const [turf, setTurf] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        getTurfById(Number(turfId)).then(r => {
            setTurf(r.data);
            setForm(r.data);
        });
    }, [turfId]);
    const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(turf), [form, turf]);
    const valid = form &&
        form.name?.length >= 3 &&
        form.city?.length >= 2 &&
        form.address?.length >= 5 &&
        form.turfType?.length >= 2 &&
        (!form.mapUrl || /^https?:\/\//.test(form.mapUrl));
    if (!form)
        return (_jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static", children: _jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Edit Turf" })] }) }), _jsx("div", { className: "w-full max-w-7xl mx-auto p-4 md:p-6", children: _jsx("div", { className: "text-text-secondary text-sm font-medium", children: "Loading\u2026" }) })] }));
    const save = async () => {
        if (!dirty || !valid || saving)
            return;
        setSaving(true);
        try {
            await updateTurf(turf.id, form);
            push("success", "Turf updated successfully");
            nav(-1);
        }
        catch (e) {
            push("error", e.response?.data?.message || "Update failed");
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static", children: _jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Edit Turf" })] }) }), _jsx("div", { className: "w-full max-w-7xl mx-auto p-4 md:p-6", children: _jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card space-y-5", children: [_jsx(FormField, { label: "Turf Name", children: _jsx("input", { value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "Address", children: _jsx("input", { value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "Locality", children: _jsx("input", { value: form.locality, onChange: e => setForm({ ...form, locality: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "City", children: _jsx("input", { value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "Turf Type", children: _jsx("input", { value: form.turfType, onChange: e => setForm({ ...form, turfType: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "Description", children: _jsx("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[100px]" }) }), _jsx(FormField, { label: "Amenities", children: _jsx("input", { value: form.amenities, onChange: e => setForm({ ...form, amenities: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsx(FormField, { label: "Google Map URL", children: _jsx("input", { value: form.mapUrl, onChange: e => setForm({ ...form, mapUrl: e.target.value }), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }) }), _jsxs("div", { className: "flex items-center gap-3 pt-2", children: [_jsx("input", { type: "checkbox", id: "available", checked: form.available, onChange: e => setForm({ ...form, available: e.target.checked }), className: "w-4 h-4 text-primary border-neutral-border rounded focus:ring-2 focus:ring-primary/20" }), _jsx("label", { htmlFor: "available", className: "text-sm text-text-primary font-semibold cursor-pointer", children: "Accept Bookings" })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "border border-neutral-border bg-neutral-surface text-text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]", children: "Cancel" }), _jsx("button", { disabled: !dirty || !valid || saving, onClick: save, className: "bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-subtle hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]", children: saving ? "Saving..." : "Save Changes" })] })] }) })] }));
}
