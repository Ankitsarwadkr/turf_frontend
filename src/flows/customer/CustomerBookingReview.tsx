import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createBooking, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine"
import { 
  ChevronLeft, Calendar, Clock, 
  Loader2, AlertCircle,
  Shield,
  CreditCard, MapPin, RefreshCw,
  Users, IndianRupee, X
} from "lucide-react"

type BookingResponse = {
  bookingId: string
  turfId: number
  slots: Array<{
    slotId: number
    date: string
    startTime: string
    endTime: string
    price: number
  }>
  slotTotal: number
  platformFee: number
  amount: number
  status: string
  turfName: string
  turfCity: string
  expiredAt: string
  message: string
}

type UserType = {
  name?: string
  email?: string
  phone?: string
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTimeSlot = (startTime: string, endTime: string) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

const formatDuration = (slots: Array<any>) => {
  return `${slots.length} hour${slots.length > 1 ? 's' : ''}`
}

// Utility function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }
    
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export default function CustomerBookingReview() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { turfId, slotIds } = location.state || {}
  
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  
  const bookingCreatedRef = useRef(false)
  
  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    if (!turfId || !slotIds) {
      navigate('/app/customer')
    }
  }, [turfId, slotIds, navigate])
  
  useEffect(() => {
    const createNewBooking = async () => {
      if (!turfId || !slotIds || bookingCreatedRef.current) return
      
      bookingCreatedRef.current = true
      setLoading(true)
      setError(null)
      
      try {
        const response = await createBooking({
          turfId,
          slotIds
        })
        
        await new Promise(resolve => setTimeout(resolve, 300))
        
        setBooking(response.data)
        
        // Timer calculation
        const expiredAt = new Date(response.data.expiredAt).getTime()
        const now = new Date().getTime()
        setTimeLeft(Math.max(0, Math.floor((expiredAt - now) / 1000)))
        
      } catch (err: any) {
        console.error('Booking creation failed:', err)
        bookingCreatedRef.current = false
        
        if (err.response?.status === 409) {
          setError('Selected slots are no longer available. Please choose different time slots.')
        } else if (err.response?.status === 401) {
          setError('Please login to continue with booking.')
        } else {
          setError('Unable to proceed with booking. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    createNewBooking()
  }, [turfId, slotIds])
  
  // Countdown timer
  useEffect(() => {
    if (!booking || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [booking, timeLeft])
  
  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  
  const handleProceedToPayment = async () => {
    if (!booking || timeLeft <= 0 || isProcessing) return
    
    // Check for Razorpay key
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    
    if (!razorpayKey || razorpayKey.trim() === '') {
      alert('Payment gateway is not configured. Please contact support.')
      console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await createRazorpayOrder(booking.bookingId)
      
      // Step 2: Load Razorpay script
      await loadRazorpayScript()
      
      // Step 3: Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount, // Already in paise from backend
        currency: orderResponse.data.currency || 'INR',
        name: 'TurfEra',
        description: `Booking for ${booking.turfName}`,
        order_id: orderResponse.data.razorpayOrderId,
        handler: async function (response: any) {
          // Step 4: Verify payment
          try {
            const verifyResponse = await verifyPayment({
              bookingId: booking.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
            
            if (verifyResponse.data.paymentStatus === 'SUCCESS') {
              navigate('/app/customer/payment-success', {
                state: {
                  bookingId: booking.bookingId,
                  amount: booking.amount,
                  turfName: booking.turfName,
                  slots: booking.slots,
                  paymentId: verifyResponse.data.paymentId
                }
              })
            } else {
              navigate('/app/customer/payment-failed', {
                state: {
                  bookingId: booking.bookingId,
                  message: verifyResponse.data.message
                }
              })
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            navigate('/app/customer/payment-failed', {
              state: {
                bookingId: booking.bookingId,
                message: 'Payment verification failed. Please contact support.'
              }
            })
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
          ondismiss: function() {
            setIsProcessing(false)
          }
        }
      }
      
      // Step 5: Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      setIsProcessing(false)
      
      // Handle specific errors
      if (error.response?.status === 404) {
        alert('Booking not found. Please try again.')
      } else if (error.response?.status === 403) {
        alert('This booking does not belong to you.')
      } else {
        alert('Failed to initiate payment. Please try again.')
      }
    }
  }
  
  const handleCancel = () => {
    if (booking && timeLeft > 0) {
      setShowCancelModal(true)
    } else {
      navigate(-1)
    }
  }
  
  const confirmCancel = () => {
    setShowCancelModal(false)
    navigate(-1)
  }
  
  const handleRetry = () => {
    bookingCreatedRef.current = false
    setError(null)
    setBooking(null)
    window.location.reload()
  }
  
  if (!turfId || !slotIds) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-neutral-bg px-4">
        <div className="text-center space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-danger" />
          </div>
          <div>
            <h2 className="text-page-title font-semibold tracking-tight text-text-primary mb-2">
              Booking Information Missing
            </h2>
            <p className="text-text-secondary text-sm">Please start over.</p>
          </div>
          <button
            onClick={() => navigate('/app/customer')}
            className="w-full py-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-bg">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-neutral-surface border-b border-neutral-border shrink-0">
          <div className="px-4 py-3 flex items-center max-w-6xl mx-auto">
            <button
              onClick={handleCancel}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-text-primary" />
            </button>
            <div className="ml-2">
              <h1 className="text-sm font-semibold tracking-tight text-text-primary">
                Review Booking
              </h1>
              <p className="text-text-muted text-xs font-medium">Confirm details and pay</p>
            </div>
          </div>
        </div>
        
        {/* Main Content - Desktop layout with sidebar */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:flex md:gap-6">
          {/* Left Content - Scrollable */}
          <div className="md:flex-1 md:overflow-y-auto md:pb-6">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                <p className="text-text-secondary font-medium">Securing your slots...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="bg-neutral-surface border border-neutral-border rounded-xl p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-danger" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-text-primary mb-2">
                      Unable to Proceed
                    </h2>
                    <p className="text-text-secondary text-sm">{error}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleRetry}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="px-5 py-2.5 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
                    >
                      Choose Different Slots
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Booking Success */}
            {booking && !loading && !error && (
              <>
                {/* Timer - Only show on mobile, desktop shows in sidebar */}
                <div className="md:hidden">
                  {timeLeft > 0 && (
                    <div className="mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-lg p-2">
                              <Clock size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">Complete payment in</p>
                              <p className="text-xs text-text-muted">Slots reserved temporarily</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{formatTimeLeft(timeLeft)}</p>
                            <p className="text-xs text-text-muted">mins:secs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Expired State */}
                  {timeLeft === 0 && (
                    <div className="mb-4">
                      <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-danger">Time Expired</p>
                            <p className="text-sm text-text-secondary mt-1">
                              Your reserved slots have been released. Please select them again to continue.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Main Content */}
                <div className="space-y-6">
                  {/* Total Price Card - Hidden on desktop, shown in sidebar */}
                  <div className="md:hidden bg-neutral-surface border border-neutral-border rounded-xl p-6 shadow-card">
                    <div className="text-center">
                      <p className="text-sm text-text-muted mb-1">Total Amount to Pay</p>
                      <p className="text-4xl font-bold text-text-primary mb-2">₹{booking.amount}</p>
                      <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(booking.slots[0].date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Details Card */}
                  <div className="bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-sm font-semibold tracking-tight text-text-primary mb-6">
                        Your Booking Details
                      </h2>
                      
                      {/* Venue Section */}
                      <div className="mb-6 pb-6 border-b border-neutral-border">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-text-primary">{booking.turfName}</h3>
                            <p className="text-text-secondary text-xs">{booking.turfCity}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Date & Time Section */}
                      <div className="space-y-4">
                        {/* Date */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-text-muted" />
                            <p className="text-sm font-medium text-text-secondary">Date</p>
                          </div>
                          <div className="bg-neutral-hover rounded-lg p-3">
                            <p className="font-medium text-text-primary">
                              {formatDate(booking.slots[0].date)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Time Slots */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-text-muted" />
                            <p className="text-sm font-medium text-text-secondary">Selected Time Slots</p>
                          </div>
                          <div className="space-y-2">
                            {booking.slots.map((slot, index) => (
                              <div 
                                key={slot.slotId}
                                className="flex items-center justify-between bg-neutral-hover rounded-lg p-3 hover:bg-neutral-surface transition-colors duration-250 border border-neutral-border hover:border-stone-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-md bg-primary-subtle flex items-center justify-center">
                                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-text-primary">
                                      {formatTimeSlot(slot.startTime, slot.endTime)}
                                    </p>
                                    <p className="text-xs text-text-muted">1 hour</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <IndianRupee size={14} className="text-text-muted" />
                                  <span className="font-semibold text-text-primary">{slot.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Duration Summary */}
                        <div className="flex items-center justify-between bg-primary-subtle rounded-lg p-3 border border-primary-light">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-primary" />
                            <div>
                              <p className="text-sm font-medium text-text-primary">Total Duration</p>
                              <p className="text-xs text-text-muted">All selected slots</p>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">
                            {formatDuration(booking.slots)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Breakdown */}
                    <div className="border-t border-neutral-border bg-neutral-hover p-6">
                      <h3 className="font-semibold text-text-primary mb-4">Price Breakdown</h3>
                      
                      <div className="space-y-3">
                        {/* Slot Charges */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-text-secondary">Slot charges</span>
                            <span className="font-medium text-text-primary">₹{booking.slotTotal}</span>
                          </div>
                          <p className="text-xs text-text-muted">
                            {booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''} × ₹{booking.slots[0].price} each
                          </p>
                        </div>
                        
                        {/* Platform Fee */}
                        <div className="flex items-center justify-between py-2 border-t border-neutral-border">
                          <div>
                            <span className="text-sm text-text-secondary">Platform fee</span>
                            <p className="text-xs text-text-muted">Service charges & GST</p>
                          </div>
                          <span className="font-medium text-text-primary">₹{booking.platformFee}</span>
                        </div>
                        
                        {/* Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-text-secondary">
                          <span className="font-semibold text-text-primary">Total Amount</span>
                          <div className="text-right">
                            <p className="text-xl font-bold text-text-primary">₹{booking.amount}</p>
                            <p className="text-xs text-text-muted">Inclusive of all taxes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Info */}
                  <div className="bg-neutral-hover rounded-lg p-4 border border-neutral-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary-subtle rounded-lg">
                        <Shield size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary mb-1">Secure Payment Guarantee</p>
                        <p className="text-xs text-text-secondary">
                          Your payment is secured with 256-bit SSL encryption. Platform fee is non-refundable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Right Sidebar - Desktop only */}
          <div className="hidden md:block md:w-80 md:flex-shrink-0">
            {booking && !loading && !error && (
              <div className="sticky top-24 bg-neutral-surface border border-neutral-border rounded-xl shadow-card p-6">
                {/* Timer for desktop */}
                {timeLeft > 0 && (
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-lg p-2">
                            <Clock size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">Complete payment in</p>
                            <p className="text-xs text-text-muted">Slots reserved temporarily</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{formatTimeLeft(timeLeft)}</p>
                          <p className="text-xs text-text-muted">mins:secs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Expired state for desktop */}
                {timeLeft === 0 && (
                  <div className="mb-6">
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-danger">Time Expired</p>
                          <p className="text-sm text-text-secondary mt-1">
                            Your reserved slots have been released.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Total Price for desktop sidebar */}
                <div className="mb-6">
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-1">Total Amount to Pay</p>
                    <p className="text-3xl font-bold text-text-primary mb-2">₹{booking.amount}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-text-muted mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(booking.slots[0].date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-4">
                  {timeLeft > 0 ? (
                    <>
                      <button
                        onClick={handleProceedToPayment}
                        disabled={isProcessing}
                        className={`w-full py-3.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          isProcessing
                            ? 'bg-text-muted text-white cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-subtle'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Loading Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            Pay ₹{booking.amount}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleCancel}
                        className="w-full py-3 text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98] border border-neutral-border"
                      >
                        Cancel
                      </button>
                    </>
                  ) : timeLeft === 0 ? (
                    <button
                      onClick={() => navigate(-1)}
                      className="w-full bg-danger text-white py-3 rounded-lg text-sm font-medium hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]"
                    >
                      Select Slots Again
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Footer - Only shows on mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-surface border-t border-neutral-border shadow-card">
          <div className="p-4">
            {booking && timeLeft > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98] border border-neutral-border flex-1"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  className={`flex-[2] py-3 px-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isProcessing
                      ? 'bg-text-muted text-white cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] shadow-subtle'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Pay ₹{booking.amount}
                    </>
                  )}
                </button>
              </div>
            ) : timeLeft === 0 && booking ? (
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-danger text-white py-3 rounded-lg text-sm font-medium hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]"
              >
                Select Slots Again
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-neutral-border text-text-muted py-3 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Please Wait'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-end md:items-center md:justify-center">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowCancelModal(false)}
          />
          
          <div 
            className="bg-neutral-surface w-full max-w-md rounded-t-[1.5rem] md:rounded-2xl flex flex-col relative z-10 shadow-xl animate-sheet-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-neutral-border rounded-full" />
            </div>

            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-border flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-text-primary leading-tight">Cancel Booking?</h2>
                <p className="text-text-muted text-xs font-medium mt-0.5">
                  Your slots will be released
                </p>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="p-1.5 bg-neutral-hover rounded-full text-text-muted hover:bg-neutral-border hover:text-text-primary transition-all duration-300 active:scale-95 hover:rotate-90"
              >
                <X size={18} className="transition-transform duration-300" />
              </button>
            </div>

            <div className="px-5 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-warning" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Release Reserved Slots?
                </h3>
                <p className="text-text-secondary text-sm">
                  Your slots will be released and made available for others. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover transition-all duration-200 active:scale-[0.98]"
                >
                  Keep Slots
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-3 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-all duration-200 active:scale-[0.98]"
                >
                  Release Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}