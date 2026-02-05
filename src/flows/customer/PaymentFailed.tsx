import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { XCircle, Home, HelpCircle, Mail, Phone } from "lucide-react"

export default function PaymentFailed() {
  const location = useLocation()
  const navigate = useNavigate()
  const [animate, setAnimate] = useState(false)
  
  const { bookingId, message, errorType } = location.state || {}
  
  // Redirect if accessed directly without error context
  useEffect(() => {
    if (!location.state) {
      navigate('/app/customer', { replace: true })
    }
  }, [location.state, navigate])
  
  // Trigger animation on mount
  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
  }, [])
  
  // Determine user-friendly message
  const getUserMessage = () => {
    if (errorType === 'VERIFICATION_FAILED') {
      return 'Payment verification failed. Please contact support.'
    }
    if (errorType === 'PAYMENT_TIMEOUT') {
      return 'Payment timed out. Please try booking again.'
    }
    return message || 'Payment could not be completed'
  }
  
  // Determine detailed explanation
  const getDetailedExplanation = () => {
    if (errorType === 'VERIFICATION_FAILED') {
      return 'The payment gateway could not verify your transaction. If money was deducted, it will be refunded within 5-7 working days.'
    }
    return 'Your payment was not successful. The booking slots have been released and are available for others to book.'
  }
  
  // Don't render if no state (will redirect)
  if (!location.state) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-neutral-bg px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Failure Card */}
        <div className={`bg-neutral-surface border border-neutral-border rounded-xl shadow-card overflow-hidden mb-6 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-danger to-danger/90 p-8 text-center">
            <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${animate ? 'scale-100' : 'scale-0'}`}>
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-page-title font-semibold tracking-tight text-white mb-2">Payment Failed</h1>
            <p className="text-white/90 text-sm">{getUserMessage()}</p>
          </div>
          
          <div className="p-6">
            {/* Info Box */}
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger mb-1">What happened?</p>
                  <p className="text-sm text-text-secondary">
                    {getDetailedExplanation()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Booking ID if available */}
            {bookingId && (
              <div className="bg-neutral-hover rounded-lg p-4 mb-6 border border-neutral-border">
                <p className="text-xs text-text-muted mb-1">Booking Reference</p>
                <p className="font-mono font-semibold text-text-primary text-sm">{bookingId}</p>
                <p className="text-xs text-text-muted mt-2">
                  Keep this ID handy when contacting support
                </p>
              </div>
            )}
            
            {/* Refund Notice */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-text-secondary">
                💳 If any amount was deducted, it will be automatically refunded to your source account within 5-7 working days.
              </p>
            </div>
            
            {/* Support Contact */}
            <div className="border-t border-neutral-border pt-4">
              <p className="text-sm font-medium text-text-primary mb-3">Need help?</p>
              <div className="space-y-2">
                <a 
                  href="mailto:support@turfera.com" 
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  <Mail size={16} className="text-text-muted" />
                  <span>support@turfera.com</span>
                </a>
                <a 
                  href="tel:+911234567890" 
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  <Phone size={16} className="text-text-muted" />
                  <span>+91 1234 567 890</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Simplified */}
        <div className="space-y-3">
          {/* PRIMARY ACTION */}
          <button
            onClick={() => navigate('/app/customer')}
            className="w-full py-3.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-subtle flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Browse Turfs Again
          </button>
          
          {/* SECONDARY ACTION */}
          <button
            onClick={() => navigate('/app/customer/bookings')}
            className="w-full py-3 bg-neutral-surface border border-neutral-border text-text-primary text-sm font-medium rounded-lg hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
          >
            View My Bookings
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-muted">
            Common reasons: Insufficient funds, network issues, or payment timeout
          </p>
        </div>
      </div>
    </div>
  )
}