import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { addTurf } from "../../engine/ownerEngine";
import FormField from "../../components/FormField";
import { validateTurfForm } from "../../shared/validators";
import { useToastStore } from "../../store/toastStore";
import { X } from "lucide-react";
export default function CreateTurf({ onClose, onCreated }) {
    const push = useToastStore(s => s.push);
    const [form, setForm] = useState({
        name: "", address: "", locality: "", mapUrl: "", city: "",
        description: "", amenities: "", turfType: "", available: true
    });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const submit = async () => {
        const e = validateTurfForm({ ...form, images });
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("address", form.address);
        fd.append("locality", form.locality);
        fd.append("mapUrl", form.mapUrl);
        fd.append("city", form.city);
        fd.append("description", form.description);
        fd.append("amenities", form.amenities);
        fd.append("turfType", form.turfType);
        fd.append("available", form.available ? "1" : "0");
        images.forEach(i => fd.append("images", i));
        setLoading(true);
        try {
            await addTurf(fd);
            push("success", "Turf added successfully");
            setTimeout(() => {
                onCreated();
                onClose();
            }, 800);
        }
        catch (err) {
            push("error", err.response?.data?.message || "Create failed");
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] grid place-items-center p-4", children: _jsxs("div", { className: "bg-neutral-surface border border-neutral-border w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl shadow-premium animate-scaleIn", children: [_jsxs("div", { className: "px-5 py-4 border-b border-neutral-border flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary", children: "Create Turf" }), _jsx("button", { onClick: onClose, className: "p-2 bg-neutral-hover rounded-lg text-text-muted hover:text-text-primary hover:bg-neutral-border transition-all duration-200 active:scale-95", children: _jsx(X, { size: 18 }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-5 space-y-4", children: [[
                            ["name", "Turf Name"], ["address", "Address"], ["locality", "Locality"],
                            ["mapUrl", "Google Map URL"], ["city", "City"], ["turfType", "Turf Type"],
                            ["amenities", "Amenities"]
                        ].map(([k, label]) => (_jsx(FormField, { label: label, error: errors[k], children: _jsx("input", { className: "w-full border border-neutral-border bg-neutral-surface text-text-primary placeholder:text-text-muted px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200", value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) }) }, k))), _jsx(FormField, { label: "Description", children: _jsx("textarea", { className: "w-full border border-neutral-border bg-neutral-surface text-text-primary placeholder:text-text-muted px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[100px]", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }) }) }), _jsx(FormField, { label: "Images", error: errors.images, children: _jsx("input", { type: "file", multiple: true, accept: "image/*", className: "w-full border border-neutral-border bg-neutral-surface text-text-primary text-sm px-4 py-2.5 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer transition-all duration-200", onChange: e => {
                                    const files = Array.from(e.target.files || []);
                                    setImages(prev => [...prev, ...files]);
                                    e.target.value = "";
                                } }) }), images.length > 0 && (_jsx("div", { className: "grid grid-cols-4 gap-3", children: images.map((img, i) => (_jsxs("div", { className: "relative group", children: [_jsx("img", { src: URL.createObjectURL(img), className: "h-20 w-full object-cover rounded-lg border border-neutral-border" }), _jsx("button", { onClick: () => setImages(x => x.filter((_, ix) => ix !== i)), className: "absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-95", children: "\u2715" })] }, i))) }))] }), _jsxs("div", { className: "border-t border-neutral-border px-5 py-4 flex justify-end gap-3 bg-neutral-surface", children: [_jsx("button", { onClick: onClose, className: "border border-neutral-border bg-neutral-surface text-text-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]", children: "Cancel" }), _jsx("button", { disabled: loading, onClick: submit, className: "bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-subtle hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]", children: loading ? "Saving..." : "Create" })] })] }) }));
}
