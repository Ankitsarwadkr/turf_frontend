import { api } from "../shared/api";
// ============================================
// PUBLIC APIs (No Auth Required)
// ============================================
export const getPublicTurfs = () => api.get("/public/turfs");
export const getPublicTurfById = (id) => api.get(`/public/turfs/${id}`);
// ============================================
// CUSTOMER APIs (Auth Required)
// ============================================
export const getCustomerSlots = (turfId, date) => api.get(`/customer/turfs/${turfId}/slots`, { params: { date } });
export const createBooking = (data) => api.post("/customer/bookings/create", data);
// ============================================
// PAYMENT APIs (Auth Required)
// ============================================
export const createRazorpayOrder = (bookingId) => api.post(`/customer/payments/order/${bookingId}`);
export const verifyPayment = (data) => api.post("/customer/payments/verify", data);
export const getMyBookings = () => api.get("/customer/bookings/my");
/**
 * Get Booking Details
 * GET /api/customer/bookings/{bookingId}
 */
export const getBookingDetails = (bookingId) => api.get(`/customer/bookings/${bookingId}`);
/**
 * Get Booking Status
 * GET /api/customer/bookings/{bookingId}/status
 */
export const getBookingStatus = (bookingId) => api.get(`/customer/bookings/${bookingId}/status`);
/**
 * Cancel Booking
 * POST /api/customer/bookings/{bookingId}/cancel
 */
export const cancelBooking = (bookingId) => api.post(`/customer/bookings/${bookingId}/cancel`);
