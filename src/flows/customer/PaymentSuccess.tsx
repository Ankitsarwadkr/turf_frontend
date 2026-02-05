import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle, Calendar, Clock, MapPin, Home, ChevronDown, ChevronUp } from "lucide-react"

export default function PaymentSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showIds, setShowIds] = useState(false)
  const [animate, setAnimate] = useState(false)
  
  const { 
    bookingId, 
    amount, 
    turfName, 
    slots,
    paymentId 
  } = location.state || {}
  
  // Redirect if no booking data (page refresh/direct access)
  useEffect(() => {
    if (!bookingId || !amount || !turfName || !slots) {
      navigate('/app/customer/bookings', { replace: true })
    }
  }, [bookingId, amount, turfName, slots, navigate])
  
  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
  }, [])
  
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
  
  // Don't render if data is missing (will redirect)
  if (!bookingId || !amount || !turfName || !slots) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-neutral-bg px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Success Card */}
        <div className={`bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden mb-6 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-primary to-primary-hover p-8 text-center">
            <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${animate ? 'scale-100' : 'scale-0'}`}>
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-page-title font-semibold tracking-tight text-white mb-2">Payment Successful!</h1>
            <p className="text-white/90 text-sm">Your booking has been confirmed</p>
          </div>
          
          <div className="p-6">
            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-sm text-text-muted">Total Amount Paid</p>
              <p className="text-4xl font-bold text-text-primary mt-1">₹{amount}</p>
            </div>
            
            {/* Important Info Box - Moved Up */}
            <div className="mb-6 p-4 bg-primary-subtle rounded-lg border border-primary-light">
              <p className="text-sm text-primary text-center leading-relaxed">
                📧 Confirmation email sent to your registered email.
                <br />
                ⏰ Please arrive 15 minutes before your scheduled time.
              </p>
            </div>
            
            {/* Details Grid */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-neutral-hover rounded-lg border border-neutral-border">
                <div className="w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Date</p>
                  <p className="text-sm font-semibold text-text-primary">{formatDate(slots[0]?.date || '')}</p>
                </div>
              </div>
              
              {/* Individual Time Slots */}
              <div className="p-3 bg-neutral-hover rounded-lg border border-neutral-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Time Slots</p>
                  </div>
                  <span className="ml-auto text-xs bg-primary-subtle text-primary px-2 py-1 rounded font-medium">
                    {slots.length} slot{slots.length > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-2 ml-10">
                  {slots.map((slot: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span className="font-medium text-text-primary">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-neutral-hover rounded-lg border border-neutral-border">
                <div className="w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted mb-1">Venue</p>
                  <p className="text-sm font-semibold text-text-primary">{turfName}</p>
                </div>
              </div>
            </div>
            
            {/* Collapsible IDs - De-emphasized */}
            <div className="border-t border-neutral-border pt-4">
              <button
                onClick={() => setShowIds(!showIds)}
                className="w-full flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-all duration-200"
              >
                <span>Booking Details</span>
                {showIds ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showIds && (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booking ID</span>
                    <span className="font-mono text-text-secondary">{bookingId}</span>
                  </div>
                  {paymentId && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment ID</span>
                      <span className="font-mono text-text-secondary">{paymentId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Correct Priority */}
        <div className="space-y-3">
          {/* PRIMARY ACTION */}
          <button
            onClick={() => navigate('/app/customer/bookings')}
            className="w-full py-3.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle"
          >
            View My Bookings
          </button>
          
          {/* SECONDARY ACTION */}
          <button
            onClick={() => navigate('/app/customer')}
            className="w-full py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}