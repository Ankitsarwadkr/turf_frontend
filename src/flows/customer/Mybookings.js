import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine";
import { Calendar, Clock, MapPin, IndianRupee, Loader2, AlertCircle, CheckCircle, XCircle, Timer, Package } from "lucide-react";
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
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
const formatCompactDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    else {
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-success/10 text-success border-success/20';
        case 'PENDING_PAYMENT':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'COMPLETED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return 'bg-danger/10 text-danger border-danger/20';
        case 'EXPIRED':
            return 'bg-text-muted/10 text-text-muted border-neutral-border';
        default:
            return 'bg-neutral-hover text-text-secondary border-neutral-border';
    }
};
const getStatusIcon = (status, size = 16) => {
    const props = { size };
    switch (status) {
        case 'CONFIRMED':
            return _jsx(CheckCircle, { ...props });
        case 'PENDING_PAYMENT':
            return _jsx(Timer, { ...props });
        case 'COMPLETED':
            return _jsx(CheckCircle, { ...props });
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return _jsx(XCircle, { ...props });
        case 'EXPIRED':
            return _jsx(XCircle, { ...props });
        default:
            return _jsx(Package, { ...props });
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT':
            return 'Pending Payment';
        case 'CONFIRMED':
            return 'Confirmed';
        case 'CANCELLED_BY_CUSTOMER':
            return 'Cancelled';
        case 'CANCELLED_BY_OWNER':
            return 'Cancelled by Owner';
        case 'CANCELLED_BY_ADMIN':
            return 'Cancelled by Admin';
        case 'COMPLETED':
            return 'Completed';
        case 'EXPIRED':
            return 'Expired';
        default:
            return status;
    }
};
const getShortStatus = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT':
            return 'Pending';
        case 'CONFIRMED':
            return 'Confirmed';
        case 'COMPLETED':
            return 'Completed';
        default:
            return status.slice(0, 3);
    }
};
// Utility function to load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(script);
    });
};
export default function CustomerBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [payingBookingId, setPayingBookingId] = useState(null);
    useEffect(() => {
        fetchBookings();
    }, []);
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMyBookings();
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
    const handleCompletePayment = async (booking) => {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey.trim() === '') {
            alert('Payment gateway is not configured. Please contact support.');
            console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID');
            return;
        }
        setPayingBookingId(booking.bookingId);
        try {
            // Step 1: Create Razorpay order
            const orderResponse = await createRazorpayOrder(booking.bookingId);
            // Step 2: Load Razorpay script
            await loadRazorpayScript();
            // Get user data
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : {};
            // Step 3: Configure Razorpay options
            const options = {
                key: razorpayKey,
                amount: orderResponse.data.amount, // Already in paise from backend
                currency: orderResponse.data.currency || 'INR',
                name: 'TurfEra',
                description: `Payment for ${booking.turfName}`,
                order_id: orderResponse.data.razorpayOrderId,
                handler: async function (response) {
                    // Step 4: Verify payment
                    try {
                        const verifyResponse = await verifyPayment({
                            bookingId: booking.bookingId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        if (verifyResponse.data.paymentStatus === 'SUCCESS') {
                            // Refresh bookings list to show updated status
                            await fetchBookings();
                            // Show success message
                            alert('Payment successful! Your booking is confirmed.');
                            // Navigate to booking details
                            navigate(`/app/customer/bookings/${booking.bookingId}`);
                        }
                        else {
                            alert('Payment verification failed. Please contact support.');
                            navigate(`/app/customer/bookings/${booking.bookingId}`);
                        }
                    }
                    catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                    finally {
                        setPayingBookingId(null);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: '#16a34a' // Green color matching your theme
                },
                modal: {
                    ondismiss: function () {
                        setPayingBookingId(null);
                    }
                }
            };
            // Step 5: Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }
        catch (error) {
            console.error('Payment initiation failed:', error);
            setPayingBookingId(null);
            // Handle specific errors
            if (error.response?.status === 404) {
                alert('Booking not found. Please try again.');
            }
            else if (error.response?.status === 403) {
                alert('This booking does not belong to you.');
            }
            else {
                alert('Failed to initiate payment. Please try again.');
            }
        }
    };
    const filteredBookings = bookings.filter(booking => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(booking.slots[0]?.date);
        if (filter === 'today') {
            return bookingDate.toDateString() === today.toDateString() &&
                (booking.bookingStatus === 'CONFIRMED' ||
                    booking.bookingStatus === 'PENDING_PAYMENT');
        }
        if (filter === 'upcoming') {
            return bookingDate >= today &&
                (booking.bookingStatus === 'CONFIRMED' ||
                    booking.bookingStatus === 'PENDING_PAYMENT');
        }
        if (filter === 'past') {
            return bookingDate < today ||
                booking.bookingStatus === 'COMPLETED' ||
                booking.bookingStatus === 'CANCELLED_BY_CUSTOMER' ||
                booking.bookingStatus === 'CANCELLED_BY_OWNER' ||
                booking.bookingStatus === 'CANCELLED_BY_ADMIN' ||
                booking.bookingStatus === 'EXPIRED';
        }
        return true; // 'all'
    });
    return (_jsxs("div", { className: "min-h-screen min-h-[100dvh] bg-neutral-bg", children: [_jsxs("div", { className: "bg-neutral-surface border-b border-neutral-border sticky top-0 z-10", children: [_jsxs("div", { className: "px-4 py-3", children: [_jsx("h1", { className: "text-page-title font-semibold tracking-tight text-text-primary", children: "My Bookings" }), _jsxs("p", { className: "text-text-muted text-xs font-medium mt-1", children: [bookings.length, " ", bookings.length === 1 ? 'booking' : 'bookings'] })] }), _jsxs("div", { className: "px-4 pb-3 flex gap-2 overflow-x-auto", children: [_jsx("button", { onClick: () => setFilter('all'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${filter === 'all'
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'}`, children: "All" }), _jsx("button", { onClick: () => setFilter('today'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${filter === 'today'
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'}`, children: "Today" }), _jsx("button", { onClick: () => setFilter('upcoming'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${filter === 'upcoming'
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'}`, children: "Upcoming" }), _jsx("button", { onClick: () => setFilter('past'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${filter === 'past'
                                    ? 'bg-primary text-white hover:bg-primary-hover'
                                    : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'}`, children: "Past" })] })] }), _jsxs("div", { className: "p-4 pb-20", children: [loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-20", children: [_jsx(Loader2, { className: "h-12 w-12 text-primary animate-spin mb-3" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Loading bookings..." })] })), error && !loading && (_jsx("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl p-6 shadow-card", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto", children: _jsx(AlertCircle, { className: "h-8 w-8 text-danger" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary mb-2", children: "Error Loading Bookings" }), _jsx("p", { className: "text-text-secondary text-sm", children: error })] }), _jsx("button", { onClick: fetchBookings, className: "px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "Try Again" })] }) })), !loading && !error && filteredBookings.length === 0 && (_jsx("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl p-8 shadow-card", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-neutral-hover rounded-full flex items-center justify-center mx-auto", children: _jsx(Package, { className: "h-8 w-8 text-text-muted" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary mb-2", children: filter === 'all' ? 'No Bookings Yet' :
                                                filter === 'today' ? 'No Bookings Today' :
                                                    filter === 'upcoming' ? 'No Upcoming Bookings' :
                                                        'No Past Bookings' }), _jsx("p", { className: "text-text-secondary text-sm", children: filter === 'all' ? 'Start booking your favorite turfs!' :
                                                filter === 'today' ? 'No bookings scheduled for today' :
                                                    filter === 'upcoming' ? 'Book a turf to see it here' :
                                                        'Your completed bookings will appear here' })] }), filter === 'all' && (_jsx("button", { onClick: () => navigate('/app/customer'), className: "px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "Browse Turfs" }))] }) })), !loading && !error && filteredBookings.length > 0 && (_jsx("div", { className: "space-y-2", children: filteredBookings.map((booking) => {
                            const isPayingThisBooking = payingBookingId === booking.bookingId;
                            return (_jsxs("div", { onClick: () => navigate(`/app/customer/bookings/${booking.bookingId}`), className: "bg-neutral-surface border border-neutral-border rounded-lg p-3 hover:shadow-card-hover transition-all duration-300 cursor-pointer relative hover:border-stone-300 active:scale-[0.99]", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex-1 min-w-0 pr-2", children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-text-primary truncate", children: booking.turfName }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-text-muted mt-0.5", children: [_jsx(MapPin, { size: 12 }), _jsx("span", { className: "truncate", children: booking.turfCity })] })] }), _jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${getStatusColor(booking.bookingStatus)}`, children: [getStatusIcon(booking.bookingStatus, 12), _jsx("span", { className: "hidden sm:inline", children: getStatusText(booking.bookingStatus) }), _jsx("span", { className: "sm:hidden", children: getShortStatus(booking.bookingStatus) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs mb-2", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-text-primary", children: [_jsx(Calendar, { size: 12, className: "text-text-muted flex-shrink-0" }), _jsx("span", { className: "truncate", children: formatCompactDate(booking.slots[0].date) })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-text-primary", children: [_jsx(Clock, { size: 12, className: "text-text-muted flex-shrink-0" }), _jsx("span", { className: "truncate", children: formatTime(booking.slots[0].startTime) })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-text-primary", children: [_jsx(IndianRupee, { size: 12, className: "text-text-muted flex-shrink-0" }), _jsxs("span", { className: "font-semibold", children: ["\u20B9", booking.amount] })] }), _jsx("div", { className: "flex items-center gap-1.5 text-text-muted", children: _jsxs("span", { children: [booking.slots.length, " slot", booking.slots.length > 1 ? 's' : ''] }) })] }), booking.bookingStatus === 'PENDING_PAYMENT' && (_jsx("div", { className: "pt-2 border-t border-neutral-border", children: _jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                handleCompletePayment(booking);
                                            }, disabled: isPayingThisBooking, className: `w-full py-1.5 text-xs font-medium rounded transition-all duration-200 active:scale-[0.98] ${isPayingThisBooking
                                                ? 'bg-text-muted text-white cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary-hover'}`, children: isPayingThisBooking ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { size: 14, className: "animate-spin" }), "Loading Payment..."] })) : ('Complete Payment') }) })), _jsx("div", { className: "pt-2 border-t border-neutral-border mt-2", children: _jsxs("span", { className: "text-xs text-text-muted font-mono truncate block", children: ["ID: ", booking.bookingId] }) })] }, booking.bookingId));
                        }) }))] })] }));
}
