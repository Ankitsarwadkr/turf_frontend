import { useEffect, useState } from "react"
import { fetchPendingOwners, approveOwner, rejectOwner } from "../../engine/adminEngine"

export default function OwnerApprovals() {
  const [owners, setOwners] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [reasons, setReasons] = useState<Record<number, string>>({})
  const [confirm, setConfirm] = useState<{type:"approve"|"reject"|null,id:number|null}>({type:null,id:null})

  useEffect(() => {
    fetchPendingOwners().then(r => setOwners(r.data))
  }, [])

  const openApprove = (id:number) => {
    setConfirm({type:"approve",id})
  }
  
  const openReject = (id:number) => {
    setConfirm({type:"reject",id})
  }

  const execute = async () => {
    const id = confirm.id!
    const type = confirm.type!

    if (type === "reject" && !reasons[id]?.trim()) {
      alert("Rejection reason is required")
      return
    }

    setProcessingId(id)

    if (type === "approve") {
      await approveOwner(id)
    } else {
      await rejectOwner(id, reasons[id])
    }

    setOwners(o => o.filter(x => x.id !== id))
    setReasons(r => ({ ...r, [id]: "" }))
    setConfirm({ type:null, id:null })
    setProcessingId(null)
  }

  return (
    <div className="p-4 animate-slideUp">
      <div className="mb-6">
        <h2 className="text-page-title text-text-primary mb-2">Pending Owner Approvals</h2>
        <p className="text-text-secondary">Review and approve new owner registrations</p>
      </div>

      {/* Stats Summary */}
      {owners.length > 0 && (
        <div className="mb-6 bg-white rounded-xl p-4 shadow-subtle border border-neutral-border">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-primary-light text-primary rounded-lg font-medium">
              {owners.length} pending {owners.length === 1 ? 'owner' : 'owners'}
            </div>
            <div className="text-text-muted text-sm">
              Requires your attention
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-neutral-border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-subtle border-b border-neutral-border">
            <tr>
              <th className="p-4 text-left font-semibold text-text-primary">Owner</th>
              <th className="p-4 text-left font-semibold text-text-primary">Contact</th>
              <th className="p-4 text-left font-semibold text-text-primary">Subscription</th>
              <th className="p-4 text-left font-semibold text-text-primary">Documents</th>
              <th className="p-4 text-left font-semibold text-text-primary">Reject Reason</th>
              <th className="p-4 text-left font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>

          <tbody>
            {owners.map(o => (
              <tr 
                key={o.id} 
                className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-hover/50 transition-colors duration-250"
              >
                <td className="p-4">
                  <div className="font-medium text-text-primary">{o.name}</div>
                  <div className="text-text-secondary text-xs mt-1">{o.email}</div>
                </td>
                
                <td className="p-4">
                  <div className="text-text-primary">{o.mobileNo}</div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary animate-price-float">₹{o.subscriptionAmount}</span>
                    <span className="text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full">
                      Annual
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    {o.documents.map((d:any, index:number) => (
                      <a
                        key={d.filePath}
                        href={`http://localhost:8080${d.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline underline-offset-2 text-sm transition-colors duration-250"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <input
                    value={reasons[o.id] || ""}
                    onChange={e => setReasons(r => ({...r, [o.id]: e.target.value}))}
                    placeholder="Enter reason if rejecting"
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-250"
                  />
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      disabled={processingId === o.id}
                      onClick={() => openApprove(o.id)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-250
                        ${processingId === o.id 
                          ? 'bg-primary/50 text-white cursor-not-allowed' 
                          : 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-subtle hover:shadow-card'
                        }
                      `}
                    >
                      {processingId === o.id ? 'Processing...' : 'Approve'}
                    </button>

                    <button 
                      disabled={processingId === o.id}
                      onClick={() => openReject(o.id)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-250
                        ${processingId === o.id 
                          ? 'bg-text-muted/50 text-white cursor-not-allowed' 
                          : 'border border-neutral-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/5'
                        }
                      `}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {owners.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-text-muted mb-2">No pending owner approvals</div>
            <div className="text-text-secondary text-sm">All registrations have been processed</div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirm.type && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-premium animate-scaleIn">
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-text-primary mb-1">
                {confirm.type === "approve" ? "Approve Owner?" : "Reject Owner?"}
              </h3>
              <p className="text-text-secondary text-sm">
                {confirm.type === "approve" 
                  ? "This will grant full dashboard access to the owner." 
                  : "This action cannot be undone. Owner will be notified of rejection."}
              </p>
            </div>

            {confirm.type === "reject" && reasons[confirm.id!]?.trim() && (
              <div className="mb-4 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <div className="text-danger text-sm font-medium">Reason for rejection:</div>
                <div className="text-text-secondary text-sm mt-1">{reasons[confirm.id!]}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
              <button 
                onClick={() => setConfirm({type:null,id:null})}
                className="px-4 py-2 border border-neutral-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-neutral-hover transition-all duration-250"
              >
                Cancel
              </button>
              <button 
                onClick={execute}
                className={`
                  px-4 py-2 rounded-lg font-medium text-white transition-all duration-250
                  ${confirm.type === "approve" 
                    ? 'bg-primary hover:bg-primary-hover shadow-subtle' 
                    : 'bg-danger hover:bg-danger/90'
                  }
                `}
              >
                {confirm.type === "approve" ? 'Approve Owner' : 'Reject Owner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}