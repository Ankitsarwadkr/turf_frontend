import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, Home, HelpCircle, Mail, Phone } from "lucide-react";
export default function PaymentFailed() {
    const location = useLocation();
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);
    const { bookingId, message, errorType } = location.state || {};
    // Redirect if accessed directly without error context
    useEffect(() => {
        if (!location.state) {
            navigate('/app/customer', { replace: true });
        }
    }, [location.state, navigate]);
    // Trigger animation on mount
    useEffect(() => {
        setTimeout(() => setAnimate(true), 100);
    }, []);
    // Determine user-friendly message
    const getUserMessage = () => {
        if (errorType === 'VERIFICATION_FAILED') {
            return 'Payment verification failed. Please contact support.';
        }
        if (errorType === 'PAYMENT_TIMEOUT') {
            return 'Payment timed out. Please try booking again.';
        }
        return message || 'Payment could not be completed';
    };
    // Determine detailed explanation
    const getDetailedExplanation = () => {
        if (errorType === 'VERIFICATION_FAILED') {
            return 'The payment gateway could not verify your transaction. If money was deducted, it will be refunded within 5-7 working days.';
        }
        return 'Your payment was not successful. The booking slots have been released and are available for others to book.';
    };
    // Don't render if no state (will redirect)
    if (!location.state) {
        return null;
    }
    return (_jsx("div", { className: "min-h-screen bg-neutral-bg px-4 py-8", children: _jsxs("div", { className: "max-w-md mx-auto", children: [_jsxs("div", { className: `bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden mb-6 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`, children: [_jsxs("div", { className: "bg-gradient-to-r from-danger to-danger/90 p-8 text-center", children: [_jsx("div", { className: `w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${animate ? 'scale-100' : 'scale-0'}`, children: _jsx(XCircle, { className: "h-10 w-10 text-white" }) }), _jsx("h1", { className: "text-page-title font-semibold tracking-tight text-white mb-2", children: "Payment Failed" }), _jsx("p", { className: "text-white/90 text-sm", children: getUserMessage() })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(HelpCircle, { className: "h-5 w-5 text-danger flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-danger mb-1", children: "What happened?" }), _jsx("p", { className: "text-sm text-text-secondary", children: getDetailedExplanation() })] })] }) }), bookingId && (_jsxs("div", { className: "bg-neutral-hover rounded-lg p-4 mb-6 border border-neutral-border", children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Booking Reference" }), _jsx("p", { className: "font-mono font-semibold text-text-primary text-sm", children: bookingId }), _jsx("p", { className: "text-xs text-text-muted mt-2", children: "Keep this ID handy when contacting support" })] })), _jsx("div", { className: "bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6", children: _jsx("p", { className: "text-sm text-text-secondary", children: "\uD83D\uDCB3 If any amount was deducted, it will be automatically refunded to your source account within 5-7 working days." }) }), _jsxs("div", { className: "border-t border-neutral-border pt-4", children: [_jsx("p", { className: "text-sm font-medium text-text-primary mb-3", children: "Need help?" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("a", { href: "mailto:support@turfera.com", className: "flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200", children: [_jsx(Mail, { size: 16, className: "text-text-muted" }), _jsx("span", { children: "support@turfera.com" })] }), _jsxs("a", { href: "tel:+911234567890", className: "flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200", children: [_jsx(Phone, { size: 16, className: "text-text-muted" }), _jsx("span", { children: "+91 1234 567 890" })] })] })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: () => navigate('/app/customer'), className: "w-full py-3.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle flex items-center justify-center gap-2", children: [_jsx(Home, { size: 18 }), "Browse Turfs Again"] }), _jsx("button", { onClick: () => navigate('/app/customer/bookings'), className: "w-full py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]", children: "View My Bookings" })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("p", { className: "text-sm text-text-muted", children: "Common reasons: Insufficient funds, network issues, or payment timeout" }) })] }) }));
}
