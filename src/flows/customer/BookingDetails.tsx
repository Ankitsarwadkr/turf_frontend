// BookingDetails.tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getBookingDetails, cancelBooking, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine"
import { 
  ChevronLeft, Calendar, Clock, MapPin, IndianRupee,
  Loader2, AlertCircle, CheckCircle, XCircle, 
  Timer, Package, CreditCard, User, Phone,
  Mail, Navigation, ExternalLink, QrCode,
  Shield, Receipt, Image as ImageIcon
} from "lucide-react"

type SlotInfo = {
  date: string
  startTime: string
  endTime: string
  price: number
}

type BookingDetails = {
  bookingId: string
  turfId: number
  turfName: string
  turfCity: string
  turfAddress: string
  turfImage: string | null
  amount: number
  bookingStatus: string
  paymentStatus: string
  paymentId: string | null
  paymentMethod?: string
  slots: SlotInfo[]
  createdAt: string
  expireAt: string | null
  turfOwnerName?: string
  turfOwnerPhone?: string
  turfOwnerEmail?: string
}

type UserType = {
  name?: string
  email?: string
  phone?: string
}

const getImageUrl = (path: string | null): string => {
  if (!path) return ''
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  
  if (path.startsWith('http')) {
    return path
  }
  
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`
  }
  
  return `${API_BASE_URL}/${path}`
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-primary-light text-primary border border-primary/20'
    case 'PENDING_PAYMENT':
      return 'bg-warning/10 text-warning border border-warning/20'
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return 'bg-danger/10 text-danger border border-danger/20'
    case 'EXPIRED':
      return 'bg-neutral-hover text-text-muted border border-neutral-border'
    default:
      return 'bg-neutral-hover text-text-muted border border-neutral-border'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle size={20} className="text-primary" />
    case 'PENDING_PAYMENT':
      return <Timer size={20} className="text-warning" />
    case 'COMPLETED':
      return <CheckCircle size={20} className="text-success" />
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return <XCircle size={20} className="text-danger" />
    case 'EXPIRED':
      return <XCircle size={20} className="text-text-muted" />
    default:
      return <Package size={20} className="text-text-muted" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Awaiting Payment'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED_BY_CUSTOMER':
      return 'Cancelled by You'
    case 'CANCELLED_BY_OWNER':
      return 'Cancelled by Owner'
    case 'CANCELLED_BY_ADMIN':
      return 'Cancelled by Admin'
    case 'COMPLETED':
      return 'Completed'
    case 'EXPIRED':
      return 'Payment Expired'
    default:
      return status
  }
}

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

export default function CustomerBookingDetails() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [animateAmount, setAnimateAmount] = useState(false)
  const [canCancel, setCanCancel] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])
  
  useEffect(() => {
    if (booking?.amount) {
      setAnimateAmount(true)
      const timer = setTimeout(() => setAnimateAmount(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [booking?.amount])
  
  useEffect(() => {
    if (booking?.slots?.length > 0) {
      const canCancelBooking = checkIfCanCancel(booking.slots)
      setCanCancel(canCancelBooking)
    }
  }, [booking])
  
  const checkIfCanCancel = (slots: SlotInfo[]): boolean => {
    if (!slots || slots.length === 0) return false
    
    const firstSlot = slots[0]
    const slotStartTime = new Date(`${firstSlot.date}T${firstSlot.startTime}`)
    const currentTime = new Date()
    
    const timeDiffHours = (slotStartTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
    
    return timeDiffHours > 4
  }
  
  const fetchBookingDetails = async () => {
    setLoading(true)
    setError(null)
    setImageError(false)
    setImageLoading(true)
    
    try {
      const response = await getBookingDetails(bookingId!)
      setBooking(response.data)
    } catch (err: any) {
      console.error('Failed to fetch booking details:', err)
      
      if (err.response?.status === 404) {
        setError('Booking not found.')
      } else if (err.response?.status === 403) {
        setError('You do not have access to this booking.')
      } else {
        setError('Unable to load booking details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelBooking = async () => {
    if (!booking) return
    
    if (!canCancel) {
      return
    }
    
    setCancelling(true)
    setShowCancelConfirm(false)
    
    try {
      await cancelBooking(booking.bookingId)
      await fetchBookingDetails()
    } catch (err: any) {
      console.error('Failed to cancel booking:', err)
      alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
    }
  }
  
  const handleCompletePayment = async () => {
    if (!booking) return
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    
    if (!razorpayKey || razorpayKey.trim() === '') {
      alert('Payment gateway is not configured. Please contact support.')
      console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID')
      return
    }
    
    setPaymentProcessing(true)
    
    try {
      const orderResponse = await createRazorpayOrder(booking.bookingId)
      await loadRazorpayScript()
      
      const userData = localStorage.getItem('user')
      const user: UserType = userData ? JSON.parse(userData) : {}
      
      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency || 'INR',
        name: 'TurfEra',
        description: `Payment for ${booking.turfName}`,
        order_id: orderResponse.data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await verifyPayment({
              bookingId: booking.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
            
            if (verifyResponse.data.paymentStatus === 'SUCCESS') {
              await fetchBookingDetails()
              alert('Payment successful! Your booking is confirmed.')
            } else {
              alert('Payment verification failed. Please contact support.')
              await fetchBookingDetails()
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          } finally {
            setPaymentProcessing(false)
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
          ondismiss: function() {
            setPaymentProcessing(false)
          }
        }
      }
      
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      setPaymentProcessing(false)
      
      if (error.response?.status === 404) {
        alert('Booking not found. Please try again.')
      } else if (error.response?.status === 403) {
        alert('This booking does not belong to you.')
      } else {
        alert('Failed to initiate payment. Please try again.')
      }
    }
  }
  
  const getDirectionsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }
  
  const showPaymentButton = () => {
    if (!booking) return false
    return booking.bookingStatus === 'PENDING_PAYMENT'
  }
  
  const showCancelButton = () => {
    if (!booking) return false
    
    const validStatus = booking.bookingStatus === 'CONFIRMED' || 
                       booking.bookingStatus === 'PENDING_PAYMENT'
    
    return validStatus && canCancel
  }
  
  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="sticky top-0 z-50 bg-neutral-surface border-b border-neutral-border shadow-subtle">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth active:scale-95"
            >
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
            <div className="ml-3">
              <h1 className="text-page-title text-text-primary">Booking Details</h1>
              {booking && (
                <p className="text-xs text-text-muted font-mono mt-0.5">{booking.bookingId}</p>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="pb-28">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
            <p className="text-text-secondary">Loading booking details...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="px-4 py-6 animate-fadeIn">
            <div className="bg-neutral-surface rounded-2xl border border-neutral-border shadow-card p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-scaleIn">
                  <AlertCircle className="h-8 w-8 text-danger" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-2">Error Loading Booking</h2>
                  <p className="text-text-secondary">{error}</p>
                </div>
                <button
                  onClick={() => navigate('/app/customer/bookings')}
                  className="px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-sm active:scale-[0.98]"
                >
                  Back to Bookings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {booking && !loading && !error && (
          <div className="space-y-5 p-4 animate-slideUp">
            <div className={`rounded-2xl border p-5 ${getStatusColor(booking.bookingStatus)} shadow-card`}>
              <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0">
                  {getStatusIcon(booking.bookingStatus)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-text-primary">{getStatusText(booking.bookingStatus)}</h3>
                  {booking.bookingStatus === 'CONFIRMED' && (
                    <p className="text-sm text-text-secondary mt-1.5">
                      Your booking is confirmed. See you there!
                    </p>
                  )}
                  {booking.bookingStatus === 'PENDING_PAYMENT' && booking.expireAt && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-warning inline-flex items-center gap-1.5">
                        <Timer size={14} />
                        Expires: {formatDateTime(booking.expireAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-surface rounded-2xl border border-neutral-border shadow-card overflow-hidden animate-fadeIn">
              {booking.turfImage ? (
                <div className="relative h-52 w-full bg-neutral-hover overflow-hidden">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-hover via-neutral-border/50 to-neutral-hover animate-shimmer bg-[length:200%_100%]" />
                  )}
                  {!imageError ? (
                    <img
                      src={getImageUrl(booking.turfImage)}
                      alt={booking.turfName}
                      className="w-full h-full object-cover transition-all duration-350 smooth"
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageError(true)
                        setImageLoading(false)
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-hover">
                      <div className="text-center text-text-muted">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-sm">Image unavailable</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-52 w-full bg-neutral-hover flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-text-muted" />
                </div>
              )}
              
              <div className="p-5">
                <h2 className="text-xl font-bold text-text-primary mb-4">{booking.turfName}</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="text-text-muted flex-shrink-0 mt-1" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary mb-1.5">Location</p>
                      <p className="font-medium text-text-primary mb-1.5">{booking.turfAddress}</p>
                      <p className="text-sm text-text-secondary">{booking.turfCity}</p>
                      <a
                        href={getDirectionsUrl(`${booking.turfAddress}, ${booking.turfCity}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm mt-3 transition-colors duration-250"
                      >
                        <Navigation size={14} />
                        Get Directions
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  {(booking.turfOwnerName || booking.turfOwnerPhone) && (
                    <div className="pt-4 border-t border-neutral-border">
                      <div className="flex items-start gap-3.5">
                        <User className="text-text-muted flex-shrink-0 mt-1" size={18} />
                        <div>
                          <p className="text-sm text-text-secondary mb-2.5">Turf Contact</p>
                          {booking.turfOwnerName && (
                            <p className="font-semibold text-text-primary mb-2.5">{booking.turfOwnerName}</p>
                          )}
                          <div className="space-y-2">
                            {booking.turfOwnerPhone && (
                              <a 
                                href={`tel:${booking.turfOwnerPhone}`}
                                className="flex items-center gap-2 text-primary hover:text-primary-hover text-sm transition-colors duration-250"
                              >
                                <Phone size={14} />
                                {booking.turfOwnerPhone}
                              </a>
                            )}
                            {booking.turfOwnerEmail && (
                              <a 
                                href={`mailto:${booking.turfOwnerEmail}`}
                                className="flex items-center gap-2 text-primary hover:text-primary-hover text-sm transition-colors duration-250"
                              >
                                <Mail size={14} />
                                {booking.turfOwnerEmail}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-surface rounded-2xl border border-neutral-border shadow-card p-5 animate-fadeIn">
              <h3 className="font-semibold text-text-primary mb-5 flex items-center gap-2.5">
                <Calendar size={18} className="text-text-muted" />
                Booking Timeline
              </h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-4">Selected Slots</p>
                  <div className="space-y-3">
                    {booking.slots.map((slot, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-neutral-subtle rounded-xl border border-neutral-border hover:bg-neutral-hover transition-all duration-250 smooth group animate-date-bounce"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div>
                          <p className="font-semibold text-text-primary group-hover:text-text-accent transition-colors duration-250">
                            {formatDate(slot.date)}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold animate-number-count">
                          <IndianRupee size={14} />
                          <span>{slot.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-neutral-border">
                  <div className="flex items-center gap-3.5">
                    <Clock size={18} className="text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-secondary">Booked On</p>
                      <p className="font-semibold text-text-primary">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-surface rounded-2xl border border-neutral-border shadow-card overflow-hidden animate-fadeIn">
              <div className="p-5">
                <h3 className="font-semibold text-text-primary mb-5 flex items-center gap-2.5">
                  <Receipt size={18} className="text-text-muted" />
                  Payment Summary
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total Amount</span>
                    <div className={`flex items-center gap-1 transition-all duration-500 premium ${animateAmount ? 'animate-price-rise' : ''}`}>
                      <IndianRupee size={20} className="text-text-primary" />
                      <span className={`text-3xl font-bold text-text-primary ${animateAmount ? 'text-primary' : ''}`}>
                        {booking.amount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
                    <span className="text-text-secondary">Payment Status</span>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-250 ${
                      booking.paymentStatus === 'SUCCESS' 
                        ? 'bg-success/10 text-success border border-success/20' 
                        : booking.paymentStatus === 'FAILED'
                        ? 'bg-danger/10 text-danger border border-danger/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                    }`}>
                      {booking.paymentStatus === 'SUCCESS' ? 'Paid' : 
                       booking.paymentStatus === 'FAILED' ? 'Failed' : 
                       'Pending'}
                    </span>
                  </div>
                  
                  {booking.paymentMethod && (
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
                      <span className="text-text-secondary">Payment Method</span>
                      <div className="flex items-center gap-2.5">
                        <CreditCard size={16} className="text-text-muted" />
                        <span className="text-sm font-semibold text-text-primary">
                          {booking.paymentMethod}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {booking.paymentId && (
                    <div className="pt-4 border-t border-neutral-border">
                      <p className="text-sm text-text-secondary mb-2">Transaction ID</p>
                      <p className="font-mono text-sm text-text-primary break-all bg-neutral-hover p-3 rounded-lg border border-neutral-border">
                        {booking.paymentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-subtle border-t border-neutral-border p-4">
                <div className="flex items-start gap-2.5">
                  <Shield size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary">
                    Your payment is secured with Razorpay. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4.5 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1.5">Need Help?</p>
                  <p className="text-xs text-blue-800/80">
                    Contact the turf owner directly or reach out to our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {booking && !loading && !error && (showPaymentButton() || showCancelButton()) && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-surface border-t border-neutral-border shadow-premium p-4 animate-summary-slide">
          <div className="max-w-2xl mx-auto space-y-2.5">
            {showPaymentButton() && (
              <button
                onClick={handleCompletePayment}
                disabled={paymentProcessing}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-350 premium shadow-premium ${
                  paymentProcessing
                    ? 'bg-text-muted cursor-wait'
                    : 'bg-primary hover:bg-primary-hover active:scale-[0.98] hover:shadow-card-hover'
                }`}
              >
                {paymentProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <QrCode size={16} />
                    <span>Pay ₹{booking.amount}</span>
                  </div>
                )}
              </button>
            )}
            
            {showCancelButton() && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-250 smooth flex items-center justify-center gap-2 ${
                  cancelling
                    ? 'bg-neutral-hover text-text-muted cursor-wait'
                    : 'bg-neutral-surface text-danger border border-danger/30 hover:bg-danger/5 active:scale-[0.98]'
                }`}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Cancel Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Cancel Confirmation Modal/Bottom Sheet */}
      {showCancelConfirm && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
            onClick={() => setShowCancelConfirm(false)}
          />
          
          {/* Desktop Modal */}
          <div className="hidden md:block fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-neutral-surface rounded-2xl shadow-premium max-w-md w-full p-6 pointer-events-auto animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-danger" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Cancel Booking?</h3>
                  <p className="text-sm text-text-secondary">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-neutral-surface text-text-primary border border-neutral-border rounded-xl font-medium text-sm hover:bg-neutral-hover transition-all duration-250 smooth active:scale-[0.98]"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger/90 transition-all duration-250 smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                >
                  {cancelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Bottom Sheet */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-auto">
            <div 
              className="bg-neutral-surface rounded-t-3xl shadow-premium p-6 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-neutral-border rounded-full mx-auto mb-6" />
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-danger" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Cancel Booking?</h3>
                  <p className="text-sm text-text-secondary">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="w-full py-3 px-4 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger/90 transition-all duration-250 smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                >
                  {cancelling ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full py-3 px-4 bg-neutral-surface text-text-primary border border-neutral-border rounded-xl font-medium text-sm hover:bg-neutral-hover transition-all duration-250 smooth active:scale-[0.98]"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}