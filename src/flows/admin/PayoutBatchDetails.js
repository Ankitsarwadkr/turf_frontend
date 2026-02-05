import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBatchDetails, approveBatch, getBatchExecutions } from "../../engine/adminEngine";
import { ChevronLeft, Calendar, DollarSign, Users, CheckCircle, XCircle, Clock, AlertCircle, Loader2, RefreshCw, ChevronRight } from "lucide-react";
export default function PayoutBatchDetails() {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approving, setApproving] = useState(false);
    useEffect(() => {
        if (batchId) {
            fetchData();
        }
    }, [batchId]);
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [batchRes, executionsRes] = await Promise.all([
                getBatchDetails(Number(batchId)),
                getBatchExecutions(Number(batchId))
            ]);
            setBatch(batchRes.data);
            setExecutions(executionsRes.data);
        }
        catch (err) {
            console.error('Failed to fetch batch details:', err);
            setError('Unable to load batch details');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async () => {
        if (!batchId || batch?.status !== 'CREATED')
            return;
        if (!window.confirm('Are you sure you want to approve this batch? This will create payout executions for all owners.')) {
            return;
        }
        setApproving(true);
        try {
            await approveBatch(Number(batchId));
            await fetchData(); // Refresh data
        }
        catch (err) {
            console.error('Failed to approve batch:', err);
            alert(err.response?.data?.message || 'Failed to approve batch');
        }
        finally {
            setApproving(false);
        }
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
    const getExecutionStatusConfig = (status) => {
        const configs = {
            'PENDING': { color: 'text-warning', bg: 'bg-warning/10', text: 'Pending' },
            'PAID': { color: 'text-success', bg: 'bg-success/10', text: 'Paid' },
            'FAILED': { color: 'text-danger', bg: 'bg-danger/10', text: 'Failed' },
        };
        return configs[status] || { color: 'text-text-muted', bg: 'bg-neutral-hover', text: status };
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh] animate-fadeIn", children: _jsx(Loader2, { className: "h-10 w-10 text-primary animate-spin" }) }));
    }
    if (error || !batch) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-danger mb-3" }), _jsx("h3", { className: "text-lg font-medium text-text-primary mb-2", children: "Unable to load batch" }), _jsx("p", { className: "text-text-secondary mb-4", children: error || 'Batch not found' }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate('/app/admin/payouts'), className: "px-4 py-2 border border-neutral-border text-text-secondary rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth", children: "Back to Batches" }), _jsx("button", { onClick: fetchData, className: "px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle", children: "Try Again" })] })] }));
    }
    const statusConfig = getStatusConfig(batch.status);
    const StatusIcon = statusConfig.icon;
    const paidCount = executions.filter(e => e.status === 'PAID').length;
    const failedCount = executions.filter(e => e.status === 'FAILED').length;
    const pendingCount = executions.filter(e => e.status === 'PENDING').length;
    return (_jsxs("div", { className: "space-y-6 animate-slideUp", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => navigate('/app/admin/payouts'), className: "p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth mr-3", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsxs("div", { children: [_jsxs("h1", { className: "text-page-title text-text-primary mb-1", children: ["Batch #", batch.batchId] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color}`, children: [_jsx(StatusIcon, { size: 14 }), statusConfig.label] }), _jsxs("span", { className: "text-sm text-text-secondary", children: ["Created on ", formatDate(batch.createdAt)] })] })] })] }), batch.status === 'CREATED' && (_jsx("button", { onClick: handleApprove, disabled: approving, className: "px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: approving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Approving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { size: 16 }), "Approve Batch"] })) }))] }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Week Period" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center", children: _jsx(Calendar, { size: 18, className: "text-text-primary" }) }), _jsxs("span", { className: "font-medium text-text-primary", children: [formatDate(batch.weekStart), " \u2013 ", formatDate(batch.weekEnd)] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Total Amount" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { size: 18, className: "text-primary" }) }), _jsx("span", { className: "text-xl font-semibold text-text-primary animate-price-float", children: formatCurrency(batch.totalAmount) })] })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Total Owners" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center", children: _jsx(Users, { size: 18, className: "text-text-primary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: batch.totalOwners })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Executions" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-success rounded-full" }), _jsxs("span", { className: "text-sm font-medium text-success", children: [paidCount, " paid"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-warning rounded-full" }), _jsxs("span", { className: "text-sm font-medium text-warning", children: [pendingCount, " pending"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-danger rounded-full" }), _jsxs("span", { className: "text-sm font-medium text-danger", children: [failedCount, " failed"] })] })] })] })] }), _jsxs("div", { className: "bg-neutral-subtle rounded-xl p-4 border border-neutral-border", children: [_jsx("p", { className: "text-sm font-medium text-text-primary mb-2", children: "Status Summary" }), _jsxs("p", { className: "text-sm text-text-secondary leading-relaxed", children: [batch.status === 'CREATED' && 'Batch is ready for approval. Click "Approve Batch" to start payouts.', batch.status === 'APPROVED' && 'Batch is approved. Executions are ready for processing.', batch.status === 'PROCESSING' && 'Batch is currently being processed.', batch.status === 'FAILED' && 'Some executions in this batch have failed.', batch.status === 'COMPLETED' && 'All executions in this batch have been completed.'] })] })] }) }), _jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card", children: [_jsx("div", { className: "p-6 border-b border-neutral-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary", children: "Payout Executions" }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "Individual owner payouts for this batch" })] }), _jsxs("span", { className: "text-sm font-medium text-text-primary", children: [executions.length, " executions"] })] }) }), _jsx("div", { className: "divide-y divide-neutral-border", children: executions.length === 0 ? (_jsxs("div", { className: "p-12 text-center animate-fadeIn", children: [_jsx(Users, { className: "h-16 w-16 text-neutral-border mx-auto mb-4" }), _jsx("p", { className: "text-text-secondary", children: "No executions found for this batch" })] })) : (executions.map((execution) => {
                            const execStatus = getExecutionStatusConfig(execution.status);
                            return (_jsx("div", { onClick: () => navigate(`/app/admin/payouts/executions/${execution.executionId}`), className: "p-6 hover:bg-neutral-hover transition-all duration-250 smooth cursor-pointer group", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: `px-3.5 py-1.5 rounded-full text-xs font-medium ${execStatus.bg} ${execStatus.color}`, children: execStatus.text }), execution.retryCount > 0 && (_jsxs("span", { className: "text-xs text-text-muted", children: [execution.retryCount, " retry", execution.retryCount !== 1 ? 's' : ''] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Owner" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.ownerName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Amount" }), _jsx("p", { className: "font-medium text-text-primary animate-price-float", children: formatCurrency(execution.amount) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Created" }), _jsx("p", { className: "text-sm text-text-primary", children: formatDate(execution.createdAt) })] })] })] }), _jsx(ChevronRight, { className: "text-neutral-border ml-4 group-hover:text-text-primary transition-colors duration-250" })] }) }, execution.executionId));
                        })) })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card", children: [_jsxs("div", { className: "p-6 border-b border-neutral-border", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary", children: "Owner Breakdown" }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "Earnings per owner for this week" })] }), _jsx("div", { className: "p-6", children: _jsx("div", { className: "space-y-3", children: batch.owners.map((owner) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-neutral-subtle rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-neutral-hover rounded-xl flex items-center justify-center", children: _jsx(Users, { size: 20, className: "text-text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: owner.ownerName }), _jsxs("p", { className: "text-sm text-text-secondary", children: ["ID: ", owner.ownerId] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-text-primary animate-price-float", children: formatCurrency(owner.totalAmount) }), _jsxs("p", { className: "text-xs text-text-muted", children: [owner.earnings.length, " earnings"] })] })] }, owner.ownerId))) }) })] })] }));
}
