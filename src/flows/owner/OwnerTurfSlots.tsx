import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { generateSlots, getSlots, updateSlotStatus } from "../../engine/ownerEngine"
import { useToastStore } from "../../store/toastStore"
import { ChevronLeft } from "lucide-react"

type Slot = {
  id: number
  startTime: string
  endTime: string
  price: number
  status: string
}

const formatTime = (t: string) =>
  new Date(`1970-01-01T${t}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })

const LOCKED_STATES = ["BOOKED"]

export default function OwnerTurfSlots() {
  const { turfId } = useParams()
  const nav = useNavigate()
  const toast = useToastStore(s => s.push)

  const [date, setDate] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [fetchingSlots, setFetchingSlots] = useState(false)

  const loadSlots = async () => {
    if (!date || !turfId) return

    setFetchingSlots(true)
    try {
      const response = await getSlots(Number(turfId), date)
      setSlots(response.data || [])
      setSelected([])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to load slots"
      toast("error", errorMessage)
      setSlots([])
    } finally {
      setFetchingSlots(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [date])

  const handleGenerateSlots = async () => {
    if (!turfId) {
      toast("error", "Invalid turf ID")
      return
    }

    if (!confirm("Generate slots for the next 7 days? This is a one-time process that will create slots based on your turf schedule.")) {
      return
    }

    setGenerating(true)
    try {
      const response = await generateSlots(Number(turfId))
      const successMessage = response.data?.message || "Slots generated successfully for next 7 days"
      toast("success", successMessage)
      
      // Reload slots for current date if selected
      if (date) {
        await loadSlots()
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.status === 404 
                            ? "Schedule not found. Please save your turf schedule before generating slots" 
                            : "Failed to generate slots"
      toast("error", errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleStatus = async (status: string) => {
    if (!selected.length) {
      toast("error", "Please select at least one slot")
      return
    }

    // Check for locked slots
    const lockedSlots = slots.filter(s =>
      selected.includes(s.id) && LOCKED_STATES.includes(s.status)
    )

    if (lockedSlots.length) {
      toast("error", `Cannot modify ${lockedSlots.length} slot(s) - they are already booked`)
      return
    }

    // Check if all selected slots already have the target status
    const alreadyInStatus = slots.filter(s =>
      selected.includes(s.id) && s.status === status
    )

    if (alreadyInStatus.length === selected.length) {
      toast("error", `All selected slots are already ${status.toLowerCase()}`)
      return
    }

    setLoading(true)
    try {
      const response = await updateSlotStatus(Number(turfId), {
        slotIds: selected,
        status
      })
      
      const successMessage = response.data?.message || "Slot status updated successfully"
      toast("success", successMessage)
      await loadSlots()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.status === 403 
                            ? "Cannot update booked slots" 
                            : error.response?.status === 404
                            ? "Some slots were not found"
                            : "Failed to update slot status"
      toast("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-success bg-green-50 border-green-200"
      case "UNAVAILABLE":
        return "text-warning bg-yellow-50 border-yellow-200"
      case "BOOKED":
        return "text-danger bg-red-50 border-red-200"
      default:
        return "text-text-secondary bg-neutral-bg border-neutral-border"
    }
  }

  const handleSelectAll = () => {
    const selectableSlots = slots.filter(s => !LOCKED_STATES.includes(s.status))
    if (selected.length === selectableSlots.length) {
      setSelected([])
    } else {
      setSelected(selectableSlots.map(s => s.id))
    }
  }

  const selectableCount = slots.filter(s => !LOCKED_STATES.includes(s.status)).length
  const allSelectableSelected = selectableCount > 0 && selected.length === selectableCount

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-page-title font-semibold text-text-primary">Manage Slots</h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Generate Slots Button - Moved from header */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">Slot Generation</h2>
            <p className="text-xs text-text-secondary font-medium">
              Generate slots for the next 7 days based on your turf schedule
            </p>
          </div>
          <button
            onClick={handleGenerateSlots}
            disabled={generating}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm active:scale-[0.98] shadow-subtle"
          >
            {generating ? "Generating..." : "Generate 7-Day Slots"}
          </button>
        </div>

        {/* Date Selection */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card">
          <label className="block text-sm font-semibold text-text-primary mb-3">
            Select Date to View Slots
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Loading State */}
        {fetchingSlots && (
          <div className="text-center py-12 text-text-secondary text-sm font-medium">
            Loading slots...
          </div>
        )}

        {/* Slots Grid */}
        {!fetchingSlots && slots.length > 0 && (
          <div className="space-y-6">
            {/* Selection Controls */}
            <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors duration-200 active:scale-95"
                  >
                    {allSelectableSelected ? "Deselect All" : "Select All Available"}
                  </button>
                  {selected.length > 0 && (
                    <span className="text-sm text-text-secondary font-medium">
                      {selected.length} slot{selected.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleToggleStatus("AVAILABLE")}
                  disabled={loading || selected.length === 0}
                  className="px-5 py-2.5 bg-success text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm active:scale-[0.98] shadow-subtle"
                >
                  Mark Available
                </button>
                <button
                  onClick={() => handleToggleStatus("UNAVAILABLE")}
                  disabled={loading || selected.length === 0}
                  className="px-5 py-2.5 bg-warning text-white rounded-xl hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm active:scale-[0.98] shadow-subtle"
                >
                  Mark Unavailable
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {slots.map(slot => {
                const isLocked = LOCKED_STATES.includes(slot.status)
                const isSelected = selected.includes(slot.id)

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (!isLocked) {
                        setSelected(prev =>
                          prev.includes(slot.id)
                            ? prev.filter(id => id !== slot.id)
                            : [...prev, slot.id]
                        )
                      }
                    }}
                    className={`
                      border-2 rounded-xl p-5 transition-all duration-200 cursor-pointer
                      ${isLocked
                        ? "border-red-200 bg-red-50 cursor-not-allowed opacity-75 hover:opacity-90"
                        : "border-neutral-border bg-neutral-surface hover:border-primary hover:shadow-card-hover"
                      }
                      ${isSelected && !isLocked ? "border-primary ring-2 ring-primary/20 bg-primary-subtle/30 shadow-sm" : ""}
                      animate-scaleIn
                    `}
                  >
                    <div className="space-y-3">
                      <div className="font-semibold text-text-primary text-sm">
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </div>
                      <div className="text-xl font-bold text-text-primary">
                        ₹{slot.price}
                      </div>
                      <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(slot.status)}`}>
                        {slot.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!fetchingSlots && date && slots.length === 0 && (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn">
            <div className="text-text-secondary text-sm mb-2 font-medium">No slots found for this date</div>
            <div className="text-xs text-text-muted">
              Generate slots to create availability for the next 7 days
            </div>
          </div>
        )}

        {/* Initial State */}
        {!date && !fetchingSlots && (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-card animate-fadeIn">
            <div className="text-text-secondary text-sm mb-2 font-medium">Select a date to view and manage slots</div>
            <div className="text-xs text-text-muted">
              Use the date picker above to get started
            </div>
          </div>
        )}
      </div>
    </div>
  )
}