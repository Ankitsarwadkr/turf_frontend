import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getTurfSchedule, saveTurfSchedule } from "../../engine/ownerEngine"
import { useToastStore } from "../../store/toastStore"
import { ChevronLeft } from "lucide-react"

type PriceSlot = {
  startTime: string
  endTime: string
  pricePerSlot: number
}

const normalize = (t: string) => t?.slice(0, 5) || ""

const formatTime = (t: string) =>
  t ? new Date(`1970-01-01T${t}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }) : ""

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export default function TurfSchedule() {
  const { turfId } = useParams()
  const nav = useNavigate()
  const toast = useToastStore(s => s.push)

  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [slotDuration, setSlotDuration] = useState<60 | 90 | 120 | "">("")
  const [priceSlots, setPriceSlots] = useState<PriceSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false)

  useEffect(() => {
    if (!turfId) return

    setFetching(true)
    getTurfSchedule(Number(turfId))
      .then(r => {
        if (r.data) {
          setHasExistingSchedule(true)
          setOpenTime(normalize(r.data.openTime))
          setCloseTime(normalize(r.data.closeTime))
          setSlotDuration(r.data.slotDurationMinutes)
          setPriceSlots((r.data.priceSlots || []).map((p: any) => ({
            startTime: normalize(p.startTime),
            endTime: normalize(p.endTime),
            pricePerSlot: p.pricePerSlot
          })))
        }
      })
      .catch(() => {
        // Schedule doesn't exist yet - this is fine
        setHasExistingSchedule(false)
      })
      .finally(() => setFetching(false))
  }, [turfId])

  const addPriceSlot = () => {
    const lastSlot = priceSlots[priceSlots.length - 1]
    const newStart = lastSlot ? lastSlot.endTime : openTime || ""
    
    setPriceSlots(p => [...p, {
      startTime: newStart,
      endTime: "",
      pricePerSlot: 0
    }])
  }

  const removePriceSlot = (i: number) => {
    if (priceSlots.length <= 1) {
      toast("error", "At least one pricing period is required")
      return
    }
    setPriceSlots(p => p.filter((_, ix) => ix !== i))
  }

  const updatePriceSlot = (index: number, field: keyof PriceSlot, value: any) => {
    setPriceSlots(slots =>
      slots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    )
  }

  const validateSchedule = (): string | null => {
    // Basic field validation
    if (!openTime || !closeTime || !slotDuration) {
      return "Please complete all operating hours and slot duration fields"
    }

    if (priceSlots.length === 0) {
      return "At least one pricing period is required"
    }

    // Validate all price slots
    for (let i = 0; i < priceSlots.length; i++) {
      const slot = priceSlots[i]
      
      if (!slot.startTime || !slot.endTime) {
        return `Pricing period ${i + 1}: Start and end times are required`
      }

      if (slot.pricePerSlot <= 0) {
        return `Pricing period ${i + 1}: Price must be greater than 0`
      }

      // Check if end time is after start time (accounting for next day)
      const startMins = timeToMinutes(slot.startTime)
      const endMins = timeToMinutes(slot.endTime)
      
      // If closeTime < openTime, turf operates past midnight
      const closesMins = timeToMinutes(closeTime)
      const opensMins = timeToMinutes(openTime)
      const crossesMidnight = closesMins < opensMins

      if (!crossesMidnight && endMins <= startMins) {
        return `Pricing period ${i + 1}: End time must be after start time`
      }
    }

    // Check for gaps or overlaps
    const sortedSlots = [...priceSlots].sort((a, b) =>
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    )

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i]
      const next = sortedSlots[i + 1]

      if (current.endTime !== next.startTime) {
        return "Pricing periods must be continuous with no gaps or overlaps"
      }
    }

    // Validate coverage (first slot should start at openTime, last should end at closeTime)
    if (sortedSlots[0].startTime !== openTime) {
      return "First pricing period must start at opening time"
    }

    if (sortedSlots[sortedSlots.length - 1].endTime !== closeTime) {
      return "Last pricing period must end at closing time"
    }

    return null
  }

  const handleSave = async () => {
    const validationError = validateSchedule()
    if (validationError) {
      toast("error", validationError)
      return
    }

    if (!turfId) return

    setLoading(true)
    try {
      const response = await saveTurfSchedule(Number(turfId), {
        openTime,
        closeTime,
        slotDurationMinutes: slotDuration as 60 | 90 | 120,
        priceSlots
      })

      const successMessage = response.data?.message || "Turf schedule saved successfully"
      toast("success", successMessage)
      setHasExistingSchedule(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.status === 400
                            ? "Invalid schedule configuration. Please check all fields"
                            : error.response?.status === 403
                            ? "You don't have permission to update this turf"
                            : error.response?.status === 404
                            ? "Turf not found"
                            : "Failed to save schedule"
      toast("error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-0">
        <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => nav(-1)}
              className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
            >
              <ChevronLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-page-title font-semibold text-text-primary">Turf Schedule</h1>
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto p-6">
          <div className="text-center py-12 text-text-secondary text-sm font-medium">Loading schedule...</div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-page-title font-semibold text-text-primary">Turf Schedule</h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Text */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Configure Operating Hours & Pricing</h2>
            <p className="text-sm text-text-secondary font-medium mt-1">
              Set your turf's schedule and define pricing periods for different times
            </p>
          </div>

          {/* Operating Hours */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">Operating Hours</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Opening Time
                  {openTime && (
                    <span className="ml-2 text-text-muted font-normal">
                      ({formatTime(openTime)})
                    </span>
                  )}
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={e => setOpenTime(e.target.value)}
                  className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Closing Time
                  {closeTime && (
                    <span className="ml-2 text-text-muted font-normal">
                      ({formatTime(closeTime)})
                    </span>
                  )}
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={e => setCloseTime(e.target.value)}
                  className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
                <p className="text-xs text-text-muted mt-2 font-medium">
                  If closing time is before opening time, turf operates past midnight
                </p>
              </div>
            </div>
          </div>

          {/* Slot Duration */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary mb-4">Slot Duration</h3>
            <select
              value={slotDuration}
              onChange={e => setSlotDuration(+e.target.value as any)}
              className="w-full md:w-1/2 border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            >
              <option value="">Select duration</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hours)</option>
              <option value="120">120 minutes (2 hours)</option>
            </select>
            <p className="text-xs text-text-muted mt-3 font-medium">
              This determines how long each bookable time slot will be
            </p>
          </div>

          {/* Pricing Periods */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">Pricing Periods</h3>
                <p className="text-sm text-text-secondary font-medium mt-1">
                  Define different prices for different times of the day
                </p>
              </div>
              <button
                onClick={addPriceSlot}
                className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-200 font-semibold text-sm active:scale-[0.98] shadow-subtle"
              >
                + Add Period
              </button>
            </div>

            {priceSlots.length === 0 && (
              <div className="text-center py-8 text-text-muted bg-neutral-bg rounded-xl border-2 border-dashed border-neutral-border animate-fadeIn">
                No pricing periods defined. Click "Add Period" to get started.
              </div>
            )}

            <div className="space-y-4">
              {priceSlots.map((slot, i) => (
                <div key={i} className="bg-neutral-bg border border-neutral-border rounded-xl p-5 animate-scaleIn">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-text-primary text-sm">Period {i + 1}</span>
                    <button
                      onClick={() => removePriceSlot(i)}
                      className="text-danger hover:text-red-700 text-sm font-semibold transition-colors duration-200 active:scale-95"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Start Time
                        {slot.startTime && (
                          <span className="ml-2 text-text-muted font-normal">
                            ({formatTime(slot.startTime)})
                          </span>
                        )}
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={e => updatePriceSlot(i, "startTime", e.target.value)}
                        className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        End Time
                        {slot.endTime && (
                          <span className="ml-2 text-text-muted font-normal">
                            ({formatTime(slot.endTime)})
                          </span>
                        )}
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => updatePriceSlot(i, "endTime", e.target.value)}
                        className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={slot.pricePerSlot || ""}
                        onChange={e => updatePriceSlot(i, "pricePerSlot", +e.target.value)}
                        className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card">
            <div className="text-sm text-text-secondary font-medium">
              {hasExistingSchedule ? (
                <span className="text-success font-semibold">✓ Schedule configured</span>
              ) : (
                <span>Configure schedule to enable slot generation</span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold active:scale-[0.98] shadow-subtle"
            >
              {loading ? "Saving..." : hasExistingSchedule ? "Update Schedule" : "Save Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}