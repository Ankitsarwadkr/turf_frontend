import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTurfs, deleteTurf } from "../../engine/ownerEngine";
import CreateTurf from "./CreateTurf";
import { Plus } from "lucide-react";
export default function OwnerTurfs() {
    const [rows, setRows] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const nav = useNavigate();
    useEffect(() => {
        getMyTurfs().then(r => setRows(r.data));
    }, []);
    useEffect(() => {
        document.body.style.overflow = openCreate ? "hidden" : "";
    }, [openCreate]);
    const remove = async (id) => {
        if (!confirm("Delete this turf permanently?"))
            return;
        await deleteTurf(id);
        setRows(r => r.filter(x => x.id !== id));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "max-w-6xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-page-title", children: "My Turfs" }), _jsxs("button", { onClick: () => setOpenCreate(true), className: "bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-subtle hover:bg-primary-hover hover:shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2", children: [_jsx(Plus, { size: 18 }), "Add Turf"] })] }), rows.length === 0 && (_jsx("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl p-10 text-center shadow-card", children: _jsx("p", { className: "text-sm text-text-secondary", children: "No turfs yet. Add your first turf to start accepting bookings." }) })), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: rows.map(t => (_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden", children: [t.primaryImage && (_jsx("img", { src: `${t.primaryImage}`, className: "h-36 w-full object-cover border-b border-neutral-border" })), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "text-xs text-text-muted font-medium", children: ["ID #", t.id] }), _jsx("span", { className: `text-xs font-medium px-2 py-1 rounded border ${t.bookingEnabled
                                                        ? "border-green-200 bg-green-50 text-success"
                                                        : "border-red-200 bg-red-50 text-danger"}`, children: t.bookingEnabled ? "ACTIVE" : "INACTIVE" })] }), _jsx("div", { className: "text-sm font-semibold tracking-tight text-text-primary", children: t.name }), _jsxs("div", { className: "text-xs text-text-secondary", children: [t.city, " \u2022 ", t.turfType] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { onClick: () => nav(`/app/owner/turfs/${t.id}`), className: "flex-1 border border-neutral-border bg-neutral-surface text-text-primary rounded-lg py-2 text-xs font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]", children: "Manage" }), _jsx("button", { onClick: () => remove(t.id), className: "flex-1 border border-red-200 bg-red-50 text-danger rounded-lg py-2 text-xs font-medium hover:bg-red-100 hover:border-red-300 transition-all duration-200 active:scale-[0.98]", children: "Delete" })] })] })] }, t.id))) })] }), openCreate && (_jsx(CreateTurf, { onClose: () => setOpenCreate(false), onCreated: () => getMyTurfs().then(r => setRows(r.data)) }))] }));
}
