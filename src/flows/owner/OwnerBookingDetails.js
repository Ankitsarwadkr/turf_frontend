import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOwnerBookingDetails } from "../../engine/ownerEngine";
import { ChevronLeft, Clock, MapPin, IndianRupee, User, Mail, Loader2, AlertCircle, CheckCircle, XCircle, Timer, Package, Phone, Navigation, ExternalLink } from "lucide-react";
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
const getStatusColor = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-green-50 text-success border-green-200';
        case 'PENDING_PAYMENT':
            return 'bg-yellow-50 text-warning border-yellow-200';
        case 'COMPLETED':
            return 'bg-blue-50 text-blue-800 border-blue-200';
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return 'bg-red-50 text-danger border-red-200';
        case 'EXPIRED':
            return 'bg-neutral-bg text-text-muted border-neutral-border';
        default:
            return 'bg-neutral-bg text-text-secondary border-neutral-border';
    }
};
const getStatusIcon = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return _jsx(CheckCircle, { size: 20 });
        case 'PENDING_PAYMENT':
            return _jsx(Timer, { size: 20 });
        case 'COMPLETED':
            return _jsx(CheckCircle, { size: 20 });
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return _jsx(XCircle, { size: 20 });
        case 'EXPIRED':
            return _jsx(XCircle, { size: 20 });
        default:
            return _jsx(Package, { size: 20 });
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT':
            return 'Awaiting Payment';
        case 'CONFIRMED':
            return 'Confirmed';
        case 'CANCELLED_BY_CUSTOMER':
            return 'Cancelled by Customer';
        case 'CANCELLED_BY_OWNER':
            return 'Cancelled by You';
        case 'CANCELLED_BY_ADMIN':
            return 'Cancelled by Admin';
        case 'COMPLETED':
            return 'Completed';
        case 'EXPIRED':
            return 'Payment Expired';
        default:
            return status;
    }
};
const getDirectionsUrl = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};
export default function OwnerBookingDetails() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);
    const fetchBookingDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getOwnerBookingDetails(bookingId);
            setBooking(response.data);
        }
        catch (err) {
            console.error('Failed to fetch booking details:', err);
            if (err.response?.status === 404) {
                setError('Booking not found.');
            }
            else if (err.response?.status === 403) {
                setError('You do not have access to this booking.');
            }
            else {
                setError('Unable to load booking details. Please try again.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static", children: _jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3", children: [_jsx("button", { onClick: () => navigate('/app/owner/bookings'), className: "p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Booking Details" })] }) }), _jsx("div", { className: "w-full max-w-7xl mx-auto p-4 lg:p-6", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 animate-fadeIn", children: [_jsx(Loader2, { className: "h-12 w-12 text-primary animate-spin mb-3" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Loading..." })] })), error && !loading && (_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn", children: [_jsx("div", { className: "w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(AlertCircle, { className: "h-8 w-8 text-danger" }) }), _jsx("h2", { className: "text-lg font-semibold text-text-primary mb-2", children: "Error Loading Booking" }), _jsx("p", { className: "text-text-secondary mb-6", children: error }), _jsx("button", { onClick: () => navigate('/app/owner/bookings'), className: "px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "Back to Bookings" })] })), booking && !loading && !error && (_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl shadow-card overflow-hidden animate-fadeIn", children: [_jsxs("div", { className: "bg-neutral-bg border-b border-neutral-border p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted uppercase tracking-wide mb-1 font-semibold", children: "Booking ID" }), _jsx("p", { className: "text-lg font-mono font-bold text-text-primary", children: booking.bookingId })] }), _jsxs("span", { className: `px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border ${getStatusColor(booking.status)}`, children: [getStatusIcon(booking.status), getStatusText(booking.status)] })] }), _jsxs("p", { className: "text-sm text-text-secondary font-medium", children: ["Booked on ", formatDateTime(booking.createdAt)] })] }), _jsxs("div", { className: "p-6 border-b border-neutral-border", children: [_jsx("p", { className: "text-xs text-text-muted uppercase tracking-wide mb-3 font-semibold", children: "Customer" }), _jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary-light rounded-full flex items-center justify-center", children: _jsx(User, { className: "text-primary", size: 20 }) }), _jsx("div", { children: _jsx("h2", { className: "text-lg font-bold text-text-primary", children: booking.customer.name }) })] }), _jsxs("div", { className: "space-y-2 ml-15", children: [_jsxs("a", { href: `mailto:${booking.customer.email}`, className: "flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors duration-200", children: [_jsx(Mail, { size: 16 }), booking.customer.email] }), booking.customer.phone && (_jsxs("a", { href: `tel:${booking.customer.phone}`, className: "flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors duration-200", children: [_jsx(Phone, { size: 16 }), booking.customer.phone] }))] })] }), _jsxs("div", { className: "p-6 border-b border-neutral-border", children: [_jsx("p", { className: "text-xs text-text-muted uppercase tracking-wide mb-3 font-semibold", children: "Turf" }), _jsx("h3", { className: "text-lg font-bold text-text-primary mb-2", children: booking.turf.name }), _jsxs("div", { className: "flex items-start gap-2 mb-3", children: [_jsx(MapPin, { className: "text-text-muted flex-shrink-0 mt-0.5", size: 16 }), _jsxs("div", { className: "text-sm text-text-secondary", children: [_jsx("p", { children: booking.turf.address }), _jsx("p", { children: booking.turf.city })] })] }), _jsxs("a", { href: getDirectionsUrl(`${booking.turf.address}, ${booking.turf.city}`), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-semibold transition-colors duration-200", children: [_jsx(Navigation, { size: 14 }), "Get Directions", _jsx(ExternalLink, { size: 12 })] })] }), _jsxs("div", { className: "p-6 border-b border-neutral-border", children: [_jsx("p", { className: "text-xs text-text-muted uppercase tracking-wide mb-4 font-semibold", children: "Booked Slots" }), _jsx("div", { className: "space-y-3", children: booking.slots.map((slot, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-neutral-bg rounded-xl hover:bg-neutral-hover transition-colors duration-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center", children: _jsx(Clock, { size: 18, className: "text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text-primary text-sm", children: formatDate(slot.date) }), _jsxs("p", { className: "text-xs text-text-secondary", children: [formatTime(slot.startTime), " - ", formatTime(slot.endTime)] })] })] }), _jsxs("div", { className: "flex items-center gap-0.5 font-bold text-text-primary", children: [_jsx(IndianRupee, { size: 16 }), slot.price] })] }, index))) })] }), _jsx("div", { className: "p-6 bg-neutral-bg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-base font-semibold text-text-primary", children: "Total Amount" }), _jsxs("div", { className: "flex items-center gap-1 text-3xl font-bold text-text-primary", children: [_jsx(IndianRupee, { size: 26 }), booking.amount.toLocaleString('en-IN')] })] }) })] }))] }) })] }));
}
