import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// pages/CustomerDashboard.tsx
import { useEffect, useState } from "react";
import { getPublicTurfs } from "../../engine/customerEngine";
import TurfCard, { TurfCardSkeleton } from "../../components/TurfCard";
import { useNavigate } from "react-router-dom";
export default function CustomerDashboard() {
    const [turfs, setTurfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const nav = useNavigate();
    useEffect(() => {
        getPublicTurfs()
            .then(r => {
            setTurfs(r.data);
            setLoading(false);
        })
            .catch(err => {
            setError("Failed to load turfs");
            setLoading(false);
            console.error(err);
        });
    }, []);
    // Filter turfs based on search query
    const filteredTurfs = turfs.filter(turf => turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.shortAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    // Smart message based on what was searched
    const getEmptyMessage = () => {
        if (!searchQuery)
            return "No turfs available at the moment";
        // Check if search query matches any city in the full list
        const matchesCity = turfs.some(turf => turf.city.toLowerCase().includes(searchQuery.toLowerCase()));
        if (matchesCity) {
            return `No available turfs in ${searchQuery}`;
        }
        return `No turfs found matching "${searchQuery}"`;
    };
    return (_jsxs("div", { className: "p-4 md:p-6 space-y-6 md:space-y-8 max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-page-title", children: searchQuery ? "Search Results" : "Browse Turfs" }), !loading && turfs.length > 0 && !searchQuery && (_jsxs("span", { className: "text-xs text-text-muted font-medium", children: [turfs.length, " turfs available"] }))] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Search by name, city, or location...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full px-4 py-2.5 pl-11 text-sm border border-neutral-border rounded-lg bg-neutral-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }), _jsx("svg", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(""), className: "absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary hover:bg-neutral-hover rounded-lg transition-all duration-200 active:scale-95", "aria-label": "Clear search", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), _jsx("div", { className: "grid grid-cols-1 gap-4", children: loading ? (Array.from({ length: 3 }).map((_, i) => _jsx(TurfCardSkeleton, {}, i))) : error ? (_jsx("div", { className: "text-center py-10 text-danger text-sm font-medium", children: error })) : filteredTurfs.length === 0 ? (_jsxs("div", { className: "text-center py-16 md:py-20 bg-neutral-surface rounded-xl border border-neutral-border shadow-card", children: [_jsx("svg", { className: "w-16 h-16 mx-auto text-text-muted mb-4 opacity-50", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("p", { className: "text-text-secondary text-sm font-medium mb-1", children: getEmptyMessage() }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(""), className: "mt-4 text-primary hover:text-primary-hover text-sm font-medium transition-colors duration-200 active:scale-95", children: "Clear search and view all turfs" }))] })) : (_jsxs(_Fragment, { children: [searchQuery && (_jsxs("div", { className: "text-sm text-text-secondary px-1 font-medium", children: ["Found ", filteredTurfs.length, " turf", filteredTurfs.length !== 1 ? 's' : '', " matching \"", searchQuery, "\""] })), filteredTurfs.map(t => (_jsx(TurfCard, { turf: t, onClick: () => nav(`/app/customer/turfs/${t.id}`) }, t.id)))] })) })] }));
}
