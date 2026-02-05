import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyBookings, createRazorpayOrder, verifyPayment } from "../../engine/customerEngine"
import { 
  Calendar, Clock, MapPin, IndianRupee,
  Loader2, AlertCircle, ChevronRight,
  CheckCircle, XCircle, Timer, Package
} from "lucide-react"

type SlotInfo = {
  date: string
  startTime: string
  endTime: string
}

type BookingListItem = {
  bookingId: string
  turfId: number
  turfName: string
  turfCity: string
  amount: number
  bookingStatus: string
  paymentStatus: string
  slots: SlotInfo[]
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
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatCompactDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-success/10 text-success border-success/20'
    case 'PENDING_PAYMENT':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return 'bg-danger/10 text-danger border-danger/20'
    case 'EXPIRED':
      return 'bg-text-muted/10 text-text-muted border-neutral-border'
    default:
      return 'bg-neutral-hover text-text-secondary border-neutral-border'
  }
}

const getStatusIcon = (status: string, size: number = 16) => {
  const props = { size }
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle {...props} />
    case 'PENDING_PAYMENT':
      return <Timer {...props} />
    case 'COMPLETED':
      return <CheckCircle {...props} />
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return <XCircle {...props} />
    case 'EXPIRED':
      return <XCircle {...props} />
    default:
      return <Package {...props} />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Pending Payment'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED_BY_CUSTOMER':
      return 'Cancelled'
    case 'CANCELLED_BY_OWNER':
      return 'Cancelled by Owner'
    case 'CANCELLED_BY_ADMIN':
      return 'Cancelled by Admin'
    case 'COMPLETED':
      return 'Completed'
    case 'EXPIRED':
      return 'Expired'
    default:
      return status
  }
}

const getShortStatus = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Pending'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status.slice(0, 3)
  }
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

export default function CustomerBookings() {
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all')
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null)
  
  useEffect(() => {
    fetchBookings()
  }, [])
  
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getMyBookings()
      setBookings(response.data)
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err)
      setError('Unable to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCompletePayment = async (booking: BookingListItem) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    
    if (!razorpayKey || razorpayKey.trim() === '') {
      alert('Payment gateway is not configured. Please contact support.')
      console.error('Razorpay key is missing. Check your .env file for VITE_RAZORPAY_KEY_ID')
      return
    }
    
    setPayingBookingId(booking.bookingId)
    
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await createRazorpayOrder(booking.bookingId)
      
      // Step 2: Load Razorpay script
      await loadRazorpayScript()
      
      // Get user data
      const userData = localStorage.getItem('user')
      const user: UserType = userData ? JSON.parse(userData) : {}
      
      // Step 3: Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: orderResponse.data.amount, // Already in paise from backend
        currency: orderResponse.data.currency || 'INR',
        name: 'TurfEra',
        description: `Payment for ${booking.turfName}`,
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
              // Refresh bookings list to show updated status
              await fetchBookings()
              
              // Show success message
              alert('Payment successful! Your booking is confirmed.')
              
              // Navigate to booking details
              navigate(`/app/customer/bookings/${booking.bookingId}`)
            } else {
              alert('Payment verification failed. Please contact support.')
              navigate(`/app/customer/bookings/${booking.bookingId}`)
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          } finally {
            setPayingBookingId(null)
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
            setPayingBookingId(null)
          }
        }
      }
      
      // Step 5: Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
      
    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      setPayingBookingId(null)
      
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
  
  const filteredBookings = bookings.filter(booking => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const bookingDate = new Date(booking.slots[0]?.date)
    
    if (filter === 'today') {
      return bookingDate.toDateString() === today.toDateString() &&
             (booking.bookingStatus === 'CONFIRMED' || 
              booking.bookingStatus === 'PENDING_PAYMENT')
    }
    
    if (filter === 'upcoming') {
      return bookingDate >= today && 
             (booking.bookingStatus === 'CONFIRMED' || 
              booking.bookingStatus === 'PENDING_PAYMENT')
    }
    
    if (filter === 'past') {
      return bookingDate < today || 
             booking.bookingStatus === 'COMPLETED' ||
             booking.bookingStatus === 'CANCELLED_BY_CUSTOMER' ||
             booking.bookingStatus === 'CANCELLED_BY_OWNER' ||
             booking.bookingStatus === 'CANCELLED_BY_ADMIN' ||
             booking.bookingStatus === 'EXPIRED'
    }
    
    return true // 'all'
  })
  
  return (
    <div className="min-h-screen min-h-[100dvh] bg-neutral-bg">
      {/* Header */}
      <div className="bg-neutral-surface border-b border-neutral-border sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-page-title font-semibold tracking-tight text-text-primary">My Bookings</h1>
          <p className="text-text-muted text-xs font-medium mt-1">
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>
        
        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${
              filter === 'today'
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${
              filter === 'upcoming'
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${
              filter === 'past'
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-neutral-hover text-text-primary hover:bg-neutral-surface border border-neutral-border'
            }`}
          >
            Past
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 pb-20">
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
            <p className="text-text-secondary font-medium">Loading bookings...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-neutral-surface border border-neutral-border rounded-xl p-6 shadow-card">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-text-primary mb-2">Error Loading Bookings</h2>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
              <button
                onClick={fetchBookings}
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-neutral-surface border border-neutral-border rounded-xl p-8 shadow-card">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-neutral-hover rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-text-muted" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-text-primary mb-2">
                  {filter === 'all' ? 'No Bookings Yet' : 
                   filter === 'today' ? 'No Bookings Today' :
                   filter === 'upcoming' ? 'No Upcoming Bookings' : 
                   'No Past Bookings'}
                </h2>
                <p className="text-text-secondary text-sm">
                  {filter === 'all' ? 'Start booking your favorite turfs!' : 
                   filter === 'today' ? 'No bookings scheduled for today' :
                   filter === 'upcoming' ? 'Book a turf to see it here' : 
                   'Your completed bookings will appear here'}
                </p>
              </div>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/app/customer')}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle"
                >
                  Browse Turfs
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Bookings List */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-2">
            {filteredBookings.map((booking) => {
              const isPayingThisBooking = payingBookingId === booking.bookingId
              
              return (
                <div
                  key={booking.bookingId}
                  onClick={() => navigate(`/app/customer/bookings/${booking.bookingId}`)}
                  className="bg-neutral-surface border border-neutral-border rounded-lg p-3 hover:shadow-card-hover transition-all duration-300 cursor-pointer relative hover:border-stone-300 active:scale-[0.99]"
                >
                  {/* Header - Compact */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-sm font-semibold tracking-tight text-text-primary truncate">
                        {booking.turfName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                        <MapPin size={12} />
                        <span className="truncate">{booking.turfCity}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge - Compact */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${
                        getStatusColor(booking.bookingStatus)
                      }`}
                    >
                      {getStatusIcon(booking.bookingStatus, 12)}
                      <span className="hidden sm:inline">
                        {getStatusText(booking.bookingStatus)}
                      </span>
                      <span className="sm:hidden">
                        {getShortStatus(booking.bookingStatus)}
                      </span>
                    </span>
                  </div>
                  
                  {/* Booking Info - Compact Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Calendar size={12} className="text-text-muted flex-shrink-0" />
                      <span className="truncate">
                        {formatCompactDate(booking.slots[0].date)}
                      </span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Clock size={12} className="text-text-muted flex-shrink-0" />
                      <span className="truncate">
                        {formatTime(booking.slots[0].startTime)}
                      </span>
                    </div>
                    
                    {/* Amount */}
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <IndianRupee size={12} className="text-text-muted flex-shrink-0" />
                      <span className="font-semibold">₹{booking.amount}</span>
                    </div>
                    
                    {/* Slots Count */}
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <span>
                        {booking.slots.length} slot{booking.slots.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Action for Pending Payment */}
                  {booking.bookingStatus === 'PENDING_PAYMENT' && (
                    <div className="pt-2 border-t border-neutral-border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCompletePayment(booking)
                        }}
                        disabled={isPayingThisBooking}
                        className={`w-full py-1.5 text-xs font-medium rounded transition-all duration-200 active:scale-[0.98] ${
                          isPayingThisBooking
                            ? 'bg-text-muted text-white cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-hover'
                        }`}
                      >
                        {isPayingThisBooking ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Loading Payment...
                          </span>
                        ) : (
                          'Complete Payment'
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Booking ID */}
                  <div className="pt-2 border-t border-neutral-border mt-2">
                    <span className="text-xs text-text-muted font-mono truncate block">
                      ID: {booking.bookingId}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}