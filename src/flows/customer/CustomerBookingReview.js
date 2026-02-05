import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine";
import { ChevronLeft, Calendar, Clock, Loader2, AlertCircle, Shield, CreditCard, MapPin, RefreshCw, Users, IndianRupee, X } from "lucide-react";
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
const formatTimeSlot = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};
const formatDuration = (slots) => {
    return `${slots.length} hour${slots.length > 1 ? 's' : ''}`;
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
export default function CustomerBookingReview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { turfId, slotIds } = location.state || {};
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const bookingCreatedRef = useRef(false);
    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (!turfId || !slotIds) {
            navigate('/app/customer');
        }
    }, [turfId, slotIds, navigate]);
    useEffect(() => {
        const createNewBooking = async () => {
            if (!turfId || !slotIds || bookingCreatedRef.current)
                return;
            bookingCreatedRef.current = true;
            setLoading(true);
            setError(null);
            try {
                const response = await createBooking({
                    turfId,
                    slotIds
                });
                await new Promise(resolve => setTimeout(resolve, 300));
                setBooking(response.data);
                // Timer calculation
                const expiredAt = new Date(response.data.expiredAt).getTime();
                const now = new Date().getTime();
                setTimeLeft(Math.max(0, Math.floor((expiredAt - now) / 1000)));
            }
            catch (err) {
                console.error('Booking creation failed:', err);
                bookingCreatedRef.current = false;
                if (err.response?.status === 409) {
                    setError('Selected slots are no longer available. Please choose different time slots.');
                }
                else if (err.response?.status === 401) {
                    setError('Please login to continue with booking.');
                }
                else {
                    setError('Unable to proceed with booking. Please try again.');
                }
            }
            finally {
                setLoading(false);
            }
        };
        createNewBooking();
    }, [turfId, slotIds]);
    // Countdown timer
    useEffect(() => {
        if (!booking || timeLeft <= 0)
            return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [booking, timeLeft]);
    const formatTimeLeft = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const handleProceedToPayment = async () => {
        if (!booking || timeLeft <= 0 || isProcessing)
            return;
        // Check for Razorpay key
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey || razorpayKey.trim() === '') {
            alert('Payment gateway is not configured. Please contact support.');
            console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID');
            return;
        }
        setIsProcessing(true);
        try {
            // Step 1: Create Razorpay order
            const orderResponse = await createRazorpayOrder(booking.bookingId);
            // Step 2: Load Razorpay script
            await loadRazorpayScript();
            // Step 3: Configure Razorpay options
            const options = {
                key: razorpayKey,
                amount: orderResponse.data.amount, // Already in paise from backend
                currency: orderResponse.data.currency || 'INR',
                name: 'TurfEra',
                description: `Booking for ${booking.turfName}`,
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
                            navigate('/app/customer/payment-success', {
                                state: {
                                    bookingId: booking.bookingId,
                                    amount: booking.amount,
                                    turfName: booking.turfName,
                                    slots: booking.slots,
                                    paymentId: verifyResponse.data.paymentId
                                }
                            });
                        }
                        else {
                            navigate('/app/customer/payment-failed', {
                                state: {
                                    bookingId: booking.bookingId,
                                    message: verifyResponse.data.message
                                }
                            });
                        }
                    }
                    catch (error) {
                        console.error('Payment verification failed:', error);
                        navigate('/app/customer/payment-failed', {
                            state: {
                                bookingId: booking.bookingId,
                                message: 'Payment verification failed. Please contact support.'
                            }
                        });
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
                        setIsProcessing(false);
                    }
                }
            };
            // Step 5: Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }
        catch (error) {
            console.error('Payment initiation failed:', error);
            setIsProcessing(false);
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
    const handleCancel = () => {
        if (booking && timeLeft > 0) {
            setShowCancelModal(true);
        }
        else {
            navigate(-1);
        }
    };
    const confirmCancel = () => {
        setShowCancelModal(false);
        navigate(-1);
    };
    const handleRetry = () => {
        bookingCreatedRef.current = false;
        setError(null);
        setBooking(null);
        window.location.reload();
    };
    if (!turfId || !slotIds) {
        return (_jsx("div", { className: "min-h-screen min-h-[100dvh] flex items-center justify-center bg-neutral-bg px-4", children: _jsxs("div", { className: "text-center space-y-6 max-w-sm w-full", children: [_jsx("div", { className: "w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto", children: _jsx(AlertCircle, { className: "h-10 w-10 text-danger" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-page-title font-semibold tracking-tight text-text-primary mb-2", children: "Booking Information Missing" }), _jsx("p", { className: "text-text-secondary text-sm", children: "Please start over." })] }), _jsx("button", { onClick: () => navigate('/app/customer'), className: "w-full py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle", children: "Back to Home" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "min-h-screen min-h-[100dvh] bg-neutral-bg", children: [_jsx("div", { className: "sticky top-0 z-50 bg-neutral-surface border-b border-neutral-border shrink-0", children: _jsxs("div", { className: "px-4 py-3 flex items-center max-w-6xl mx-auto", children: [_jsx("button", { onClick: handleCancel, className: "p-2 -ml-2 rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-95", "aria-label": "Go back", children: _jsx(ChevronLeft, { size: 24, className: "text-text-primary" }) }), _jsxs("div", { className: "ml-2", children: [_jsx("h1", { className: "text-sm font-semibold tracking-tight text-text-primary", children: "Review Booking" }), _jsx("p", { className: "text-text-muted text-xs font-medium", children: "Confirm details and pay" })] })] }) }), _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-6 md:flex md:gap-6", children: [_jsxs("div", { className: "md:flex-1 md:overflow-y-auto md:pb-6", children: [loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-20", children: [_jsx(Loader2, { className: "h-12 w-12 text-primary animate-spin mb-3" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Securing your slots..." })] })), error && !loading && (_jsx("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl p-6", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto", children: _jsx(AlertCircle, { className: "h-8 w-8 text-danger" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary mb-2", children: "Unable to Proceed" }), _jsx("p", { className: "text-text-secondary text-sm", children: error })] }), _jsxs("div", { className: "flex flex-col gap-2 pt-2", children: [_jsxs("button", { onClick: handleRetry, className: "px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle flex items-center justify-center gap-2", children: [_jsx(RefreshCw, { size: 16 }), "Try Again"] }), _jsx("button", { onClick: () => navigate(-1), className: "px-5 py-2.5 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]", children: "Choose Different Slots" })] })] }) })), booking && !loading && !error && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "md:hidden", children: [timeLeft > 0 && (_jsx("div", { className: "mb-4", children: _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-blue-100 rounded-lg p-2", children: _jsx(Clock, { size: 18, className: "text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-primary", children: "Complete payment in" }), _jsx("p", { className: "text-xs text-text-muted", children: "Slots reserved temporarily" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: formatTimeLeft(timeLeft) }), _jsx("p", { className: "text-xs text-text-muted", children: "mins:secs" })] })] }) }) })), timeLeft === 0 && (_jsx("div", { className: "mb-4", children: _jsx("div", { className: "bg-danger/10 border border-danger/20 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-danger flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-danger", children: "Time Expired" }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "Your reserved slots have been released. Please select them again to continue." })] })] }) }) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "md:hidden bg-neutral-surface border border-neutral-border rounded-xl p-6 shadow-card", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Total Amount to Pay" }), _jsxs("p", { className: "text-4xl font-bold text-text-primary mb-2", children: ["\u20B9", booking.amount] }), _jsxs("div", { className: "flex items-center justify-center gap-4 text-sm text-text-muted", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 14 }), formatDate(booking.slots[0].date)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { size: 14 }), booking.slots.length, " slot", booking.slots.length > 1 ? 's' : ''] })] })] }) }), _jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden", children: [_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary mb-6", children: "Your Booking Details" }), _jsx("div", { className: "mb-6 pb-6 border-b border-neutral-border", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(MapPin, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-text-primary", children: booking.turfName }), _jsx("p", { className: "text-text-secondary text-xs", children: booking.turfCity })] })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Calendar, { size: 16, className: "text-text-muted" }), _jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Date" })] }), _jsx("div", { className: "bg-neutral-hover rounded-lg p-3", children: _jsx("p", { className: "font-medium text-text-primary", children: formatDate(booking.slots[0].date) }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Clock, { size: 16, className: "text-text-muted" }), _jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Selected Time Slots" })] }), _jsx("div", { className: "space-y-2", children: booking.slots.map((slot, index) => (_jsxs("div", { className: "flex items-center justify-between bg-neutral-hover rounded-lg p-3 hover:bg-neutral-surface transition-colors duration-250 border border-neutral-border hover:border-stone-300", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-md bg-primary-subtle flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium text-primary", children: index + 1 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-primary", children: formatTimeSlot(slot.startTime, slot.endTime) }), _jsx("p", { className: "text-xs text-text-muted", children: "1 hour" })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(IndianRupee, { size: 14, className: "text-text-muted" }), _jsx("span", { className: "font-semibold text-text-primary", children: slot.price })] })] }, slot.slotId))) })] }), _jsxs("div", { className: "flex items-center justify-between bg-primary-subtle rounded-lg p-3 border border-primary-light", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 16, className: "text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-primary", children: "Total Duration" }), _jsx("p", { className: "text-xs text-text-muted", children: "All selected slots" })] })] }), _jsx("span", { className: "font-semibold text-primary", children: formatDuration(booking.slots) })] })] })] }), _jsxs("div", { className: "border-t border-neutral-border bg-neutral-hover p-6", children: [_jsx("h3", { className: "font-semibold text-text-primary mb-4", children: "Price Breakdown" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm text-text-secondary", children: "Slot charges" }), _jsxs("span", { className: "font-medium text-text-primary", children: ["\u20B9", booking.slotTotal] })] }), _jsxs("p", { className: "text-xs text-text-muted", children: [booking.slots.length, " slot", booking.slots.length > 1 ? 's' : '', " \u00D7 \u20B9", booking.slots[0].price, " each"] })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-t border-neutral-border", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-text-secondary", children: "Platform fee" }), _jsx("p", { className: "text-xs text-text-muted", children: "Service charges & GST" })] }), _jsxs("span", { className: "font-medium text-text-primary", children: ["\u20B9", booking.platformFee] })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-text-secondary", children: [_jsx("span", { className: "font-semibold text-text-primary", children: "Total Amount" }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-xl font-bold text-text-primary", children: ["\u20B9", booking.amount] }), _jsx("p", { className: "text-xs text-text-muted", children: "Inclusive of all taxes" })] })] })] })] })] }), _jsx("div", { className: "bg-neutral-hover rounded-lg p-4 border border-neutral-border", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 bg-primary-subtle rounded-lg", children: _jsx(Shield, { size: 16, className: "text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-primary mb-1", children: "Secure Payment Guarantee" }), _jsx("p", { className: "text-xs text-text-secondary", children: "Your payment is secured with 256-bit SSL encryption. Platform fee is non-refundable." })] })] }) })] })] }))] }), _jsx("div", { className: "hidden md:block md:w-80 md:flex-shrink-0", children: booking && !loading && !error && (_jsxs("div", { className: "sticky top-24 bg-neutral-surface border border-neutral-border rounded-xl shadow-card p-6", children: [timeLeft > 0 && (_jsx("div", { className: "mb-6", children: _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-blue-100 rounded-lg p-2", children: _jsx(Clock, { size: 18, className: "text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-primary", children: "Complete payment in" }), _jsx("p", { className: "text-xs text-text-muted", children: "Slots reserved temporarily" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: formatTimeLeft(timeLeft) }), _jsx("p", { className: "text-xs text-text-muted", children: "mins:secs" })] })] }) }) })), timeLeft === 0 && (_jsx("div", { className: "mb-6", children: _jsx("div", { className: "bg-danger/10 border border-danger/20 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-danger flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-danger", children: "Time Expired" }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "Your reserved slots have been released." })] })] }) }) })), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Total Amount to Pay" }), _jsxs("p", { className: "text-3xl font-bold text-text-primary mb-2", children: ["\u20B9", booking.amount] }), _jsxs("div", { className: "flex items-center justify-center gap-4 text-sm text-text-muted mb-6", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { size: 14 }), formatDate(booking.slots[0].date)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { size: 14 }), booking.slots.length, " slot", booking.slots.length > 1 ? 's' : ''] })] })] }) }), _jsx("div", { className: "space-y-4", children: timeLeft > 0 ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleProceedToPayment, disabled: isProcessing, className: `w-full py-3.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isProcessing
                                                            ? 'bg-text-muted text-white cursor-not-allowed'
                                                            : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-subtle'}`, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Loading Payment..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { size: 16 }), "Pay \u20B9", booking.amount] })) }), _jsx("button", { onClick: handleCancel, className: "w-full py-3 text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98] border border-neutral-border", children: "Cancel" })] })) : timeLeft === 0 ? (_jsx("button", { onClick: () => navigate(-1), className: "w-full bg-danger text-white py-3 rounded-lg text-sm font-medium hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]", children: "Select Slots Again" })) : null })] })) })] }), _jsx("div", { className: "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-surface border-t border-neutral-border shadow-card", children: _jsx("div", { className: "p-4", children: booking && timeLeft > 0 ? (_jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleCancel, className: "px-5 py-3 text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98] border border-neutral-border flex-1", children: "Cancel" }), _jsx("button", { onClick: handleProceedToPayment, disabled: isProcessing, className: `flex-[2] py-3 px-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isProcessing
                                            ? 'bg-text-muted text-white cursor-not-allowed'
                                            : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-subtle'}`, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 16, className: "animate-spin" }), "Loading Payment..."] })) : (_jsxs(_Fragment, { children: [_jsx(CreditCard, { size: 16 }), "Pay \u20B9", booking.amount] })) })] })) : timeLeft === 0 && booking ? (_jsx("button", { onClick: () => navigate(-1), className: "w-full bg-danger text-white py-3 rounded-lg text-sm font-medium hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]", children: "Select Slots Again" })) : (_jsx("button", { disabled: true, className: "w-full bg-neutral-border text-text-muted py-3 rounded-lg text-sm font-medium cursor-not-allowed", children: loading ? 'Loading...' : 'Please Wait' })) }) })] }), showCancelModal && (_jsxs("div", { className: "fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-end md:items-center md:justify-center", children: [_jsx("div", { className: "absolute inset-0", onClick: () => setShowCancelModal(false) }), _jsxs("div", { className: "bg-neutral-surface w-full max-w-md rounded-t-[1.5rem] md:rounded-2xl flex flex-col relative z-10 shadow-xl animate-sheet-in", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "md:hidden flex justify-center pt-2 pb-1", children: _jsx("div", { className: "w-10 h-1 bg-neutral-border rounded-full" }) }), _jsxs("div", { className: "px-5 py-4 flex items-center justify-between border-b border-neutral-border flex-shrink-0", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold tracking-tight text-text-primary leading-tight", children: "Cancel Booking?" }), _jsx("p", { className: "text-text-muted text-xs font-medium mt-0.5", children: "Your slots will be released" })] }), _jsx("button", { onClick: () => setShowCancelModal(false), className: "p-1.5 bg-neutral-hover rounded-full text-text-muted hover:bg-neutral-border hover:text-text-primary transition-all duration-300 active:scale-95 hover:rotate-90", children: _jsx(X, { size: 18, className: "transition-transform duration-300" }) })] }), _jsxs("div", { className: "px-5 py-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(AlertCircle, { size: 24, className: "text-warning" }) }), _jsx("h3", { className: "text-sm font-semibold text-text-primary mb-2", children: "Release Reserved Slots?" }), _jsx("p", { className: "text-text-secondary text-sm", children: "Your slots will be released and made available for others. This action cannot be undone." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowCancelModal(false), className: "flex-1 py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98]", children: "Keep Slots" }), _jsx("button", { onClick: confirmCancel, className: "flex-1 py-3 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]", children: "Release Slots" })] })] })] })] }))] }));
}
