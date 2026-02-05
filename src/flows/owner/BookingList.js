import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerBookings } from "../../engine/ownerEngine";
import { Calendar, Clock, MapPin, IndianRupee, User, Mail, Loader2, AlertCircle, CheckCircle, XCircle, Timer, Package } from "lucide-react";
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
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
            return _jsx(CheckCircle, { size: 16 });
        case 'PENDING_PAYMENT':
            return _jsx(Timer, { size: 16 });
        case 'COMPLETED':
            return _jsx(CheckCircle, { size: 16 });
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return _jsx(XCircle, { size: 16 });
        case 'EXPIRED':
            return _jsx(XCircle, { size: 16 });
        default:
            return _jsx(Package, { size: 16 });
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
export default function OwnerBookingsList() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    useEffect(() => {
        // Add custom scrollbar hiding styles
        const style = document.createElement('style');
        style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
        document.head.appendChild(style);
        fetchBookings();
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getOwnerBookings();
            setBookings(response.data);
        }
        catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Unable to load bookings. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const filteredBookings = selectedStatus === 'all'
        ? bookings
        : bookings.filter(booking => booking.status === selectedStatus);
    // Calculate stats with proper filtering
    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        pending: bookings.filter(b => b.status === 'PENDING_PAYMENT').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
        // Only count revenue from confirmed and completed bookings
        revenue: bookings
            .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
            .reduce((sum, booking) => sum + booking.amount, 0)
    };
    const statusOptions = [
        { value: 'all', label: 'All Bookings', count: stats.total },
        { value: 'PENDING_PAYMENT', label: 'Pending', count: stats.pending },
        { value: 'CONFIRMED', label: 'Confirmed', count: stats.confirmed },
        { value: 'COMPLETED', label: 'Completed', count: stats.completed },
        { value: 'CANCELLED_BY_CUSTOMER', label: 'Cancelled', count: bookings.filter(b => b.status.startsWith('CANCELLED')).length },
        { value: 'EXPIRED', label: 'Expired', count: bookings.filter(b => b.status === 'EXPIRED').length }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-neutral-bg", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border sticky top-0 z-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 lg:px-6 py-4", children: [_jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Bookings" }), _jsx("p", { className: "text-sm text-text-secondary font-medium mt-1", children: "Manage and track all your turf bookings" })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto p-4 lg:p-6 space-y-6", children: [_jsx("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card", children: _jsx("div", { className: "flex gap-2 -mx-1 overflow-x-auto scrollbar-hide pb-2", children: statusOptions.map((option) => (_jsxs("button", { onClick: () => setSelectedStatus(option.value), className: `px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedStatus === option.value
                                    ? 'bg-primary text-white shadow-subtle'
                                    : 'text-text-secondary hover:bg-neutral-hover hover:text-text-primary active:scale-[0.98]'}`, children: [option.label, option.count > 0 && (_jsx("span", { className: `ml-2 px-2 py-0.5 rounded-full text-xs ${selectedStatus === option.value
                                            ? 'bg-white/20 text-white'
                                            : 'bg-neutral-bg text-text-primary'}`, children: option.count }))] }, option.value))) }) }), loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 animate-fadeIn", children: [_jsx(Loader2, { className: "h-12 w-12 text-primary animate-spin mb-3" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Loading bookings..." })] })), error && !loading && (_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn", children: [_jsx("div", { className: "w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(AlertCircle, { className: "h-8 w-8 text-danger" }) }), _jsx("h2", { className: "text-lg font-semibold text-text-primary mb-2", children: "Error Loading Bookings" }), _jsx("p", { className: "text-text-secondary mb-6", children: error }), _jsx("button", { onClick: fetchBookings, className: "px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "Try Again" })] })), !loading && !error && (_jsx(_Fragment, { children: filteredBookings.length === 0 ? (_jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn", children: [_jsx(Calendar, { className: "h-16 w-16 text-text-muted mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: "No Bookings Found" }), _jsx("p", { className: "text-text-secondary", children: selectedStatus === 'all'
                                        ? 'You don\'t have any bookings yet.'
                                        : `No ${getStatusText(selectedStatus).toLowerCase()} bookings found.` })] })) : (_jsx("div", { className: "space-y-4", children: filteredBookings.map((booking) => (_jsx("div", { onClick: () => navigate(`/app/owner/booking-details/${booking.bookingId}`), className: "bg-neutral-surface border border-neutral-border rounded-2xl hover:shadow-card-hover hover:border-primary transition-all duration-200 cursor-pointer overflow-hidden animate-scaleIn", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 pb-3 border-b border-neutral-border", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Booking ID" }), _jsx("p", { className: "text-sm font-mono font-semibold text-text-primary", children: booking.bookingId })] }), _jsxs("span", { className: `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(booking.status)}`, children: [getStatusIcon(booking.status), getStatusText(booking.status)] })] }), _jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-start gap-3 mb-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(User, { className: "text-primary", size: 20 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Customer" }), _jsx("h3", { className: "text-lg font-bold text-text-primary mb-1 truncate", children: booking.customerName }), _jsxs("div", { className: "flex items-center gap-1.5 text-sm text-text-secondary", children: [_jsx(Mail, { size: 14, className: "flex-shrink-0" }), _jsx("span", { className: "truncate", children: booking.customerEmail })] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-neutral-bg rounded-xl", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Turf" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { size: 16, className: "text-text-muted flex-shrink-0" }), _jsx("p", { className: "font-semibold text-text-primary", children: booking.turfName })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-text-muted mb-1", children: "Booked On" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { size: 16, className: "text-text-muted flex-shrink-0" }), _jsx("p", { className: "font-semibold text-text-primary text-sm", children: formatDateTime(booking.createdAt) })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("p", { className: "text-xs text-text-muted mb-3", children: ["Booked Slots (", booking.slots.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: booking.slots.map((slot) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-neutral-surface rounded-xl border border-neutral-border hover:border-primary transition-colors duration-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0", children: _jsx(Clock, { size: 18, className: "text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text-primary text-sm", children: formatDate(slot.date) }), _jsxs("p", { className: "text-xs text-text-secondary", children: [formatTime(slot.startTime), " - ", formatTime(slot.endTime)] })] })] }), _jsxs("div", { className: "flex items-center gap-0.5 text-sm font-bold text-text-primary", children: [_jsx(IndianRupee, { size: 14 }), slot.price] })] }, slot.id))) })] }), _jsx("div", { className: "pt-4 border-t border-neutral-border", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-text-secondary", children: "Total Amount" }), _jsxs("div", { className: "flex items-center gap-1 text-2xl font-bold text-text-primary", children: [_jsx(IndianRupee, { size: 22 }), booking.amount.toLocaleString('en-IN')] })] }) })] }) }, booking.bookingId))) })) }))] })] }));
}
