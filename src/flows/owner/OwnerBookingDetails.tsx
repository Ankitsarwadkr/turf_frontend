import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getOwnerBookingDetails } from "../../engine/ownerEngine"
import { 
  ChevronLeft, Calendar, Clock, MapPin, IndianRupee, User, Mail,
  Loader2, AlertCircle, CheckCircle, XCircle, Timer, Package,
  Phone, Navigation, ExternalLink
} from "lucide-react"

type BookingDetails = {
  bookingId: string
  turf: {
    id: number
    name: string
    city: string
    address: string
    image: string | null
  }
  customer: {
    name: string
    email: string
    phone?: string
  }
  amount: number
  status: string
  createdAt: string
  slots: {
    date: string
    startTime: string
    endTime: string
    price: number
  }[]
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
      return 'bg-green-50 text-success border-green-200'
    case 'PENDING_PAYMENT':
      return 'bg-yellow-50 text-warning border-yellow-200'
    case 'COMPLETED':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return 'bg-red-50 text-danger border-red-200'
    case 'EXPIRED':
      return 'bg-neutral-bg text-text-muted border-neutral-border'
    default:
      return 'bg-neutral-bg text-text-secondary border-neutral-border'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle size={20} />
    case 'PENDING_PAYMENT':
      return <Timer size={20} />
    case 'COMPLETED':
      return <CheckCircle size={20} />
    case 'CANCELLED_BY_CUSTOMER':
    case 'CANCELLED_BY_OWNER':
    case 'CANCELLED_BY_ADMIN':
      return <XCircle size={20} />
    case 'EXPIRED':
      return <XCircle size={20} />
    default:
      return <Package size={20} />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'Awaiting Payment'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED_BY_CUSTOMER':
      return 'Cancelled by Customer'
    case 'CANCELLED_BY_OWNER':
      return 'Cancelled by You'
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

const getDirectionsUrl = (address: string) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export default function OwnerBookingDetails() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getOwnerBookingDetails(bookingId!)
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

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/app/owner/bookings')}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-page-title font-semibold text-text-primary">Booking Details</h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
              <p className="text-text-secondary font-medium">Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-danger" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Error Loading Booking</h2>
              <p className="text-text-secondary mb-6">{error}</p>
              <button
                onClick={() => navigate('/app/owner/bookings')}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle"
              >
                Back to Bookings
              </button>
            </div>
          )}

          {/* Booking Details - Single Card */}
          {booking && !loading && !error && (
            <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-card overflow-hidden animate-fadeIn">
              
              {/* Booking ID & Status Header */}
              <div className="bg-neutral-bg border-b border-neutral-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1 font-semibold">Booking ID</p>
                    <p className="text-lg font-mono font-bold text-text-primary">{booking.bookingId}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary font-medium">Booked on {formatDateTime(booking.createdAt)}</p>
              </div>

              {/* Customer */}
              <div className="p-6 border-b border-neutral-border">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-3 font-semibold">Customer</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{booking.customer.name}</h2>
                  </div>
                </div>
                <div className="space-y-2 ml-15">
                  <a 
                    href={`mailto:${booking.customer.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors duration-200"
                  >
                    <Mail size={16} />
                    {booking.customer.email}
                  </a>
                  {booking.customer.phone && (
                    <a 
                      href={`tel:${booking.customer.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors duration-200"
                    >
                      <Phone size={16} />
                      {booking.customer.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Turf */}
              <div className="p-6 border-b border-neutral-border">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-3 font-semibold">Turf</p>
                <h3 className="text-lg font-bold text-text-primary mb-2">{booking.turf.name}</h3>
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="text-text-muted flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-sm text-text-secondary">
                    <p>{booking.turf.address}</p>
                    <p>{booking.turf.city}</p>
                  </div>
                </div>
                <a
                  href={getDirectionsUrl(`${booking.turf.address}, ${booking.turf.city}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-semibold transition-colors duration-200"
                >
                  <Navigation size={14} />
                  Get Directions
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Slots */}
              <div className="p-6 border-b border-neutral-border">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-4 font-semibold">Booked Slots</p>
                <div className="space-y-3">
                  {booking.slots.map((slot, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-bg rounded-xl hover:bg-neutral-hover transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                          <Clock size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{formatDate(slot.date)}</p>
                          <p className="text-xs text-text-secondary">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 font-bold text-text-primary">
                        <IndianRupee size={16} />
                        {slot.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-6 bg-neutral-bg">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-text-primary">Total Amount</span>
                  <div className="flex items-center gap-1 text-3xl font-bold text-text-primary">
                    <IndianRupee size={26} />
                    {booking.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}