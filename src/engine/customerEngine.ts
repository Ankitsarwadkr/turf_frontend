import { api } from "../shared/api"

// ============================================
// PUBLIC APIs (No Auth Required)
// ============================================

export const getPublicTurfs = () =>
  api.get("/public/turfs")

export const getPublicTurfById = (id: number) =>
  api.get(`/public/turfs/${id}`)

// ============================================
// CUSTOMER APIs (Auth Required)
// ============================================

export const getCustomerSlots = (turfId: number, date: string) =>
  api.get(`/customer/turfs/${turfId}/slots`, { params: { date } })

export const createBooking = (data: { turfId: number; slotIds: number[] }) =>
  api.post("/customer/bookings/create", data)

// ============================================
// PAYMENT APIs (Auth Required)
// ============================================

export const createRazorpayOrder = (bookingId: string) =>
  api.post(`/customer/payments/order/${bookingId}`)

export const verifyPayment = (data: {
  bookingId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) =>
  api.post("/customer/payments/verify", data)

  export const getMyBookings = () =>
  api.get("/customer/bookings/my")

/**
 * Get Booking Details
 * GET /api/customer/bookings/{bookingId}
 */
export const getBookingDetails = (bookingId: string) =>
  api.get(`/customer/bookings/${bookingId}`)

/**
 * Get Booking Status
 * GET /api/customer/bookings/{bookingId}/status
 */
export const getBookingStatus = (bookingId: string) =>
  api.get(`/customer/bookings/${bookingId}/status`)

/**
 * Cancel Booking
 * POST /api/customer/bookings/{bookingId}/cancel
 */
export const cancelBooking = (bookingId: string) =>
  api.post(`/customer/bookings/${bookingId}/cancel`)