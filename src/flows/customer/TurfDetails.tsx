import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPublicTurfById, getCustomerSlots } from "../../engine/customerEngine"
import { 
  ChevronLeft, MapPin, Clock, CheckCircle2, 
  Calendar, Star, ChevronRight, X, ArrowRight 
} from "lucide-react"

type PriceSlot = {
  startTime: string
  endTime: string
  pricePerSlot: number
}

type Turf = {
  id: number
  name: string
  description: string
  amenities: string
  turfType: string
  address: string
  city: string
  mapUrl: string
  images: string[]
  openTime: string
  closeTime: string
  slotDurationMinutes: number
  priceSlots: PriceSlot[]
  available: boolean
}

type Slot = {
  id: number
  date: string
  startTime: string
  endTime: string
  price: number
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Generate next 7 days for calendar
const getNext7Days = () => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0
    })
  }
  return days
}

export default function CustomerTurfDetails() {
  const { turfId } = useParams()
  const nav = useNavigate()
  const [turf, setTurf] = useState<Turf | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Slot modal state
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  
  // Animation states
  const [showPriceSummary, setShowPriceSummary] = useState(false)
  
  const calendarDays = getNext7Days()
  const priceSummaryRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPublicTurfById(Number(turfId))
      .then(r => {
        setTurf(r.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [turfId])

  useEffect(() => {
    let isMounted = true
    
    if (showSlotModal && turf) {
      setSlotsLoading(true)
      setSelectedSlots([])
      setShowPriceSummary(false)
      
      getCustomerSlots(Number(turfId), selectedDate)
        .then(r => {
          if (isMounted) {
            setSlots(r.data)
            setSlotsLoading(false)
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error(err)
            setSlotsLoading(false)
            setSlots([])
          }
        })
    }
    
    return () => {
      isMounted = false
    }
  }, [showSlotModal, selectedDate, turfId, turf])

  useEffect(() => {
    if (selectedSlots.length > 0) {
      setShowPriceSummary(true)
    } else {
      setShowPriceSummary(false)
    }
  }, [selectedSlots])

  const nextImage = () => {
    if (turf?.images) {
      setSelectedImageIndex((prev) => (prev + 1) % turf.images.length)
    }
  }

  const prevImage = () => {
    if (turf?.images) {
      setSelectedImageIndex((prev) => (prev - 1 + turf.images.length) % turf.images.length)
    }
  }

  const toggleSlot = (id: number) => {
    setSelectedSlots(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const totalPrice = slots
    .filter(s => selectedSlots.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  const handleOpenSlotModal = () => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
    setSelectedSlots([])
    setShowSlotModal(true)
  }

  const handleBooking = () => {
    if (selectedSlots.length === 0) {
      alert("Please select at least one slot")
      return
    }
    
    const selectedSlotData = slots.filter(s => selectedSlots.includes(s.id))
    
    if (selectedSlotData.length === 0) {
      alert("Selected slots are no longer available. Please reselect.")
      setSelectedSlots([])
      return
    }
    
    const slotsFromOtherDate = selectedSlotData.filter(slot => slot.date !== selectedDate)
    if (slotsFromOtherDate.length > 0) {
      alert("Some selected slots are from a different date. Please reselect.")
      setSelectedSlots([])
      return
    }
    
    nav("/app/customer/booking/review", {
      state: { 
        turfId: turf?.id,
        turfName: turf?.name,
        slotIds: selectedSlots,
        slots: selectedSlotData,
        totalPrice,
        date: selectedDate
      }
    })
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleCloseModal = () => {
    if (modalRef.current) {
      modalRef.current.style.animation = 'sheet-out 0.3s forwards'
      setTimeout(() => {
        if (showSlotModal) {
          setShowSlotModal(false)
        }
      }, 250)
    } else {
      setShowSlotModal(false)
    }
  }

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      top: ${y}px;
      left: ${x}px;
      pointer-events: none;
    `
    
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary-subtle rounded-full flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-primary animate-spin" />
          </div>
          <p className="text-text-secondary text-sm">Loading turf details...</p>
        </div>
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-bg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-neutral-hover rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm">Turf not found</p>
          <button
            onClick={() => nav('/app/customer')}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-md"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const amenitiesList = turf.amenities?.split(',').map(a => a.trim()).filter(Boolean) || []

  return (
    <>
      <div className="min-h-screen bg-neutral-bg">
        <div className="sticky top-0 z-30 bg-neutral-surface border-b border-neutral-border">
          <div className="px-4 py-3 flex items-center">
            <button
              onClick={() => nav(-1)}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-hover transition active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-text-primary" />
            </button>
            <h1 className="ml-2 text-sm font-semibold tracking-tight text-text-primary truncate">Turf Details</h1>
          </div>
        </div>

        <div className="relative bg-gray-900">
          {turf.images && turf.images.length > 0 ? (
            <>
              <div className="relative h-72 md:h-96 overflow-hidden">
                <img
                  src={`${turf.images[selectedImageIndex]}`}
                  alt={turf.name}
                  className="w-full h-full object-cover md:object-contain md:bg-black"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb"/%3E%3C/svg%3E'
                  }}
                />
                {turf.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition"
                    >
                      <ChevronLeft size={18} className="text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition"
                    >
                      <ChevronRight size={18} className="text-white" />
                    </button>
                  </>
                )}
              </div>
              
              {turf.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {turf.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all ${
                        idx === selectedImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 w-1'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-72 md:h-96 flex items-center justify-center bg-gradient-to-br from-primary-subtle to-secondary-light">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-text-muted text-sm">No images available</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-5 space-y-5">
          <div>
            <h1 className="text-page-title mb-2">{turf.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-primary-subtle text-primary text-xs font-medium rounded-full border border-primary-light">
                {turf.turfType}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                turf.available 
                  ? "bg-green-50 text-success border border-green-200" 
                  : "bg-red-50 text-danger border border-red-200"
              }`}>
                {turf.available ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-text-muted mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-text-primary text-sm">{turf.address}, {turf.city}</p>
              {turf.mapUrl && (
                <a
                  href={turf.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs font-medium hover:text-primary-hover mt-1 inline-block"
                >
                  View on map →
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={18} className="text-text-muted flex-shrink-0" />
            <div>
              <p className="text-text-primary text-sm font-medium">
                {formatTime(turf.openTime)} - {formatTime(turf.closeTime)}
              </p>
              <p className="text-text-muted text-xs">Slot duration: {turf.slotDurationMinutes} mins</p>
            </div>
          </div>

          {turf.description && (
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-text-primary mb-2">About</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{turf.description}</p>
            </div>
          )}

          {amenitiesList.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-text-primary mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-2 bg-primary-subtle border border-primary-light rounded-lg text-xs"
                  >
                    <CheckCircle2 size={14} className="text-success" />
                    <span className="text-text-primary">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold tracking-tight text-text-primary mb-1">Pricing</h3>
            <p className="text-xs text-text-muted mb-3">
              Prices vary by time slot
            </p>
            
            <div className="space-y-2">
              {turf.priceSlots.map((slot, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center px-3 py-2.5 bg-neutral-bg border border-neutral-border rounded-lg"
                >
                  <span className="text-xs text-text-secondary">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    ₹{slot.pricePerSlot}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-neutral-surface border-t border-neutral-border p-4 mt-6">
          <button
            onClick={handleOpenSlotModal}
            disabled={!turf.available}
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-semibold rounded-xl transition-all ${
              turf.available 
                ? "bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-lg" 
                : "bg-neutral-border cursor-not-allowed"
            }`}
          >
            <Calendar size={20} />
            <span>Book Slots</span>
          </button>
        </div>
      </div>
      
      {showSlotModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-end md:items-center md:justify-center overflow-hidden">
          <div 
            className="absolute inset-0" 
            onClick={handleCloseModal}
          />
          
          <div 
            id="slot-modal"
            ref={modalRef}
            className="bg-neutral-surface w-full max-w-lg rounded-t-[1.5rem] md:rounded-2xl flex flex-col relative z-10 shadow-xl overflow-hidden animate-sheet-in"
            style={{
              maxHeight: showPriceSummary ? '92vh' : '85vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-neutral-border rounded-full" />
            </div>

            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-border flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-text-primary leading-tight">Choose a Slot</h2>
                <p className="text-text-muted text-xs font-medium mt-0.5">
                  {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {turf.name}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 bg-neutral-hover rounded-full text-text-muted hover:bg-neutral-border hover:text-text-primary transition-all duration-300 active:scale-95 hover:rotate-90"
              >
                <X size={18} className="transition-transform duration-300" />
              </button>
            </div>

            <div className="px-5 py-3 bg-neutral-surface border-b border-neutral-border overflow-x-auto scrollbar-hide flex-shrink-0">
              <div className="flex gap-2">
                {calendarDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={(e) => {
                      handleDateChange(day.date)
                      const button = e.currentTarget
                      if (button) {
                        button.style.animation = 'date-bounce 0.4s ease-out'
                        setTimeout(() => {
                          if (button) {
                            button.style.animation = ''
                          }
                        }, 400)
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDate !== day.date) {
                        const target = e.currentTarget
                        if (target) {
                          target.style.transform = 'translateY(-2px)'
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDate !== day.date) {
                        const target = e.currentTarget
                        if (target) {
                          target.style.transform = 'translateY(0)'
                        }
                      }
                    }}
                    className={`flex-shrink-0 flex flex-col items-center min-w-[52px] py-2 rounded-xl transition-all duration-300 border ${
                      selectedDate === day.date
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-neutral-surface border-neutral-border text-text-secondary hover:border-primary/30 hover:bg-neutral-hover active:scale-95"
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase ${selectedDate === day.date ? "text-white/80" : "text-text-muted"}`}>
                      {day.day}
                    </span>
                    <span className="text-base font-bold leading-none mt-1">{day.dayNum}</span>
                  </button>
                ))}
              </div>
            </div>

            <div 
              key={selectedDate} 
              className="overflow-y-auto px-5 py-5 bg-neutral-surface flex-1"
              style={{
                maxHeight: showPriceSummary ? 'calc(92vh - 280px)' : 'calc(85vh - 180px)'
              }}
            >
              {slotsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-text-secondary">Loading available slots...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <Clock className="mb-2 text-text-muted" size={32} />
                  <p className="text-sm font-medium text-text-secondary">No slots available for this date</p>
                  <p className="text-xs text-text-muted mt-1">Try selecting a different date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.id)
                    return (
                      <button
                        key={slot.id}
                        onClick={(e) => {
                          toggleSlot(slot.id)
                          if (!isSelected) {
                            const target = e.currentTarget
                            if (target) {
                              target.style.animation = 'slot-pulse 0.3s forwards'
                              setTimeout(() => {
                                if (target) {
                                  target.style.animation = ''
                                }
                              }, 300)
                            }
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            const target = e.currentTarget
                            if (target) {
                              target.style.transform = 'translateY(-2px)'
                              target.style.boxShadow = '0 4px 12px rgba(20, 83, 45, 0.1)'
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            const target = e.currentTarget
                            if (target) {
                              target.style.transform = 'translateY(0)'
                              target.style.boxShadow = ''
                            }
                          }
                        }}
                        className={`relative py-3 px-2 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-primary-subtle border-primary ring-1 ring-primary shadow-sm"
                            : "bg-neutral-surface border-neutral-border hover:border-primary/50 hover:bg-primary-subtle/50 active:scale-95"
                        }`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                          {formatTime(slot.startTime).replace(':00', '')}
                        </span>
                        <span 
                          className={`text-[10px] font-bold transition-all duration-300 ${
                            isSelected 
                              ? "text-primary animate-price-float" 
                              : "text-text-muted"
                          }`}
                        >
                          ₹{slot.price}
                        </span>
                        {isSelected && (
                          <div 
                            key={slot.id}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center animate-checkmark"
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedSlots.length > 0 && (
              <div 
                ref={priceSummaryRef}
                className="bg-neutral-surface border-t border-neutral-border transform transition-all duration-500 ease-out overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-xs text-text-muted font-bold uppercase tracking-tight mb-1">Total</p>
                      <p className="text-xl font-extrabold text-text-primary leading-none truncate animate-number-count">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-text-muted mt-2 truncate">
                        {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                    <div className="flex-shrink-0 group">
                      <button
                        onClick={(e) => {
                          createRipple(e)
                          handleBooking()
                          const target = e.currentTarget
                          if (target) {
                            target.style.transform = 'scale(0.97)'
                            setTimeout(() => {
                              if (target) {
                                target.style.transform = ''
                              }
                            }, 150)
                          }
                        }}
                        onMouseEnter={(e) => {
                          const target = e.currentTarget
                          if (target) {
                            target.style.transform = 'translateY(-2px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          const target = e.currentTarget
                          if (target) {
                            target.style.transform = 'translateY(0)'
                          }
                        }}
                        className="relative w-full bg-primary text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-hover hover:shadow-xl active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden min-w-[120px]"
                      >
                        <span>Continue</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}