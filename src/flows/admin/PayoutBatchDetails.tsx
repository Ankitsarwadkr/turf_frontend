import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getBatchDetails, approveBatch, getBatchExecutions } from "../../engine/adminEngine"
import { 
  ChevronLeft, Calendar, DollarSign, Users, CheckCircle, XCircle, 
  Clock, AlertCircle, Loader2, RefreshCw, ExternalLink, ChevronRight
} from "lucide-react"

type BatchDetails = {
  batchId: number
  weekStart: string
  weekEnd: string
  totalAmount: number
  totalOwners: number
  status: string
  createdAt: string
  owners: Array<{
    ownerId: number
    ownerName: string
    totalAmount: number
    earnings: any[]
  }>
}

type Execution = {
  executionId: number
  ownerId: number
  ownerName: string
  amount: number
  status: string
  retryCount: number
  createdAt: string
}

export default function PayoutBatchDetails() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState<BatchDetails | null>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    if (batchId) {
      fetchData()
    }
  }, [batchId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [batchRes, executionsRes] = await Promise.all([
        getBatchDetails(Number(batchId)),
        getBatchExecutions(Number(batchId))
      ])
      
      setBatch(batchRes.data)
      setExecutions(executionsRes.data)
    } catch (err: any) {
      console.error('Failed to fetch batch details:', err)
      setError('Unable to load batch details')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!batchId || batch?.status !== 'CREATED') return
    
    if (!window.confirm('Are you sure you want to approve this batch? This will create payout executions for all owners.')) {
      return
    }
    
    setApproving(true)
    
    try {
      await approveBatch(Number(batchId))
      await fetchData() // Refresh data
    } catch (err: any) {
      console.error('Failed to approve batch:', err)
      alert(err.response?.data?.message || 'Failed to approve batch')
    } finally {
      setApproving(false)
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: any; label: string }> = {
      'CREATED': { 
        color: 'text-text-muted', 
        bg: 'bg-neutral-hover', 
        icon: Clock,
        label: 'Created'
      },
      'APPROVED': { 
        color: 'text-primary', 
        bg: 'bg-primary-light', 
        icon: CheckCircle,
        label: 'Approved'
      },
      'PROCESSING': { 
        color: 'text-warning', 
        bg: 'bg-warning/10', 
        icon: RefreshCw,
        label: 'Processing'
      },
      'FAILED': { 
        color: 'text-danger', 
        bg: 'bg-danger/10', 
        icon: XCircle,
        label: 'Failed'
      },
      'COMPLETED': { 
        color: 'text-success', 
        bg: 'bg-success/10', 
        icon: CheckCircle,
        label: 'Completed'
      },
    }
    return configs[status] || { 
      color: 'text-text-muted', 
      bg: 'bg-neutral-hover', 
      icon: Clock,
      label: status 
    }
  }

  const getExecutionStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; text: string }> = {
      'PENDING': { color: 'text-warning', bg: 'bg-warning/10', text: 'Pending' },
      'PAID': { color: 'text-success', bg: 'bg-success/10', text: 'Paid' },
      'FAILED': { color: 'text-danger', bg: 'bg-danger/10', text: 'Failed' },
    }
    return configs[status] || { color: 'text-text-muted', bg: 'bg-neutral-hover', text: status }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <AlertCircle className="h-12 w-12 text-danger mb-3" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Unable to load batch</h3>
        <p className="text-text-secondary mb-4">{error || 'Batch not found'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/admin/payouts')}
            className="px-4 py-2 border border-neutral-border text-text-secondary rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth"
          >
            Back to Batches
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(batch.status)
  const StatusIcon = statusConfig.icon

  const paidCount = executions.filter(e => e.status === 'PAID').length
  const failedCount = executions.filter(e => e.status === 'FAILED').length
  const pendingCount = executions.filter(e => e.status === 'PENDING').length

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/app/admin/payouts')}
            className="p-2.5 rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth mr-3"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-page-title text-text-primary mb-1">Batch #{batch.batchId}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color}`}>
                <StatusIcon size={14} />
                {statusConfig.label}
              </span>
              <span className="text-sm text-text-secondary">
                Created on {formatDate(batch.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {batch.status === 'CREATED' && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {approving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Approve Batch
              </>
            )}
          </button>
        )}
      </div>

      {/* Batch Info */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-text-secondary mb-2">Week Period</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-text-primary" />
                </div>
                <span className="font-medium text-text-primary">
                  {formatDate(batch.weekStart)} – {formatDate(batch.weekEnd)}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary mb-2">Total Amount</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <span className="text-xl font-semibold text-text-primary animate-price-float">
                  {formatCurrency(batch.totalAmount)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm text-text-secondary mb-2">Total Owners</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-hover rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-text-primary" />
                </div>
                <span className="font-medium text-text-primary">{batch.totalOwners}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-text-secondary mb-2">Executions</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-success">{paidCount} paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm font-medium text-warning">{pendingCount} pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger rounded-full"></div>
                  <span className="text-sm font-medium text-danger">{failedCount} failed</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-subtle rounded-xl p-4 border border-neutral-border">
            <p className="text-sm font-medium text-text-primary mb-2">Status Summary</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {batch.status === 'CREATED' && 'Batch is ready for approval. Click "Approve Batch" to start payouts.'}
              {batch.status === 'APPROVED' && 'Batch is approved. Executions are ready for processing.'}
              {batch.status === 'PROCESSING' && 'Batch is currently being processed.'}
              {batch.status === 'FAILED' && 'Some executions in this batch have failed.'}
              {batch.status === 'COMPLETED' && 'All executions in this batch have been completed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Executions List */}
      <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card">
        <div className="p-6 border-b border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Payout Executions</h2>
              <p className="text-sm text-text-secondary mt-1">Individual owner payouts for this batch</p>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {executions.length} executions
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-border">
          {executions.length === 0 ? (
            <div className="p-12 text-center animate-fadeIn">
              <Users className="h-16 w-16 text-neutral-border mx-auto mb-4" />
              <p className="text-text-secondary">No executions found for this batch</p>
            </div>
          ) : (
            executions.map((execution) => {
              const execStatus = getExecutionStatusConfig(execution.status)
              
              return (
                <div
                  key={execution.executionId}
                  onClick={() => navigate(`/app/admin/payouts/executions/${execution.executionId}`)}
                  className="p-6 hover:bg-neutral-hover transition-all duration-250 smooth cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${execStatus.bg} ${execStatus.color}`}>
                          {execStatus.text}
                        </span>
                        {execution.retryCount > 0 && (
                          <span className="text-xs text-text-muted">
                            {execution.retryCount} retry{execution.retryCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Owner</p>
                          <p className="font-medium text-text-primary">{execution.ownerName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Amount</p>
                          <p className="font-medium text-text-primary animate-price-float">
                            {formatCurrency(execution.amount)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Created</p>
                          <p className="text-sm text-text-primary">{formatDate(execution.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="text-neutral-border ml-4 group-hover:text-text-primary transition-colors duration-250" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Owner Breakdown */}
      <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card">
        <div className="p-6 border-b border-neutral-border">
          <h2 className="text-lg font-semibold text-text-primary">Owner Breakdown</h2>
          <p className="text-sm text-text-secondary mt-1">Earnings per owner for this week</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {batch.owners.map((owner) => (
              <div 
                key={owner.ownerId} 
                className="flex items-center justify-between p-4 bg-neutral-subtle rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-hover rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{owner.ownerName}</p>
                    <p className="text-sm text-text-secondary">ID: {owner.ownerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary animate-price-float">
                    {formatCurrency(owner.totalAmount)}
                  </p>
                  <p className="text-xs text-text-muted">{owner.earnings.length} earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}