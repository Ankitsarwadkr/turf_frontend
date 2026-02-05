import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Wallet, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, AlertCircle, History } from "lucide-react";
import { getOwnerBalance, getNextPayout, getPaymentHistory, getWeeklyLedger } from "../../engine/ownerEngine";
export default function OwnerEarnings() {
    const [activeTab, setActiveTab] = useState("pending");
    const [balance, setBalance] = useState(null);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [weeklyLedger, setWeeklyLedger] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    useEffect(() => {
        fetchEarningsData();
    }, []);
    useEffect(() => {
        if (activeTab === "statement" && dateRange.start && dateRange.end) {
            fetchWeeklyLedger();
        }
    }, [activeTab, dateRange.start, dateRange.end]);
    const fetchEarningsData = async () => {
        try {
            setLoading(true);
            const [balanceRes, pendingRes, historyRes] = await Promise.all([
                getOwnerBalance(),
                getNextPayout(),
                getPaymentHistory()
            ]);
            setBalance(balanceRes.data);
            setPendingPayouts(pendingRes.data);
            setPaymentHistory(historyRes.data);
        }
        catch (error) {
            console.error("Failed to fetch earnings data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchWeeklyLedger = async () => {
        if (!dateRange.start || !dateRange.end)
            return;
        try {
            setLedgerLoading(true);
            const res = await getWeeklyLedger(dateRange.start, dateRange.end);
            setWeeklyLedger(res.data);
        }
        catch (error) {
            console.error("Failed to fetch weekly ledger:", error);
        }
        finally {
            setLedgerLoading(false);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatReason = (reason) => {
        return reason
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const ledgerTotals = weeklyLedger?.rows ? {
        totalEarnings: weeklyLedger.rows
            .filter(r => r.type?.toUpperCase() === "CREDIT")
            .reduce((sum, r) => sum + r.amount, 0),
        totalDeductions: weeklyLedger.rows
            .filter(r => r.type?.toUpperCase() === "DEBIT")
            .reduce((sum, r) => sum + Math.abs(r.amount), 0)
    } : { totalEarnings: 0, totalDeductions: 0 };
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-neutral-bg", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border sticky top-0 z-20", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 lg:px-6 py-4", children: _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "My Earnings" }) }) }), _jsx("div", { className: "max-w-7xl mx-auto p-6 flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center animate-fadeIn", children: [_jsx("div", { className: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Loading earnings..." })] }) })] }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-neutral-bg", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border sticky top-0 z-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 lg:px-6 py-4", children: [_jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "My Earnings" }), _jsx("p", { className: "text-sm text-text-secondary font-medium mt-1", children: "Track your bookings earnings and payouts" })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto p-4 lg:p-6 space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-card animate-fadeIn", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Wallet, { size: 24 }), _jsx("span", { className: "text-sm opacity-90 font-medium", children: "Current Balance" })] }), _jsx("p", { className: "text-4xl font-bold mb-4", children: formatCurrency(balance?.balance || 0) }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t border-white/20", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs opacity-75 mb-1 font-medium", children: "Waiting for Payout" }), _jsx("p", { className: "text-lg font-semibold", children: formatCurrency(totalPending) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs opacity-75 mb-1 font-medium", children: "Total Received" }), _jsx("p", { className: "text-lg font-semibold", children: formatCurrency(totalPaid) })] })] })] }), _jsx("div", { className: "bg-primary-subtle border border-primary-light rounded-xl p-4 animate-fadeIn", children: _jsxs("div", { className: "flex gap-3", children: [_jsx(AlertCircle, { className: "text-primary flex-shrink-0 mt-0.5", size: 20 }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-semibold text-primary mb-1", children: "How it works:" }), _jsx("p", { className: "text-primary", children: "Earnings from completed bookings are added to \"Waiting for Payout\". Every week, admin processes payouts and transfers money to your bank account, which then appears in \"Payout History\"." })] })] }) }), _jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl shadow-card", children: [_jsx("div", { className: "border-b border-neutral-border", children: _jsxs("div", { className: "flex", children: [_jsxs("button", { onClick: () => setActiveTab("pending"), className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === "pending"
                                                ? "text-primary border-b-2 border-primary bg-primary-subtle"
                                                : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"}`, children: [_jsx(Clock, { size: 18 }), "Waiting for Payout", pendingPayouts.length > 0 && (_jsx("span", { className: "px-2 py-0.5 bg-warning text-white text-xs rounded-full font-semibold", children: pendingPayouts.length }))] }), _jsxs("button", { onClick: () => setActiveTab("history"), className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === "history"
                                                ? "text-primary border-b-2 border-primary bg-primary-subtle"
                                                : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"}`, children: [_jsx(CheckCircle, { size: 18 }), "Payout History", paymentHistory.length > 0 && (_jsx("span", { className: "px-2 py-0.5 bg-success text-white text-xs rounded-full font-semibold", children: paymentHistory.length }))] }), _jsxs("button", { onClick: () => setActiveTab("statement"), className: `flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === "statement"
                                                ? "text-primary border-b-2 border-primary bg-primary-subtle"
                                                : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"}`, children: [_jsx(History, { size: 18 }), "Statement"] })] }) }), _jsxs("div", { className: "p-6", children: [activeTab === "pending" && (_jsx("div", { className: "space-y-3 animate-fadeIn", children: pendingPayouts.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Clock, { className: "mx-auto text-text-muted mb-3", size: 48 }), _jsx("p", { className: "text-text-secondary font-semibold", children: "No pending earnings" }), _jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: "Your earnings will appear here after bookings are completed" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-4 p-3 bg-warning/10 rounded-xl border border-warning/20", children: _jsxs("p", { className: "text-sm text-warning font-medium", children: [_jsxs("span", { className: "font-bold", children: ["\u20B9", totalPending.toLocaleString()] }), " waiting for next payout cycle"] }) }), pendingPayouts.map((payout, idx) => (_jsxs("div", { className: "flex items-start gap-3 p-4 bg-neutral-bg rounded-xl border border-neutral-border hover:border-warning transition-colors duration-200 animate-scaleIn", children: [_jsx("div", { className: "w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(Clock, { className: "text-warning", size: 20 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-1", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text-primary", children: formatReason(payout.reason) }), _jsxs("p", { className: "text-xs text-text-secondary mt-0.5 font-medium", children: ["Booking #", payout.bookingId.slice(0, 13), "..."] })] }), _jsx("span", { className: "font-bold text-lg text-warning whitespace-nowrap", children: formatCurrency(payout.amount) })] }), _jsxs("p", { className: "text-xs text-text-muted font-medium", children: ["Earned on ", formatDate(payout.earnedAt)] })] })] }, idx)))] })) })), activeTab === "history" && (_jsx("div", { className: "space-y-3 animate-fadeIn", children: paymentHistory.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle, { className: "mx-auto text-text-muted mb-3", size: 48 }), _jsx("p", { className: "text-text-secondary font-semibold", children: "No payout history" }), _jsx("p", { className: "text-sm text-text-muted mt-1 font-medium", children: "Completed payouts will appear here" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-4 p-3 bg-success/10 rounded-xl border border-success/20", children: _jsxs("p", { className: "text-sm text-success font-medium", children: [_jsxs("span", { className: "font-bold", children: ["\u20B9", totalPaid.toLocaleString()] }), " received in ", paymentHistory.length, " payment", paymentHistory.length !== 1 ? 's' : ''] }) }), paymentHistory.map((payment, idx) => (_jsxs("div", { className: "flex items-start gap-3 p-4 bg-neutral-bg rounded-xl border border-neutral-border hover:border-success transition-colors duration-200 animate-scaleIn", children: [_jsx("div", { className: "w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(CheckCircle, { className: "text-success", size: 20 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-1", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text-primary", children: "Payment Received" }), _jsxs("p", { className: "text-xs text-text-secondary mt-0.5 font-medium", children: ["Reference: ", payment.reference] })] }), _jsx("span", { className: "font-bold text-lg text-success whitespace-nowrap", children: formatCurrency(payment.amount) })] }), _jsxs("p", { className: "text-xs text-text-muted font-medium", children: ["Paid on ", formatDate(payment.paidAt)] })] })] }, idx)))] })) })), activeTab === "statement" && (_jsxs("div", { className: "space-y-4 animate-fadeIn", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs font-semibold text-text-secondary mb-2", children: "From Date" }), _jsx("input", { type: "date", value: dateRange.start, onChange: e => setDateRange(prev => ({ ...prev, start: e.target.value })), className: "w-full px-4 py-2.5 border border-neutral-border bg-neutral-surface text-text-primary rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-xs font-semibold text-text-secondary mb-2", children: "To Date" }), _jsx("input", { type: "date", value: dateRange.end, onChange: e => setDateRange(prev => ({ ...prev, end: e.target.value })), className: "w-full px-4 py-2.5 border border-neutral-border bg-neutral-surface text-text-primary rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" })] })] }), ledgerLoading ? (_jsxs("div", { className: "py-12 text-center", children: [_jsx("div", { className: "w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" }), _jsx("p", { className: "text-sm text-text-secondary font-medium", children: "Loading statement..." })] })) : weeklyLedger ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-neutral-bg rounded-xl p-5 border border-neutral-border", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-2 font-semibold", children: "Opening" }), _jsx("p", { className: "text-lg font-bold text-text-primary", children: formatCurrency(weeklyLedger.openingBalance || 0) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-2 font-semibold", children: "+ Earnings" }), _jsx("p", { className: "text-lg font-bold text-success", children: formatCurrency(ledgerTotals.totalEarnings) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-2 font-semibold", children: "- Deductions" }), _jsx("p", { className: "text-lg font-bold text-danger", children: formatCurrency(ledgerTotals.totalDeductions) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-2 font-semibold", children: "Closing" }), _jsx("p", { className: "text-lg font-bold text-text-primary", children: formatCurrency(weeklyLedger.closingBalance || 0) })] })] }) }), _jsx("div", { className: "space-y-2", children: !weeklyLedger.rows || weeklyLedger.rows.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(History, { className: "mx-auto text-text-muted mb-3", size: 48 }), _jsx("p", { className: "text-text-secondary font-semibold", children: "No transactions in this period" })] })) : (weeklyLedger.rows.map((row, idx) => (_jsxs("div", { className: "flex items-start gap-3 p-3 bg-neutral-bg rounded-xl border border-neutral-border hover:border-primary transition-all duration-200 animate-scaleIn", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${row.type?.toUpperCase() === "CREDIT" ? "bg-success/10" : "bg-danger/10"}`, children: row.type?.toUpperCase() === "CREDIT" ? (_jsx(ArrowUpRight, { className: "text-success", size: 20 })) : (_jsx(ArrowDownRight, { className: "text-danger", size: 20 })) }), _jsx("div", { className: "flex-1 min-w-0", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-text-primary", children: formatReason(row.reason) }), _jsxs("p", { className: "text-xs text-text-secondary mt-0.5 font-medium", children: ["Booking #", row.bookingId.slice(0, 8), "... \u2022 Ref: ", row.reference.slice(0, 8), "..."] }), _jsx("p", { className: "text-xs text-text-muted mt-1 font-medium", children: formatDateTime(row.date) })] }), _jsxs("span", { className: `font-bold text-lg whitespace-nowrap ${row.type?.toUpperCase() === "CREDIT" ? "text-success" : "text-danger"}`, children: [row.type?.toUpperCase() === "CREDIT" ? "+" : "-", formatCurrency(Math.abs(row.amount))] })] }) })] }, idx)))) })] })) : null] }))] })] })] })] }));
}
