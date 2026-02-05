import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  getExecutionDetails, markExecutionPaid, markExecutionFailed, retryExecution 
} from "../../engine/adminEngine"
import { 
  ChevronLeft, DollarSign, User, Calendar, CheckCircle, XCircle, 
  Clock, AlertCircle, Loader2, RefreshCw, ExternalLink,
  FileText, CreditCard, AlertTriangle, History as HistoryIcon
} from "lucide-react"

type ExecutionDetails = {
  executionId: number
  batchId: number
  ownerId: number
  ownerName: string
  amount: number
  status: string
  failureCode: string | null
  failureReason: string | null
  failedAt: string | null
  failedBy: number | null
  retryCount: number
  lastRetryAt: string | null
  paidAt: string | null
  paidBy: number | null
  paymentReference: string | null
  createdAt: string
  lastActivity: string
  failureHistory: Array<{
    attemptNumber: number
    failureCode: string
    failureReason: string
    failedAt: string
    failedBy: number
  }>
}

export default function PayoutExecutionDetails() {
  const { executionId } = useParams<{ executionId: string }>()
  const navigate = useNavigate()
  const [execution, setExecution] = useState<ExecutionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showPaidForm, setShowPaidForm] = useState(false)
  const [showFailedForm, setShowFailedForm] = useState(false)
  const [showRetryForm, setShowRetryForm] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')
  const [failureCode, setFailureCode] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [retryNote, setRetryNote] = useState('')

  useEffect(() => {
    if (executionId) {
      fetchExecution()
    }
  }, [executionId])

  const fetchExecution = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getExecutionDetails(Number(executionId))
      setExecution(response.data)
    } catch (err: any) {
      console.error('Failed to fetch execution:', err)
      setError('Unable to load execution details')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async () => {
    if (!executionId || !paymentRef.trim()) {
      alert('Please enter a payment reference')
      return
    }
    
    setActionLoading(true)
    
    try {
      await markExecutionPaid(Number(executionId), paymentRef)
      await fetchExecution()
      setShowPaidForm(false)
      setPaymentRef('')
      alert('Payment marked as completed successfully')
    } catch (err: any) {
      console.error('Failed to mark as paid:', err)
      alert(err.response?.data?.message || 'Failed to mark as paid')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkFailed = async () => {
    if (!executionId || !failureCode.trim() || !failureReason.trim()) {
      alert('Please provide both failure code and reason')
      return
    }
    
    setActionLoading(true)
    
    try {
      await markExecutionFailed(Number(executionId), failureCode, failureReason)
      await fetchExecution()
      setShowFailedForm(false)
      setFailureCode('')
      setFailureReason('')
      alert('Execution marked as failed successfully')
    } catch (err: any) {
      console.error('Failed to mark as failed:', err)
      alert(err.response?.data?.message || 'Failed to mark as failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!executionId) return
    
    setActionLoading(true)
    
    try {
      await retryExecution(Number(executionId), retryNote || 'Retry requested')
      await fetchExecution()
      setShowRetryForm(false)
      setRetryNote('')
      alert('Execution retry initiated successfully')
    } catch (err: any) {
      console.error('Failed to retry:', err)
      alert(err.response?.data?.message || 'Failed to retry execution')
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <AlertCircle className="h-12 w-12 text-danger mb-3" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Unable to load execution</h3>
        <p className="text-text-secondary mb-4">{error || 'Execution not found'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/app/admin/payouts/${execution?.batchId}`)}
            className="px-4 py-2 border border-neutral-border text-text-secondary rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth"
          >
            Back to Batch
          </button>
          <button
            onClick={fetchExecution}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const canMarkPaid = execution.status === 'PENDING'
  const canMarkFailed = execution.status === 'PENDING'
  const canRetry = execution.status === 'FAILED' && execution.retryCount < 3

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/app/admin/payouts/${execution.batchId}`)}
            className="p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth mr-3"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-page-title text-text-primary mb-1">Execution #{execution.executionId}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-full text-sm font-medium ${
                execution.status === 'PAID' ? 'bg-success/10 text-success' :
                execution.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                'bg-warning/10 text-warning'
              }`}>
                {execution.status}
              </span>
              <span className="text-sm text-text-secondary">
                Batch #{execution.batchId} • Created {formatDateTime(execution.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchExecution}
            className="p-2.5 border border-neutral-border rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Execution Details Card */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-text-secondary mb-2">Owner</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center">
                  <User size={18} className="text-text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{execution.ownerName}</p>
                  <p className="text-sm text-text-secondary">ID: {execution.ownerId}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary mb-2">Amount</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <span className="text-2xl font-bold text-text-primary animate-price-float">
                  {formatCurrency(execution.amount)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm text-text-secondary mb-2">Retry Count</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center">
                  <RefreshCw size={18} className="text-text-primary" />
                </div>
                <span className="font-medium text-text-primary">{execution.retryCount}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary mb-2">Last Activity</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center">
                  <Clock size={18} className="text-text-primary" />
                </div>
                <span className="font-medium text-text-primary">
                  {formatDateTime(execution.lastActivity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          {canMarkPaid && (
            <button
              onClick={() => setShowPaidForm(true)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark as Paid
            </button>
          )}
          
          {canMarkFailed && (
            <button
              onClick={() => setShowFailedForm(true)}
              className="px-4 py-2.5 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-all duration-250 smooth shadow-subtle flex items-center gap-2"
            >
              <XCircle size={16} />
              Mark as Failed
            </button>
          )}
          
          {canRetry && (
            <button
              onClick={() => setShowRetryForm(true)}
              className="px-4 py-2.5 bg-warning text-white rounded-xl font-medium hover:bg-warning/90 transition-all duration-250 smooth shadow-subtle flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry Execution
            </button>
          )}
          
          {!canMarkPaid && !canMarkFailed && !canRetry && (
            <p className="text-text-muted italic">No actions available for current status</p>
          )}
        </div>
        
        {/* Mark Paid Form */}
        {showPaidForm && (
          <div className="mt-6 p-5 bg-primary-light/30 rounded-xl border border-primary/20 animate-scaleIn">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              Mark as Paid
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Enter UTR/Transaction ID"
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-250 smooth"
                />
                <p className="text-xs text-text-secondary mt-2">
                  Enter the bank transaction reference or UTR number
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkPaid}
                  disabled={actionLoading || !paymentRef.trim()}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Paid'}
                </button>
                <button
                  onClick={() => setShowPaidForm(false)}
                  className="px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Mark Failed Form */}
        {showFailedForm && (
          <div className="mt-6 p-5 bg-danger/5 rounded-xl border border-danger/20 animate-scaleIn">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              Mark as Failed
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Failure Code
                </label>
                <input
                  type="text"
                  value={failureCode}
                  onChange={(e) => setFailureCode(e.target.value)}
                  placeholder="e.g., BANK_ERROR, INVALID_ACCOUNT"
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all duration-250 smooth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Failure Reason
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Describe why the payment failed"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all duration-250 smooth"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkFailed}
                  disabled={actionLoading || !failureCode.trim() || !failureReason.trim()}
                  className="px-4 py-2.5 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Failed'}
                </button>
                <button
                  onClick={() => setShowFailedForm(false)}
                  className="px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Retry Form */}
        {showRetryForm && (
          <div className="mt-6 p-5 bg-warning/5 rounded-xl border border-warning/20 animate-scaleIn">
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <RefreshCw size={16} className="text-warning" />
              Retry Execution
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Retry Note (Optional)
                </label>
                <textarea
                  value={retryNote}
                  onChange={(e) => setRetryNote(e.target.value)}
                  placeholder="Add any notes about this retry attempt"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-warning/30 focus:border-warning transition-all duration-250 smooth"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-warning text-white rounded-xl font-medium hover:bg-warning/90 transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Start Retry'}
                </button>
                <button
                  onClick={() => setShowRetryForm(false)}
                  className="px-4 py-2.5 border border-neutral-border text-text-secondary rounded-xl font-medium hover:bg-neutral-hover transition-all duration-250 smooth"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details */}
      {execution.status === 'PAID' && (
        <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-2">Payment Reference</p>
              <p className="font-medium text-text-primary">{execution.paymentReference}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Paid At</p>
              <p className="font-medium text-text-primary">
                {execution.paidAt ? formatDateTime(execution.paidAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failure Details */}
      {execution.status === 'FAILED' && (
        <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Failure Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary mb-2">Failure Code</p>
              <p className="font-medium text-text-primary">{execution.failureCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Failure Reason</p>
              <p className="font-medium text-text-primary">{execution.failureReason || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Failed At</p>
              <p className="font-medium text-text-primary">
                {execution.failedAt ? formatDateTime(execution.failedAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failure History */}
      {execution.failureHistory && execution.failureHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card animate-scaleIn">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <HistoryIcon size={18} className="text-text-primary" />
            Failure History
          </h2>
          <div className="space-y-3">
            {execution.failureHistory.map((failure, index) => (
              <div key={index} className="p-4 bg-neutral-subtle rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      Attempt #{failure.attemptNumber}
                    </span>
                    <span className="px-2 py-1 bg-danger/10 text-danger text-xs font-medium rounded-lg">
                      {failure.failureCode}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {formatDateTime(failure.failedAt)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{failure.failureReason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}