import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getPayoutBatches } from "../../engine/adminEngine"
import { 
  Calendar, DollarSign, Users, CheckCircle, XCircle, Clock, 
  AlertCircle, RefreshCw, Loader2, ChevronRight, Filter
} from "lucide-react"

type PayoutBatch = {
  batchId: number
  weekStart: string
  weekEnd: string
  totalAmount: number
  totalOwners: number
  status: string
  createdAt: string
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

export default function AdminPayoutsList() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<PayoutBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    const isLoading = batches.length === 0
    if (!isLoading) setRefreshing(true)
    setError(null)
    
    try {
      const response = await getPayoutBatches()
      setBatches(response.data)
    } catch (err: any) {
      console.error('Failed to fetch payout batches:', err)
      setError('Unable to load payout batches')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filteredBatches = selectedStatus === 'all' 
    ? batches 
    : batches.filter(batch => batch.status === selectedStatus)

  const statusOptions = [
    { value: 'all', label: 'All Batches' },
    { value: 'CREATED', label: 'Created' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const stats = {
    totalAmount: batches.reduce((sum, batch) => sum + batch.totalAmount, 0),
    totalBatches: batches.length,
    pendingBatches: batches.filter(b => b.status === 'CREATED').length,
    failedBatches: batches.filter(b => b.status === 'FAILED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <AlertCircle className="h-12 w-12 text-danger mb-3" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Unable to load batches</h3>
        <p className="text-text-secondary mb-4">{error}</p>
        <button
          onClick={fetchBatches}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-250 smooth shadow-subtle"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-text-primary mb-1">Payout Batches</h1>
          <p className="text-text-secondary">Manage weekly owner payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBatches}
            disabled={refreshing}
            className={`p-2.5 border border-neutral-border rounded-xl hover:bg-neutral-hover transition-all duration-250 smooth ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={18} className={`text-text-secondary ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
              <DollarSign className="text-primary" size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Amount</p>
              <p className="text-xl font-semibold text-text-primary animate-price-float">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-hover rounded-xl flex items-center justify-center">
              <Calendar className="text-text-primary" size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Batches</p>
              <p className="text-xl font-semibold text-text-primary">{stats.totalBatches}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
              <Clock className="text-warning" size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-xl font-semibold text-text-primary">{stats.pendingBatches}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-border p-5 shadow-card hover:shadow-card-hover transition-all duration-350">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-danger" size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Failed</p>
              <p className="text-xl font-semibold text-text-primary">{stats.failedBatches}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-2xl border border-neutral-border p-4 shadow-subtle">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`
                px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 smooth
                ${selectedStatus === option.value
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-neutral-hover text-text-secondary hover:text-text-primary hover:bg-neutral-hover/80'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batches List */}
      <div className="bg-white rounded-2xl border border-neutral-border overflow-hidden shadow-card">
        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center animate-fadeIn">
            <Calendar className="h-16 w-16 text-neutral-border mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No batches found</h3>
            <p className="text-text-secondary">
              {selectedStatus === 'all' 
                ? 'No payout batches have been created yet' 
                : `No ${selectedStatus.toLowerCase()} batches found`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-border">
            {filteredBatches.map((batch) => {
              const statusConfig = getStatusConfig(batch.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <div
                  key={batch.batchId}
                  onClick={() => navigate(`/app/admin/payouts/${batch.batchId}`)}
                  className="p-6 hover:bg-neutral-hover transition-all duration-250 smooth cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm text-text-muted">Batch #{batch.batchId}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Week Period</p>
                          <p className="font-medium text-text-primary">
                            {formatDate(batch.weekStart)} – {formatDate(batch.weekEnd)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Amount</p>
                          <p className="font-medium text-text-primary animate-price-float">
                            {formatCurrency(batch.totalAmount)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-text-secondary mb-2">Owners</p>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-text-muted" />
                            <span className="font-medium text-text-primary">{batch.totalOwners}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="text-neutral-border ml-4 group-hover:text-text-primary transition-colors duration-250" />
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