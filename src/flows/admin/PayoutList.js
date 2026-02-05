import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPayoutBatches } from "../../engine/adminEngine";
import { Calendar, DollarSign, Users, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Loader2, ChevronRight } from "lucide-react";
const getStatusConfig = (status) => {
    const configs = {
        'CREATED': {
            color: 'text-text-muted',
            bg: 'bg-neutral-hover',
            icon: Clock,
            label: 'Created'
        },
        'APPROVED': {
            color: 'text-primary',
            bg: 'bg-primary-light',
            icon: CheckCircle,
            label: 'Approved'
        },
        'PROCESSING': {
            color: 'text-warning',
            bg: 'bg-warning/10',
            icon: RefreshCw,
            label: 'Processing'
        },
        'FAILED': {
            color: 'text-danger',
            bg: 'bg-danger/10',
            icon: XCircle,
            label: 'Failed'
        },
        'COMPLETED': {
            color: 'text-success',
            bg: 'bg-success/10',
            icon: CheckCircle,
            label: 'Completed'
        },
    };
    return configs[status] || {
        color: 'text-text-muted',
        bg: 'bg-neutral-hover',
        icon: Clock,
        label: status
    };
};
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
export default function AdminPayoutsList() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        fetchBatches();
    }, []);
    const fetchBatches = async () => {
        const isLoading = batches.length === 0;
        if (!isLoading)
            setRefreshing(true);
        setError(null);
        try {
            const response = await getPayoutBatches();
            setBatches(response.data);
        }
        catch (err) {
            console.error('Failed to fetch payout batches:', err);
            setError('Unable to load payout batches');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const filteredBatches = selectedStatus === 'all'
        ? batches
        : batches.filter(batch => batch.status === selectedStatus);
    const statusOptions = [
        { value: 'all', label: 'All Batches' },
        { value: 'CREATED', label: 'Created' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'COMPLETED', label: 'Completed' },
    ];
    const stats = {
        totalAmount: batches.reduce((sum, batch) => sum + batch.totalAmount, 0),
        totalBatches: batches.length,
        pendingBatches: batches.filter(b => b.status === 'CREATED').length,
        failedBatches: batches.filter(b => b.status === 'FAILED').length,
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsx(Loader2, { className: "h-10 w-10 text-primary animate-spin" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-danger mb-3" }), _jsx("h3", { className: "text-lg font-medium text-text-primary mb-2", children: "Unable to load batches" }), _jsx("p", { className: "text-text-secondary mb-4", children: error }), _jsx("button", { onClick: fetchBatches, className: "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle", children: "Try Again" })] }));
    }
    return (_jsxs("div", { className: "space-y-6 animate-slideUp", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-page-title text-text-primary mb-1", children: "Payout Batches" }), _jsx("p", { className: "text-text-secondary", children: "Manage weekly owner payouts" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("button", { onClick: fetchBatches, disabled: refreshing, className: `p-2.5 border border-neutral-border rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`, children: _jsx(RefreshCw, { size: 18, className: `text-text-secondary ${refreshing ? 'animate-spin' : ''}` }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center", children: _jsx(DollarSign, { className: "text-primary", size: 22 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary", children: "Total Amount" }), _jsx("p", { className: "text-xl font-semibold text-text-primary animate-price-float", children: formatCurrency(stats.totalAmount) })] })] }) }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-neutral-hover rounded-xl flex items-center justify-center", children: _jsx(Calendar, { className: "text-text-primary", size: 22 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary", children: "Total Batches" }), _jsx("p", { className: "text-xl font-semibold text-text-primary", children: stats.totalBatches })] })] }) }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center", children: _jsx(Clock, { className: "text-warning", size: 22 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary", children: "Pending" }), _jsx("p", { className: "text-xl font-semibold text-text-primary", children: stats.pendingBatches })] })] }) }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center", children: _jsx(AlertCircle, { className: "text-danger", size: 22 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary", children: "Failed" }), _jsx("p", { className: "text-xl font-semibold text-text-primary", children: stats.failedBatches })] })] }) })] }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-4 shadow-subtle", children: _jsx("div", { className: "flex flex-wrap gap-2", children: statusOptions.map((option) => (_jsx("button", { onClick: () => setSelectedStatus(option.value), className: `
                px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 smooth
                ${selectedStatus === option.value
                            ? 'bg-primary text-white shadow-subtle'
                            : 'bg-neutral-hover text-text-secondary hover:text-text-primary hover:bg-neutral-hover/80'}
              `, children: option.label }, option.value))) }) }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card", children: filteredBatches.length === 0 ? (_jsxs("div", { className: "p-12 text-center animate-fadeIn", children: [_jsx(Calendar, { className: "h-16 w-16 text-neutral-border mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-text-primary mb-2", children: "No batches found" }), _jsx("p", { className: "text-text-secondary", children: selectedStatus === 'all'
                                ? 'No payout batches have been created yet'
                                : `No ${selectedStatus.toLowerCase()} batches found` })] })) : (_jsx("div", { className: "divide-y divide-neutral-border", children: filteredBatches.map((batch) => {
                        const statusConfig = getStatusConfig(batch.status);
                        const StatusIcon = statusConfig.icon;
                        return (_jsx("div", { onClick: () => navigate(`/app/admin/payouts/${batch.batchId}`), className: "p-6 hover:bg-neutral-hover transition-all duration-250 smooth cursor-pointer group", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsxs("span", { className: `px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color}`, children: [_jsx(StatusIcon, { size: 12 }), statusConfig.label] }), _jsxs("span", { className: "text-sm text-text-muted", children: ["Batch #", batch.batchId] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Week Period" }), _jsxs("p", { className: "font-medium text-text-primary", children: [formatDate(batch.weekStart), " \u2013 ", formatDate(batch.weekEnd)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Amount" }), _jsx("p", { className: "font-medium text-text-primary animate-price-float", children: formatCurrency(batch.totalAmount) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Owners" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { size: 16, className: "text-text-muted" }), _jsx("span", { className: "font-medium text-text-primary", children: batch.totalOwners })] })] })] })] }), _jsx(ChevronRight, { className: "text-neutral-border ml-4 group-hover:text-text-primary transition-colors duration-250" })] }) }, batch.batchId));
                    }) })) })] }));
}
