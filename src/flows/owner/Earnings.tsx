import { useState, useEffect } from "react"
import {
  Wallet,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  History
} from "lucide-react"
import {
  getOwnerBalance,
  getNextPayout,
  getPaymentHistory,
  getWeeklyLedger,
  OwnerBalanceResponse,
  OwnerNextPayoutRow,
  OwnerPaidHistoryRow,
  OwnerWeeklyLedgerResponse
} from "../../engine/ownerEngine"

type TabType = "pending" | "history" | "statement"

export default function OwnerEarnings() {
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const [balance, setBalance] = useState<OwnerBalanceResponse | null>(null)
  const [pendingPayouts, setPendingPayouts] = useState<OwnerNextPayoutRow[]>([])
  const [paymentHistory, setPaymentHistory] = useState<OwnerPaidHistoryRow[]>([])
  const [weeklyLedger, setWeeklyLedger] = useState<OwnerWeeklyLedgerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchEarningsData()
  }, [])

  useEffect(() => {
    if (activeTab === "statement" && dateRange.start && dateRange.end) {
      fetchWeeklyLedger()
    }
  }, [activeTab, dateRange.start, dateRange.end])

  const fetchEarningsData = async () => {
    try {
      setLoading(true)
      const [balanceRes, pendingRes, historyRes] = await Promise.all([
        getOwnerBalance(),
        getNextPayout(),
        getPaymentHistory()
      ])
      setBalance(balanceRes.data)
      setPendingPayouts(pendingRes.data)
      setPaymentHistory(historyRes.data)
    } catch (error) {
      console.error("Failed to fetch earnings data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyLedger = async () => {
    if (!dateRange.start || !dateRange.end) return
    
    try {
      setLedgerLoading(true)
      const res = await getWeeklyLedger(dateRange.start, dateRange.end)
      setWeeklyLedger(res.data)
    } catch (error) {
      console.error("Failed to fetch weekly ledger:", error)
    } finally {
      setLedgerLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatReason = (reason: string) => {
    return reason
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0)

  const ledgerTotals = weeklyLedger?.rows ? {
    totalEarnings: weeklyLedger.rows
      .filter(r => r.type?.toUpperCase() === "CREDIT")
      .reduce((sum, r) => sum + r.amount, 0),
    totalDeductions: weeklyLedger.rows
      .filter(r => r.type?.toUpperCase() === "DEBIT")
      .reduce((sum, r) => sum + Math.abs(r.amount), 0)
  } : { totalEarnings: 0, totalDeductions: 0 }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <div className="bg-neutral-surface border-b border-neutral-border sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <h1 className="text-page-title font-semibold text-text-primary">My Earnings</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="text-center animate-fadeIn">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-text-secondary font-medium">Loading earnings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <div className="bg-neutral-surface border-b border-neutral-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <h1 className="text-page-title font-semibold text-text-primary">My Earnings</h1>
          <p className="text-sm text-text-secondary font-medium mt-1">Track your bookings earnings and payouts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-card animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={24} />
            <span className="text-sm opacity-90 font-medium">Current Balance</span>
          </div>
          <p className="text-4xl font-bold mb-4">{formatCurrency(balance?.balance || 0)}</p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-75 mb-1 font-medium">Waiting for Payout</p>
              <p className="text-lg font-semibold">{formatCurrency(totalPending)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1 font-medium">Total Received</p>
              <p className="text-lg font-semibold">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary-subtle border border-primary-light rounded-xl p-4 animate-fadeIn">
          <div className="flex gap-3">
            <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-primary mb-1">How it works:</p>
              <p className="text-primary">Earnings from completed bookings are added to "Waiting for Payout". Every week, admin processes payouts and transfers money to your bank account, which then appears in "Payout History".</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-card">
          <div className="border-b border-neutral-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "pending"
                    ? "text-primary border-b-2 border-primary bg-primary-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"
                }`}
              >
                <Clock size={18} />
                Waiting for Payout
                {pendingPayouts.length > 0 && (
                  <span className="px-2 py-0.5 bg-warning text-white text-xs rounded-full font-semibold">
                    {pendingPayouts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "history"
                    ? "text-primary border-b-2 border-primary bg-primary-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"
                }`}
              >
                <CheckCircle size={18} />
                Payout History
                {paymentHistory.length > 0 && (
                  <span className="px-2 py-0.5 bg-success text-white text-xs rounded-full font-semibold">
                    {paymentHistory.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("statement")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === "statement"
                    ? "text-primary border-b-2 border-primary bg-primary-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-hover active:scale-[0.98]"
                }`}
              >
                <History size={18} />
                Statement
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Waiting for Payout Tab */}
            {activeTab === "pending" && (
              <div className="space-y-3 animate-fadeIn">
                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto text-text-muted mb-3" size={48} />
                    <p className="text-text-secondary font-semibold">No pending earnings</p>
                    <p className="text-sm text-text-muted mt-1 font-medium">Your earnings will appear here after bookings are completed</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-warning/10 rounded-xl border border-warning/20">
                      <p className="text-sm text-warning font-medium">
                        <span className="font-bold">₹{totalPending.toLocaleString()}</span> waiting for next payout cycle
                      </p>
                    </div>
                    {pendingPayouts.map((payout, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-neutral-bg rounded-xl border border-neutral-border hover:border-warning transition-colors duration-200 animate-scaleIn">
                        <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="text-warning" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-semibold text-text-primary">{formatReason(payout.reason)}</p>
                              <p className="text-xs text-text-secondary mt-0.5 font-medium">Booking #{payout.bookingId.slice(0, 13)}...</p>
                            </div>
                            <span className="font-bold text-lg text-warning whitespace-nowrap">
                              {formatCurrency(payout.amount)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted font-medium">Earned on {formatDate(payout.earnedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Payout History Tab */}
            {activeTab === "history" && (
              <div className="space-y-3 animate-fadeIn">
                {paymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="mx-auto text-text-muted mb-3" size={48} />
                    <p className="text-text-secondary font-semibold">No payout history</p>
                    <p className="text-sm text-text-muted mt-1 font-medium">Completed payouts will appear here</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-success/10 rounded-xl border border-success/20">
                      <p className="text-sm text-success font-medium">
                        <span className="font-bold">₹{totalPaid.toLocaleString()}</span> received in {paymentHistory.length} payment{paymentHistory.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {paymentHistory.map((payment, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-neutral-bg rounded-xl border border-neutral-border hover:border-success transition-colors duration-200 animate-scaleIn">
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="text-success" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-semibold text-text-primary">Payment Received</p>
                              <p className="text-xs text-text-secondary mt-0.5 font-medium">Reference: {payment.reference}</p>
                            </div>
                            <span className="font-bold text-lg text-success whitespace-nowrap">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted font-medium">Paid on {formatDate(payment.paidAt)}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Statement Tab */}
            {activeTab === "statement" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-text-secondary mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-border bg-neutral-surface text-text-primary rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-text-secondary mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-neutral-border bg-neutral-surface text-text-primary rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </div>

                {ledgerLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-text-secondary font-medium">Loading statement...</p>
                  </div>
                ) : weeklyLedger ? (
                  <>
                    {/* Statement Summary */}
                    <div className="bg-neutral-bg rounded-xl p-5 border border-neutral-border">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-text-muted mb-2 font-semibold">Opening</p>
                          <p className="text-lg font-bold text-text-primary">
                            {formatCurrency(weeklyLedger.openingBalance || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-2 font-semibold">+ Earnings</p>
                          <p className="text-lg font-bold text-success">
                            {formatCurrency(ledgerTotals.totalEarnings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-2 font-semibold">- Deductions</p>
                          <p className="text-lg font-bold text-danger">
                            {formatCurrency(ledgerTotals.totalDeductions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-2 font-semibold">Closing</p>
                          <p className="text-lg font-bold text-text-primary">
                            {formatCurrency(weeklyLedger.closingBalance || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="space-y-2">
                      {!weeklyLedger.rows || weeklyLedger.rows.length === 0 ? (
                        <div className="text-center py-12">
                          <History className="mx-auto text-text-muted mb-3" size={48} />
                          <p className="text-text-secondary font-semibold">No transactions in this period</p>
                        </div>
                      ) : (
                        weeklyLedger.rows.map((row, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-bg rounded-xl border border-neutral-border hover:border-primary transition-all duration-200 animate-scaleIn">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              row.type?.toUpperCase() === "CREDIT" ? "bg-success/10" : "bg-danger/10"
                            }`}>
                              {row.type?.toUpperCase() === "CREDIT" ? (
                                <ArrowUpRight className="text-success" size={20} />
                              ) : (
                                <ArrowDownRight className="text-danger" size={20} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-text-primary">{formatReason(row.reason)}</p>
                                  <p className="text-xs text-text-secondary mt-0.5 font-medium">
                                    Booking #{row.bookingId.slice(0, 8)}... • Ref: {row.reference.slice(0, 8)}...
                                  </p>
                                  <p className="text-xs text-text-muted mt-1 font-medium">{formatDateTime(row.date)}</p>
                                </div>
                                <span className={`font-bold text-lg whitespace-nowrap ${
                                  row.type?.toUpperCase() === "CREDIT" ? "text-success" : "text-danger"
                                }`}>
                                  {row.type?.toUpperCase() === "CREDIT" ? "+" : "-"}
                                  {formatCurrency(Math.abs(row.amount))}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}