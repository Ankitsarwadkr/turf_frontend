import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// BookingDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingDetails, cancelBooking, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine";
import { ChevronLeft, Calendar, Clock, MapPin, IndianRupee, Loader2, AlertCircle, CheckCircle, XCircle, Timer, Package, CreditCard, User, Phone, Mail, Navigation, ExternalLink, QrCode, Shield, Receipt, Image as ImageIcon } from "lucide-react";
const getImageUrl = (path) => {
    if (!path)
        return '';
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    if (path.startsWith('http')) {
        return path;
    }
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }
    return `${API_BASE_URL}/${path}`;
};
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
        weekday: 'long',
        day: 'numeric',
        month: 'long',
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
            return 'bg-primary-light text-primary border border-primary/20';
        case 'PENDING_PAYMENT':
            return 'bg-warning/10 text-warning border border-warning/20';
        case 'COMPLETED':
            return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return 'bg-danger/10 text-danger border border-danger/20';
        case 'EXPIRED':
            return 'bg-neutral-hover text-text-muted border border-neutral-border';
        default:
            return 'bg-neutral-hover text-text-muted border border-neutral-border';
    }
};
const getStatusIcon = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return _jsx(CheckCircle, { size: 20, className: "text-primary" });
        case 'PENDING_PAYMENT':
            return _jsx(Timer, { size: 20, className: "text-warning" });
        case 'COMPLETED':
            return _jsx(CheckCircle, { size: 20, className: "text-success" });
        case 'CANCELLED_BY_CUSTOMER':
        case 'CANCELLED_BY_OWNER':
        case 'CANCELLED_BY_ADMIN':
            return _jsx(XCircle, { size: 20, className: "text-danger" });
        case 'EXPIRED':
            return _jsx(XCircle, { size: 20, className: "text-text-muted" });
        default:
            return _jsx(Package, { size: 20, className: "text-text-muted" });
    }
};
const getStatusText = (status) => {
    switch (status) {
        case 'PENDING_PAYMENT':
            return 'Awaiting Payment';
        case 'CONFIRMED':
            return 'Confirmed';
        case 'CANCELLED_BY_CUSTOMER':
            return 'Cancelled by You';
        case 'CANCELLED_BY_OWNER':
            return 'Cancelled by Owner';
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
export default function CustomerBookingDetails() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [animateAmount, setAnimateAmount] = useState(false);
    const [canCancel, setCanCancel] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);
    useEffect(() => {
        if (booking?.amount) {
            setAnimateAmount(true);
            const timer = setTimeout(() => setAnimateAmount(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [booking?.amount]);
    useEffect(() => {
        if (booking?.slots?.length > 0) {
            const canCancelBooking = checkIfCanCancel(booking.slots);
            setCanCancel(canCancelBooking);
        }
    }, [booking]);
    const checkIfCanCancel = (slots) => {
        if (!slots || slots.length === 0)
            return false;
        const firstSlot = slots[0];
        const slotStartTime = new Date(`${firstSlot.date}T${firstSlot.startTime}`);
        const currentTime = new Date();
        const timeDiffHours = (slotStartTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        return timeDiffHours > 4;
    };
    const fetchBookingDetails = async () => {
        setLoading(true);
        setError(null);
        setImageError(false);
        setImageLoading(true);
        try {
            const response = await getBookingDetails(bookingId);
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
    const handleCancelBooking = async () => {
        if (!booking)
            return;
        if (!canCancel) {
            return;
        }
        setCancelling(true);
        setShowCancelConfirm(false);
        try {
            await cancelBooking(booking.bookingId);
            await fetchBookingDetails();
        }
        catch (err) {
            console.error('Failed to cancel booking:', err);
            alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
        }
        finally {
            setCancelling(false);
        }
    };
    const handleCompletePayment = async () => {
        if (!booking)
            return;
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey.trim() === '') {
            alert('Payment gateway is not configured. Please contact support.');
            console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID');
            return;
        }
        setPaymentProcessing(true);
        try {
            const orderResponse = await createRazorpayOrder(booking.bookingId);
            await loadRazorpayScript();
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : {};
            const options = {
                key: razorpayKey,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency || 'INR',
                name: 'TurfEra',
                description: `Payment for ${booking.turfName}`,
                order_id: orderResponse.data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyResponse = await verifyPayment({
                            bookingId: booking.bookingId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        if (verifyResponse.data.paymentStatus === 'SUCCESS') {
                            await fetchBookingDetails();
                            alert('Payment successful! Your booking is confirmed.');
                        }
                        else {
                            alert('Payment verification failed. Please contact support.');
                            await fetchBookingDetails();
                        }
                    }
                    catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                    finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || ''
                },
                theme: {
                    color: '#14532D'
                },
                modal: {
                    ondismiss: function () {
                        setPaymentProcessing(false);
                    }
                }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }
        catch (error) {
            console.error('Payment initiation failed:', error);
            setPaymentProcessing(false);
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
    const getDirectionsUrl = (address) => {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };
    const showPaymentButton = () => {
        if (!booking)
            return false;
        return booking.bookingStatus === 'PENDING_PAYMENT';
    };
    const showCancelButton = () => {
        if (!booking)
            return false;
        const validStatus = booking.bookingStatus === 'CONFIRMED' ||
            booking.bookingStatus === 'PENDING_PAYMENT';
        return validStatus && canCancel;
    };
    return (_jsxs("div", { className: "min-h-screen bg-neutral-bg", children: [_jsx("header", { className: "sticky top-0 z-50 bg-neutral-surface border-b border-neutral-border shadow-subtle", children: _jsx("div", { className: "px-4 py-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-secondary" }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h1", { className: "text-page-title text-text-primary", children: "Booking Details" }), booking && (_jsx("p", { className: "text-xs text-text-muted font-mono mt-0.5", children: booking.bookingId }))] })] }) }) }), _jsxs("main", { className: "pb-28", children: [loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-20", children: [_jsx(Loader2, { className: "h-12 w-12 text-primary animate-spin mb-3" }), _jsx("p", { className: "text-text-secondary", children: "Loading booking details..." })] })), error && !loading && (_jsx("div", { className: "px-4 py-6 animate-fadeIn", children: _jsx("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border shadow-card p-6", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-scaleIn", children: _jsx(AlertCircle, { className: "h-8 w-8 text-danger" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-2", children: "Error Loading Booking" }), _jsx("p", { className: "text-text-secondary", children: error })] }), _jsx("button", { onClick: () => navigate('/app/customer/bookings'), className: "px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-sm active:scale-[0.98]", children: "Back to Bookings" })] }) }) })), booking && !loading && !error && (_jsxs("div", { className: "space-y-5 p-4 animate-slideUp", children: [_jsx("div", { className: `rounded-2xl border p-5 ${getStatusColor(booking.bookingStatus)} shadow-card`, children: _jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx("div", { className: "flex-shrink-0", children: getStatusIcon(booking.bookingStatus) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-lg text-text-primary", children: getStatusText(booking.bookingStatus) }), booking.bookingStatus === 'CONFIRMED' && (_jsx("p", { className: "text-sm text-text-secondary mt-1.5", children: "Your booking is confirmed. See you there!" })), booking.bookingStatus === 'PENDING_PAYMENT' && booking.expireAt && (_jsx("div", { className: "mt-3", children: _jsxs("p", { className: "text-sm font-medium text-warning inline-flex items-center gap-1.5", children: [_jsx(Timer, { size: 14 }), "Expires: ", formatDateTime(booking.expireAt)] }) }))] })] }) }), _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border shadow-card overflow-hidden animate-fadeIn", children: [booking.turfImage ? (_jsxs("div", { className: "relative h-52 w-full bg-neutral-hover overflow-hidden", children: [imageLoading && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-neutral-hover via-neutral-border/50 to-neutral-hover animate-shimmer bg-[length:200%_100%]" })), !imageError ? (_jsx("img", { src: getImageUrl(booking.turfImage), alt: booking.turfName, className: "w-full h-full object-cover transition-all duration-350 smooth", onLoad: () => setImageLoading(false), onError: () => {
                                                    setImageError(true);
                                                    setImageLoading(false);
                                                }, loading: "lazy" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-neutral-hover", children: _jsxs("div", { className: "text-center text-text-muted", children: [_jsx(ImageIcon, { className: "w-12 h-12 mx-auto mb-2" }), _jsx("span", { className: "text-sm", children: "Image unavailable" })] }) }))] })) : (_jsx("div", { className: "h-52 w-full bg-neutral-hover flex items-center justify-center", children: _jsx(ImageIcon, { className: "w-12 h-12 text-text-muted" }) })), _jsxs("div", { className: "p-5", children: [_jsx("h2", { className: "text-xl font-bold text-text-primary mb-4", children: booking.turfName }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx(MapPin, { className: "text-text-muted flex-shrink-0 mt-1", size: 18 }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-text-secondary mb-1.5", children: "Location" }), _jsx("p", { className: "font-medium text-text-primary mb-1.5", children: booking.turfAddress }), _jsx("p", { className: "text-sm text-text-secondary", children: booking.turfCity }), _jsxs("a", { href: getDirectionsUrl(`${booking.turfAddress}, ${booking.turfCity}`), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm mt-3 transition-colors duration-250", children: [_jsx(Navigation, { size: 14 }), "Get Directions", _jsx(ExternalLink, { size: 12 })] })] })] }), (booking.turfOwnerName || booking.turfOwnerPhone) && (_jsx("div", { className: "pt-4 border-t border-neutral-border", children: _jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx(User, { className: "text-text-muted flex-shrink-0 mt-1", size: 18 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary mb-2.5", children: "Turf Contact" }), booking.turfOwnerName && (_jsx("p", { className: "font-semibold text-text-primary mb-2.5", children: booking.turfOwnerName })), _jsxs("div", { className: "space-y-2", children: [booking.turfOwnerPhone && (_jsxs("a", { href: `tel:${booking.turfOwnerPhone}`, className: "flex items-center gap-2 text-primary hover:text-primary-hover text-sm transition-colors duration-250", children: [_jsx(Phone, { size: 14 }), booking.turfOwnerPhone] })), booking.turfOwnerEmail && (_jsxs("a", { href: `mailto:${booking.turfOwnerEmail}`, className: "flex items-center gap-2 text-primary hover:text-primary-hover text-sm transition-colors duration-250", children: [_jsx(Mail, { size: 14 }), booking.turfOwnerEmail] }))] })] })] }) }))] })] })] }), _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border shadow-card p-5 animate-fadeIn", children: [_jsxs("h3", { className: "font-semibold text-text-primary mb-5 flex items-center gap-2.5", children: [_jsx(Calendar, { size: 18, className: "text-text-muted" }), "Booking Timeline"] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-secondary mb-4", children: "Selected Slots" }), _jsx("div", { className: "space-y-3", children: booking.slots.map((slot, index) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-neutral-subtle rounded-xl border border-neutral-border hover:bg-neutral-hover transition-all duration-250 smooth group animate-date-bounce", style: { animationDelay: `${index * 100}ms` }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text-primary group-hover:text-text-accent transition-colors duration-250", children: formatDate(slot.date) }), _jsxs("p", { className: "text-sm text-text-secondary mt-1", children: [formatTime(slot.startTime), " - ", formatTime(slot.endTime)] })] }), _jsxs("div", { className: "flex items-center gap-1 text-primary font-semibold animate-number-count", children: [_jsx(IndianRupee, { size: 14 }), _jsx("span", { children: slot.price })] })] }, index))) })] }), _jsx("div", { className: "pt-4 border-t border-neutral-border", children: _jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx(Clock, { size: 18, className: "text-text-muted flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-text-secondary", children: "Booked On" }), _jsx("p", { className: "font-semibold text-text-primary", children: formatDateTime(booking.createdAt) })] })] }) })] })] }), _jsxs("div", { className: "bg-neutral-surface rounded-2xl border border-neutral-border shadow-card overflow-hidden animate-fadeIn", children: [_jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-semibold text-text-primary mb-5 flex items-center gap-2.5", children: [_jsx(Receipt, { size: 18, className: "text-text-muted" }), "Payment Summary"] }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-text-secondary", children: "Total Amount" }), _jsxs("div", { className: `flex items-center gap-1 transition-all duration-500 premium ${animateAmount ? 'animate-price-rise' : ''}`, children: [_jsx(IndianRupee, { size: 20, className: "text-text-primary" }), _jsx("span", { className: `text-3xl font-bold text-text-primary ${animateAmount ? 'text-primary' : ''}`, children: booking.amount })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-neutral-border", children: [_jsx("span", { className: "text-text-secondary", children: "Payment Status" }), _jsx("span", { className: `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-250 ${booking.paymentStatus === 'SUCCESS'
                                                                    ? 'bg-success/10 text-success border border-success/20'
                                                                    : booking.paymentStatus === 'FAILED'
                                                                        ? 'bg-danger/10 text-danger border border-danger/20'
                                                                        : 'bg-warning/10 text-warning border border-warning/20'}`, children: booking.paymentStatus === 'SUCCESS' ? 'Paid' :
                                                                    booking.paymentStatus === 'FAILED' ? 'Failed' :
                                                                        'Pending' })] }), booking.paymentMethod && (_jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-neutral-border", children: [_jsx("span", { className: "text-text-secondary", children: "Payment Method" }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(CreditCard, { size: 16, className: "text-text-muted" }), _jsx("span", { className: "text-sm font-semibold text-text-primary", children: booking.paymentMethod })] })] })), booking.paymentId && (_jsxs("div", { className: "pt-4 border-t border-neutral-border", children: [_jsx("p", { className: "text-sm text-text-secondary mb-2", children: "Transaction ID" }), _jsx("p", { className: "font-mono text-sm text-text-primary break-all bg-neutral-hover p-3 rounded-lg border border-neutral-border", children: booking.paymentId })] }))] })] }), _jsx("div", { className: "bg-neutral-subtle border-t border-neutral-border p-4", children: _jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx(Shield, { size: 16, className: "text-primary flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-xs text-text-secondary", children: "Your payment is secured with Razorpay. We never store your card details." })] }) })] }), _jsx("div", { className: "bg-blue-50/50 border border-blue-200 rounded-2xl p-4.5 animate-fadeIn", children: _jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx(AlertCircle, { size: 18, className: "text-blue-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-blue-900 mb-1.5", children: "Need Help?" }), _jsx("p", { className: "text-xs text-blue-800/80", children: "Contact the turf owner directly or reach out to our support team for assistance." })] })] }) })] }))] }), booking && !loading && !error && (showPaymentButton() || showCancelButton()) && (_jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-neutral-surface border-t border-neutral-border shadow-premium p-4 animate-summary-slide", children: _jsxs("div", { className: "max-w-2xl mx-auto space-y-2.5", children: [showPaymentButton() && (_jsx("button", { onClick: handleCompletePayment, disabled: paymentProcessing, className: `w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-350 premium shadow-premium ${paymentProcessing
                                ? 'bg-text-muted cursor-wait'
                                : 'bg-primary hover:bg-primary-hover active:scale-[0.98] hover:shadow-card-hover'}`, children: paymentProcessing ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Processing Payment..."] })) : (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(QrCode, { size: 16 }), _jsxs("span", { children: ["Pay \u20B9", booking.amount] })] })) })), showCancelButton() && (_jsx("button", { onClick: () => setShowCancelConfirm(true), disabled: cancelling, className: `w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-250 smooth flex items-center justify-center gap-2 ${cancelling
                                ? 'bg-neutral-hover text-text-muted cursor-wait'
                                : 'bg-neutral-surface text-danger border border-danger/30 hover:bg-danger/5 active:scale-[0.98]'}`, children: cancelling ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 14, className: "animate-spin" }), "Cancelling..."] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { size: 14 }), "Cancel Booking"] })) }))] }) })), showCancelConfirm && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 animate-fadeIn", onClick: () => setShowCancelConfirm(false) }), _jsx("div", { className: "hidden md:block fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none", children: _jsxs("div", { className: "bg-neutral-surface rounded-2xl shadow-premium max-w-md w-full p-6 pointer-events-auto animate-scaleIn", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-start gap-4 mb-5", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0", children: _jsx(AlertCircle, { className: "w-6 h-6 text-danger" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: "Cancel Booking?" }), _jsx("p", { className: "text-sm text-text-secondary", children: "Are you sure you want to cancel this booking? This action cannot be undone." })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowCancelConfirm(false), className: "flex-1 py-2.5 px-4 bg-neutral-surface text-text-primary border border-neutral-border rounded-xl font-medium text-sm hover:bg-neutral-hover transition-all duration-250 smooth active:scale-[0.98]", children: "Keep Booking" }), _jsx("button", { onClick: handleCancelBooking, disabled: cancelling, className: "flex-1 py-2.5 px-4 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger/90 transition-all duration-250 smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait", children: cancelling ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { size: 14, className: "animate-spin" }), "Cancelling..."] })) : ('Yes, Cancel') })] })] }) }), _jsx("div", { className: "md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-auto", children: _jsxs("div", { className: "bg-neutral-surface rounded-t-3xl shadow-premium p-6 animate-slideUp", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "w-12 h-1.5 bg-neutral-border rounded-full mx-auto mb-6" }), _jsxs("div", { className: "flex items-start gap-4 mb-6", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0", children: _jsx(AlertCircle, { className: "w-6 h-6 text-danger" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: "Cancel Booking?" }), _jsx("p", { className: "text-sm text-text-secondary", children: "Are you sure you want to cancel this booking? This action cannot be undone." })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: handleCancelBooking, disabled: cancelling, className: "w-full py-3 px-4 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger/90 transition-all duration-250 smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait", children: cancelling ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Cancelling..."] })) : ('Yes, Cancel Booking') }), _jsx("button", { onClick: () => setShowCancelConfirm(false), className: "w-full py-3 px-4 bg-neutral-surface text-text-primary border border-neutral-border rounded-xl font-medium text-sm hover:bg-neutral-hover transition-all duration-250 smooth active:scale-[0.98]", children: "Keep Booking" })] })] }) })] }))] }));
}
