// types/turf.ts
export type Turf = {
  id: number
  name: string
  city: string
  shortAddress: string
  thumbnailUrl: string
  startingPrice: number
  available: boolean
}

// components/TurfCard.tsx
import { useState } from "react"

export default function TurfCard({ turf, onClick }: { turf: Turf; onClick?: () => void }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN')
  }

  return (
    <div 
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${turf.name}`}
      className="bg-neutral-surface border border-neutral-border rounded-xl overflow-hidden flex flex-col md:flex-row cursor-pointer hover:shadow-card-hover hover:border-stone-300 hover:-translate-y-0.5 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 active:scale-[0.99] shadow-card"
    >
      {/* Image Section */}
      <div className="relative h-48 md:h-auto md:w-64 w-full bg-neutral-hover flex-shrink-0 overflow-hidden">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
        )}
        {!imageError ? (
          <img
            src={`${turf.thumbnailUrl}`}
            alt={`${turf.name} turf in ${turf.city}`}
            className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
            <svg className="w-12 h-12 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-text-muted font-medium">Image unavailable</span>
          </div>
        )}
        
        {/* Availability Badge - Overlay on image */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 ${
            turf.available 
              ? "bg-success/90 text-white" 
              : "bg-danger/90 text-white"
          }`}>
            {turf.available ? "Available" : "Closed"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between min-h-[140px]">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm tracking-tight text-text-primary group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {turf.name}
          </h3>
          
          <p className="text-sm text-text-secondary flex items-center gap-2 line-clamp-1">
            <svg className="w-4 h-4 flex-shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{turf.shortAddress}, {turf.city}</span>
          </p>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between pt-3 mt-auto border-t border-neutral-border">
          <div>
            <span className="text-xs text-text-muted font-medium block mb-1">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-page-title font-bold text-text-primary">₹{formatPrice(turf.startingPrice)}</span>
              <span className="text-xs text-text-muted font-medium">/hour</span>
            </div>
          </div>

          {/* Call to Action */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg shadow-subtle hover:bg-primary-hover hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
            aria-label={`Book ${turf.name}`}
          >
            Book Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader component
export function TurfCardSkeleton() {
  return (
    <div className="bg-neutral-surface border border-neutral-border rounded-xl overflow-hidden flex flex-col md:flex-row animate-pulse shadow-card">
      <div className="h-48 md:h-auto md:w-64 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between min-h-[140px]">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-neutral-border mt-auto">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
          <div className="hidden md:block h-10 bg-gray-200 rounded-lg w-28" />
        </div>
      </div>
    </div>
  )
}