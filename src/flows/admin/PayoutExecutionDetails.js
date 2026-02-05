import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExecutionDetails, markExecutionPaid, markExecutionFailed, retryExecution } from "../../engine/adminEngine";
import { ChevronLeft, DollarSign, User, CheckCircle, XCircle, Clock, AlertCircle, Loader2, RefreshCw, CreditCard, AlertTriangle, History as HistoryIcon } from "lucide-react";
export default function PayoutExecutionDetails() {
    const { executionId } = useParams();
    const navigate = useNavigate();
    const [execution, setExecution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPaidForm, setShowPaidForm] = useState(false);
    const [showFailedForm, setShowFailedForm] = useState(false);
    const [showRetryForm, setShowRetryForm] = useState(false);
    const [paymentRef, setPaymentRef] = useState('');
    const [failureCode, setFailureCode] = useState('');
    const [failureReason, setFailureReason] = useState('');
    const [retryNote, setRetryNote] = useState('');
    useEffect(() => {
        if (executionId) {
            fetchExecution();
        }
    }, [executionId]);
    const fetchExecution = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getExecutionDetails(Number(executionId));
            setExecution(response.data);
        }
        catch (err) {
            console.error('Failed to fetch execution:', err);
            setError('Unable to load execution details');
        }
        finally {
            setLoading(false);
        }
    };
    const handleMarkPaid = async () => {
        if (!executionId || !paymentRef.trim()) {
            alert('Please enter a payment reference');
            return;
        }
        setActionLoading(true);
        try {
            await markExecutionPaid(Number(executionId), paymentRef);
            await fetchExecution();
            setShowPaidForm(false);
            setPaymentRef('');
            alert('Payment marked as completed successfully');
        }
        catch (err) {
            console.error('Failed to mark as paid:', err);
            alert(err.response?.data?.message || 'Failed to mark as paid');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleMarkFailed = async () => {
        if (!executionId || !failureCode.trim() || !failureReason.trim()) {
            alert('Please provide both failure code and reason');
            return;
        }
        setActionLoading(true);
        try {
            await markExecutionFailed(Number(executionId), failureCode, failureReason);
            await fetchExecution();
            setShowFailedForm(false);
            setFailureCode('');
            setFailureReason('');
            alert('Execution marked as failed successfully');
        }
        catch (err) {
            console.error('Failed to mark as failed:', err);
            alert(err.response?.data?.message || 'Failed to mark as failed');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleRetry = async () => {
        if (!executionId)
            return;
        setActionLoading(true);
        try {
            await retryExecution(Number(executionId), retryNote || 'Retry requested');
            await fetchExecution();
            setShowRetryForm(false);
            setRetryNote('');
            alert('Execution retry initiated successfully');
        }
        catch (err) {
            console.error('Failed to retry:', err);
            alert(err.response?.data?.message || 'Failed to retry execution');
        }
        finally {
            setActionLoading(false);
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
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsx(Loader2, { className: "h-10 w-10 text-primary animate-spin" }) }));
    }
    if (error || !execution) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-danger mb-3" }), _jsx("h3", { className: "text-lg font-medium text-text-primary mb-2", children: "Unable to load execution" }), _jsx("p", { className: "text-text-secondary mb-4", children: error || 'Execution not found' }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate(`/app/admin/payouts/${execution?.batchId}`), className: "px-4 py-2 border border-neutral-border text-text-secondary rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth", children: "Back to Batch" }), _jsx("button", { onClick: fetchExecution, className: "px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle", children: "Try Again" })] })] }));
    }
    const canMarkPaid = execution.status === 'PENDING';
    const canMarkFailed = execution.status === 'PENDING';
    const canRetry = execution.status === 'FAILED' && execution.retryCount < 3;
    return (_jsxs("div", { className: "space-y-6 max-w-4xl mx-auto animate-slideUp", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => navigate(`/app/admin/payouts/${execution.batchId}`), className: "p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth mr-3", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsxs("div", { children: [_jsxs("h1", { className: "text-page-title text-text-primary mb-1", children: ["Execution #", execution.executionId] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-3.5 py-1.5 rounded-full text-sm font-medium ${execution.status === 'PAID' ? 'bg-success/10 text-success' :
                                                    execution.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                                                        'bg-warning/10 text-warning'}`, children: execution.status }), _jsxs("span", { className: "text-sm text-text-secondary", children: ["Batch #", execution.batchId, " \u2022 Created ", formatDateTime(execution.createdAt)] })] })] })] }), _jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: fetchExecution, className: "p-2.5 border border-neutral-border rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth", title: "Refresh", children: _jsx(RefreshCw, { size: 18, className: "text-text-secondary" }) }) })] }), _jsx("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Owner" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center", children: _jsx(User, { size: 18, className: "text-text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: execution.ownerName }), _jsxs("p", { className: "text-sm text-text-secondary", children: ["ID: ", execution.ownerId] })] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Amount" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { size: 18, className: "text-primary" }) }), _jsx("span", { className: "text-2xl font-bold text-text-primary animate-price-float", children: formatCurrency(execution.amount) })] })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Retry Count" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center", children: _jsx(RefreshCw, { size: 18, className: "text-text-primary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: execution.retryCount })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Last Activity" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center", children: _jsx(Clock, { size: 18, className: "text-text-primary" }) }), _jsx("span", { className: "font-medium text-text-primary", children: formatDateTime(execution.lastActivity) })] })] })] })] }) }), _jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Actions" }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [canMarkPaid && (_jsxs("button", { onClick: () => setShowPaidForm(true), className: "px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16 }), "Mark as Paid"] })), canMarkFailed && (_jsxs("button", { onClick: () => setShowFailedForm(true), className: "px-4 py-2.5 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-all duration-250 smooth shadow-subtle flex items-center gap-2", children: [_jsx(XCircle, { size: 16 }), "Mark as Failed"] })), canRetry && (_jsxs("button", { onClick: () => setShowRetryForm(true), className: "px-4 py-2.5 bg-warning text-white rounded-xl font-medium hover:bg-warning/90 transition-all duration-250 smooth shadow-subtle flex items-center gap-2", children: [_jsx(RefreshCw, { size: 16 }), "Retry Execution"] })), !canMarkPaid && !canMarkFailed && !canRetry && (_jsx("p", { className: "text-text-muted italic", children: "No actions available for current status" }))] }), showPaidForm && (_jsxs("div", { className: "mt-6 p-5 bg-primary-light/30 rounded-xl border border-primary/20 animate-scaleIn", children: [_jsxs("h3", { className: "font-medium text-text-primary mb-3 flex items-center gap-2", children: [_jsx(CreditCard, { size: 16, className: "text-primary" }), "Mark as Paid"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Payment Reference" }), _jsx("input", { type: "text", value: paymentRef, onChange: (e) => setPaymentRef(e.target.value), placeholder: "Enter UTR/Transaction ID", className: "w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-250 smooth" }), _jsx("p", { className: "text-xs text-text-secondary mt-2", children: "Enter the bank transaction reference or UTR number" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleMarkPaid, disabled: actionLoading || !paymentRef.trim(), className: "px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed", children: actionLoading ? 'Processing...' : 'Confirm Paid' }), _jsx("button", { onClick: () => setShowPaidForm(false), className: "px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth", children: "Cancel" })] })] })] })), showFailedForm && (_jsxs("div", { className: "mt-6 p-5 bg-danger/5 rounded-xl border border-danger/20 animate-scaleIn", children: [_jsxs("h3", { className: "font-medium text-text-primary mb-3 flex items-center gap-2", children: [_jsx(AlertTriangle, { size: 16, className: "text-danger" }), "Mark as Failed"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Failure Code" }), _jsx("input", { type: "text", value: failureCode, onChange: (e) => setFailureCode(e.target.value), placeholder: "e.g., BANK_ERROR, INVALID_ACCOUNT", className: "w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all duration-250 smooth" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Failure Reason" }), _jsx("textarea", { value: failureReason, onChange: (e) => setFailureReason(e.target.value), placeholder: "Describe why the payment failed", rows: 3, className: "w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all duration-250 smooth" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleMarkFailed, disabled: actionLoading || !failureCode.trim() || !failureReason.trim(), className: "px-4 py-2.5 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed", children: actionLoading ? 'Processing...' : 'Confirm Failed' }), _jsx("button", { onClick: () => setShowFailedForm(false), className: "px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth", children: "Cancel" })] })] })] })), showRetryForm && (_jsxs("div", { className: "mt-6 p-5 bg-warning/5 rounded-xl border border-warning/20 animate-scaleIn", children: [_jsxs("h3", { className: "font-medium text-text-primary mb-3 flex items-center gap-2", children: [_jsx(RefreshCw, { size: 16, className: "text-warning" }), "Retry Execution"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-primary mb-2", children: "Retry Note (Optional)" }), _jsx("textarea", { value: retryNote, onChange: (e) => setRetryNote(e.target.value), placeholder: "Add any notes about this retry attempt", rows: 2, className: "w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning transition-all duration-250 smooth" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleRetry, disabled: actionLoading, className: "px-4 py-2.5 bg-warning text-white rounded-xl font-medium hover:bg-warning/90 transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed", children: actionLoading ? 'Processing...' : 'Start Retry' }), _jsx("button", { onClick: () => setShowRetryForm(false), className: "px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth", children: "Cancel" })] })] })] }))] }), execution.status === 'PAID' && (_jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Payment Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Payment Reference" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.paymentReference })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Paid At" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.paidAt ? formatDateTime(execution.paidAt) : 'N/A' })] })] })] })), execution.status === 'FAILED' && (_jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Failure Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Failure Code" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.failureCode || 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Failure Reason" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.failureReason || 'N/A' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Failed At" }), _jsx("p", { className: "font-medium text-text-primary", children: execution.failedAt ? formatDateTime(execution.failedAt) : 'N/A' })] })] })] })), execution.failureHistory && execution.failureHistory.length > 0 && (_jsxs("div", { className: "bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn", children: [_jsxs("h2", { className: "text-lg font-semibold text-text-primary mb-4 flex items-center gap-2", children: [_jsx(HistoryIcon, { size: 18, className: "text-text-primary" }), "Failure History"] }), _jsx("div", { className: "space-y-3", children: execution.failureHistory.map((failure, index) => (_jsxs("div", { className: "p-4 bg-neutral-subtle rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-medium text-text-primary", children: ["Attempt #", failure.attemptNumber] }), _jsx("span", { className: "px-2 py-1 bg-danger/10 text-danger text-xs font-medium rounded-lg", children: failure.failureCode })] }), _jsx("span", { className: "text-xs text-text-secondary", children: formatDateTime(failure.failedAt) })] }), _jsx("p", { className: "text-sm text-text-secondary", children: failure.failureReason })] }, index))) })] }))] }));
}
