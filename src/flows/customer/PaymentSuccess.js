import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin, Home, ChevronDown, ChevronUp } from "lucide-react";
export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showIds, setShowIds] = useState(false);
    const [animate, setAnimate] = useState(false);
    const { bookingId, amount, turfName, slots, paymentId } = location.state || {};
    // Redirect if no booking data (page refresh/direct access)
    useEffect(() => {
        if (!bookingId || !amount || !turfName || !slots) {
            navigate('/app/customer/bookings', { replace: true });
        }
    }, [bookingId, amount, turfName, slots, navigate]);
    // Trigger animation on mount
    useEffect(() => {
        setTimeout(() => setAnimate(true), 100);
    }, []);
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    // Don't render if data is missing (will redirect)
    if (!bookingId || !amount || !turfName || !slots) {
        return null;
    }
    return (_jsx("div", { className: "min-h-screen bg-neutral-bg px-4 py-8", children: _jsxs("div", { className: "max-w-md mx-auto", children: [_jsxs("div", { className: `bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden mb-6 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`, children: [_jsxs("div", { className: "bg-gradient-to-r from-primary to-primary-hover p-8 text-center", children: [_jsx("div", { className: `w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${animate ? 'scale-100' : 'scale-0'}`, children: _jsx(CheckCircle, { className: "h-10 w-10 text-white" }) }), _jsx("h1", { className: "text-page-title font-semibold tracking-tight text-white mb-2", children: "Payment Successful!" }), _jsx("p", { className: "text-white/90 text-sm", children: "Your booking has been confirmed" })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("p", { className: "text-sm text-text-muted", children: "Total Amount Paid" }), _jsxs("p", { className: "text-4xl font-bold text-text-primary mt-1", children: ["\u20B9", amount] })] }), _jsx("div", { className: "mb-6 p-4 bg-primary-subtle rounded-lg border border-primary-light", children: _jsxs("p", { className: "text-sm text-primary text-center leading-relaxed", children: ["\uD83D\uDCE7 Confirmation email sent to your registered email.", _jsx("br", {}), "\u23F0 Please arrive 15 minutes before your scheduled time."] }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex items-start gap-3 p-3 bg-neutral-hover rounded-lg border border-neutral-border", children: [_jsx("div", { className: "w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Calendar, { size: 16, className: "text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Date" }), _jsx("p", { className: "text-sm font-semibold text-text-primary", children: formatDate(slots[0]?.date || '') })] })] }), _jsxs("div", { className: "p-3 bg-neutral-hover rounded-lg border border-neutral-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Clock, { size: 16, className: "text-primary" }) }), _jsx("div", { children: _jsx("p", { className: "text-xs text-text-muted", children: "Time Slots" }) }), _jsxs("span", { className: "ml-auto text-xs bg-primary-subtle text-primary px-2 py-1 rounded font-medium", children: [slots.length, " slot", slots.length > 1 ? 's' : ''] })] }), _jsx("div", { className: "space-y-2 ml-10", children: slots.map((slot, index) => (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-primary rounded-full" }), _jsxs("span", { className: "font-medium text-text-primary", children: [formatTime(slot.startTime), " - ", formatTime(slot.endTime)] })] }, index))) })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-neutral-hover rounded-lg border border-neutral-border", children: [_jsx("div", { className: "w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { size: 16, className: "text-primary" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Venue" }), _jsx("p", { className: "text-sm font-semibold text-text-primary", children: turfName })] })] })] }), _jsxs("div", { className: "border-t border-neutral-border pt-4", children: [_jsxs("button", { onClick: () => setShowIds(!showIds), className: "w-full flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-all duration-200", children: [_jsx("span", { children: "Booking Details" }), showIds ? _jsx(ChevronUp, { size: 16 }) : _jsx(ChevronDown, { size: 16 })] }), showIds && (_jsxs("div", { className: "mt-3 space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-muted", children: "Booking ID" }), _jsx("span", { className: "font-mono text-text-secondary", children: bookingId })] }), paymentId && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-muted", children: "Payment ID" }), _jsx("span", { className: "font-mono text-text-secondary", children: paymentId })] }))] }))] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: () => navigate('/app/customer/bookings'), className: "w-full py-3.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "View My Bookings" }), _jsxs("button", { onClick: () => navigate('/app/customer'), className: "w-full py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2", children: [_jsx(Home, { size: 18 }), "Back to Home"] })] })] }) }));
}
