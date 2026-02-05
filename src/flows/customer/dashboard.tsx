// pages/CustomerDashboard.tsx
import { useEffect, useState } from "react"
import { getPublicTurfs } from "../../engine/customerEngine"
import TurfCard, { TurfCardSkeleton } from "../../components/TurfCard"
import { useNavigate } from "react-router-dom"

// Define the type here instead
type Turf = {
  id: number
  name: string
  city: string
  shortAddress: string
  thumbnailUrl: string
  startingPrice: number
  available: boolean
}

export default function CustomerDashboard() {
  const [turfs, setTurfs] = useState<Turf[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const nav = useNavigate()

  useEffect(() => {
    getPublicTurfs()
      .then(r => {
        setTurfs(r.data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to load turfs")
        setLoading(false)
        console.error(err)
      })
  }, [])

  // Filter turfs based on search query
  const filteredTurfs = turfs.filter(turf => 
    turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    turf.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    turf.shortAddress.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Smart message based on what was searched
  const getEmptyMessage = () => {
    if (!searchQuery) return "No turfs available at the moment"
    
    // Check if search query matches any city in the full list
    const matchesCity = turfs.some(turf => 
      turf.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    if (matchesCity) {
      return `No available turfs in ${searchQuery}`
    }
    
    return `No turfs found matching "${searchQuery}"`
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-6xl mx-auto">
      {/* Header - Dynamic based on search */}
      <div className="flex items-center justify-between">
        <h1 className="text-page-title">
          {searchQuery ? "Search Results" : "Browse Turfs"}
        </h1>
        {!loading && turfs.length > 0 && !searchQuery && (
          <span className="text-xs text-text-muted font-medium">{turfs.length} turfs available</span>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, city, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-11 text-sm border border-neutral-border rounded-lg bg-neutral-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary hover:bg-neutral-hover rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Turf List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <TurfCardSkeleton key={i} />)
        ) : error ? (
          <div className="text-center py-10 text-danger text-sm font-medium">{error}</div>
        ) : filteredTurfs.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-neutral-surface rounded-xl border border-neutral-border shadow-card">
            <svg className="w-16 h-16 mx-auto text-text-muted mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-text-secondary text-sm font-medium mb-1">
              {getEmptyMessage()}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-primary hover:text-primary-hover text-sm font-medium transition-colors duration-200 active:scale-95"
              >
                Clear search and view all turfs
              </button>
            )}
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="text-sm text-text-secondary px-1 font-medium">
                Found {filteredTurfs.length} turf{filteredTurfs.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
            {filteredTurfs.map(t => (
              <TurfCard 
                key={t.id} 
                turf={t}
                onClick={() => nav(`/app/customer/turfs/${t.id}`)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}