import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchPendingOwners, approveOwner, rejectOwner } from "../../engine/adminEngine";
export default function OwnerApprovals() {
    const [owners, setOwners] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [reasons, setReasons] = useState({});
    const [confirm, setConfirm] = useState({ type: null, id: null });
    useEffect(() => {
        fetchPendingOwners().then(r => setOwners(r.data));
    }, []);
    const openApprove = (id) => {
        setConfirm({ type: "approve", id });
    };
    const openReject = (id) => {
        setConfirm({ type: "reject", id });
    };
    const execute = async () => {
        const id = confirm.id;
        const type = confirm.type;
        if (type === "reject" && !reasons[id]?.trim()) {
            alert("Rejection reason is required");
            return;
        }
        setProcessingId(id);
        if (type === "approve") {
            await approveOwner(id);
        }
        else {
            await rejectOwner(id, reasons[id]);
        }
        setOwners(o => o.filter(x => x.id !== id));
        setReasons(r => ({ ...r, [id]: "" }));
        setConfirm({ type: null, id: null });
        setProcessingId(null);
    };
    return (_jsxs("div", { className: "p-4 animate-slideUp", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-page-title text-text-primary mb-2", children: "Pending Owner Approvals" }), _jsx("p", { className: "text-text-secondary", children: "Review and approve new owner registrations" })] }), owners.length > 0 && (_jsx("div", { className: "mb-6 bg-white rounded-xl p-4 shadow-subtle border border-neutral-border", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "px-3 py-1.5 bg-primary-light text-primary rounded-lg font-medium", children: [owners.length, " pending ", owners.length === 1 ? 'owner' : 'owners'] }), _jsx("div", { className: "text-text-muted text-sm", children: "Requires your attention" })] }) })), _jsxs("div", { className: "bg-white rounded-2xl overflow-hidden shadow-card border border-neutral-border", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-neutral-subtle border-b border-neutral-border", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Owner" }), _jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Contact" }), _jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Subscription" }), _jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Documents" }), _jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Reject Reason" }), _jsx("th", { className: "p-4 text-left font-semibold text-text-primary", children: "Actions" })] }) }), _jsx("tbody", { children: owners.map(o => (_jsxs("tr", { className: "border-b border-neutral-border last:border-b-0 hover:bg-neutral-hover/50 transition-colors duration-250", children: [_jsxs("td", { className: "p-4", children: [_jsx("div", { className: "font-medium text-text-primary", children: o.name }), _jsx("div", { className: "text-text-secondary text-xs mt-1", children: o.email })] }), _jsx("td", { className: "p-4", children: _jsx("div", { className: "text-text-primary", children: o.mobileNo }) }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold text-text-primary animate-price-float", children: ["\u20B9", o.subscriptionAmount] }), _jsx("span", { className: "text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full", children: "Annual" })] }) }), _jsx("td", { className: "p-4", children: _jsx("div", { className: "flex flex-col gap-1", children: o.documents.map((d, index) => (_jsxs("a", { href: `http://localhost:8080${d.filePath}`, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:text-primary-hover underline underline-offset-2 text-sm transition-colors duration-250", children: ["Document ", index + 1] }, d.filePath))) }) }), _jsx("td", { className: "p-4", children: _jsx("input", { value: reasons[o.id] || "", onChange: e => setReasons(r => ({ ...r, [o.id]: e.target.value })), placeholder: "Enter reason if rejecting", className: "w-full border border-neutral-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-250" }) }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { disabled: processingId === o.id, onClick: () => openApprove(o.id), className: `
                        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-250
                        ${processingId === o.id
                                                            ? 'bg-primary/50 text-white cursor-not-allowed'
                                                            : 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-subtle hover:shadow-card'}
                      `, children: processingId === o.id ? 'Processing...' : 'Approve' }), _jsx("button", { disabled: processingId === o.id, onClick: () => openReject(o.id), className: `
                        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-250
                        ${processingId === o.id
                                                            ? 'bg-text-muted/50 text-white cursor-not-allowed'
                                                            : 'border border-neutral-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/5'}
                      `, children: "Reject" })] }) })] }, o.id))) })] }), owners.length === 0 && (_jsxs("div", { className: "p-12 text-center", children: [_jsx("div", { className: "text-text-muted mb-2", children: "No pending owner approvals" }), _jsx("div", { className: "text-text-secondary text-sm", children: "All registrations have been processed" })] }))] }), confirm.type && (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-premium animate-scaleIn", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "font-semibold text-lg text-text-primary mb-1", children: confirm.type === "approve" ? "Approve Owner?" : "Reject Owner?" }), _jsx("p", { className: "text-text-secondary text-sm", children: confirm.type === "approve"
                                        ? "This will grant full dashboard access to the owner."
                                        : "This action cannot be undone. Owner will be notified of rejection." })] }), confirm.type === "reject" && reasons[confirm.id]?.trim() && (_jsxs("div", { className: "mb-4 p-3 bg-danger/5 border border-danger/20 rounded-lg", children: [_jsx("div", { className: "text-danger text-sm font-medium", children: "Reason for rejection:" }), _jsx("div", { className: "text-text-secondary text-sm mt-1", children: reasons[confirm.id] })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-neutral-border", children: [_jsx("button", { onClick: () => setConfirm({ type: null, id: null }), className: "px-4 py-2 border border-neutral-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-neutral-hover transition-all duration-250", children: "Cancel" }), _jsx("button", { onClick: execute, className: `
                  px-4 py-2 rounded-lg font-medium text-white transition-all duration-250
                  ${confirm.type === "approve"
                                        ? 'bg-primary hover:bg-primary-hover shadow-subtle'
                                        : 'bg-danger hover:bg-danger/90'}
                `, children: confirm.type === "approve" ? 'Approve Owner' : 'Reject Owner' })] })] }) }))] }));
}
