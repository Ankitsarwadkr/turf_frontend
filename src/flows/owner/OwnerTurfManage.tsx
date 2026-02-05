import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getTurfById } from "../../engine/ownerEngine"
import { ChevronLeft } from "lucide-react"

type TurfImage = {
  id: number
  url: string
}

type Turf = {
  id: number
  name: string
  address: string
  mapUrl: string
  locality: string
  city: string
  description: string
  amenities: string
  turfType: string
  available: boolean
  images: TurfImage[]
  createdAt: string
}

export default function OwnerTurfManage() {
  const { turfId } = useParams()
  const nav = useNavigate()

  const [turf, setTurf] = useState<Turf | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    getTurfById(Number(turfId)).then(r => setTurf(r.data))
  }, [turfId])

  if (!turf) return (
    <div className="p-6 text-text-secondary text-sm font-medium">Loading turf…</div>
  )

  const images = turf.images || []

  return (
    <div className="space-y-0">
      {/* Page Header - Now using same max-width as layout */}
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-page-title font-semibold text-text-primary">Manage Turf</h1>
        </div>
      </div>

      {/* Content area - Use max-w-7xl to match layout */}
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">

        {/* Header Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card">
          <h1 className="text-xl font-semibold text-text-primary mb-2">{turf.name}</h1>
          <p className="text-sm text-text-secondary font-medium">{turf.locality}, {turf.city}</p>

          <div className="mt-6 flex gap-3">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${
              turf.available 
                ? "bg-green-50 text-success border-green-200" 
                : "bg-red-50 text-danger border-red-200"
            }`}>
              {turf.available ? "LIVE" : "HIDDEN"}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-border bg-neutral-bg text-text-primary">
              {turf.turfType}
            </span>
          </div>
        </div>

        {/* Rest of the content remains the same */}
        {/* Action Buttons */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 flex flex-wrap gap-3 shadow-card">

          <button 
            onClick={() => nav(`/app/owner/turfs/${turf.id}/edit`)}
            className="border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
          >
            Edit Details
          </button>

          <button 
            onClick={() => nav(`/app/owner/turfs/${turf.id}/images`)}
            className="border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
          >
            Manage Photos
          </button>

          <button 
            onClick={() => nav(`/app/owner/turfs/${turf.id}/schedule`)}
            className="border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
          >
            Set Schedule
          </button>

          <button 
            onClick={() => nav(`/app/owner/turfs/${turf.id}/slots`)}
            className="border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
          >
            Manage Slots
          </button>

        </div>

        {/* Details Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card">
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">Description</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">{turf.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <div className="text-xs text-text-muted font-semibold mb-2 uppercase tracking-wide">Amenities</div>
              <div className="text-sm text-text-primary font-medium">{turf.amenities}</div>
            </div>
            <div>
              <div className="text-xs text-text-muted font-semibold mb-2 uppercase tracking-wide">Address</div>
              <div className="text-sm text-text-primary font-medium">{turf.address}</div>
            </div>
          </div>

          <a 
            href={turf.mapUrl} 
            target="_blank" 
            className="inline-block mt-4 text-primary text-sm font-semibold hover:text-primary-hover transition-colors duration-200"
          >
            Open in Google Maps →
          </a>
        </div>

        {/* Photos Card */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card">
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">Photos</h3>

          {images.length > 0 && (
            <>
              <img
                src={`${images[activeImage].url}`}
                className="w-full h-80 object-cover rounded-xl border border-neutral-border"
              />

              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <img
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    src={`${img.url}`}
                    className={`h-20 w-28 object-cover rounded-xl border cursor-pointer transition-all duration-200 flex-shrink-0 ${
                      i === activeImage 
                        ? "ring-2 ring-primary border-primary" 
                        : "border-neutral-border opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {images.length === 0 && (
            <p className="text-sm text-text-muted font-medium">No photos uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}