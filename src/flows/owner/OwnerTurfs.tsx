import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyTurfs, deleteTurf } from "../../engine/ownerEngine"
import CreateTurf from "./CreateTurf"
import { Plus } from "lucide-react"

type TurfRow = {
  id: number
  name: string
  city: string
  turfType: string
  bookingEnabled: boolean
  primaryImage?: string
  createdAt: string
}

export default function OwnerTurfs() {
  const [rows, setRows] = useState<TurfRow[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    getMyTurfs().then(r => setRows(r.data))
  }, [])

  useEffect(() => {
    document.body.style.overflow = openCreate ? "hidden" : ""
  }, [openCreate])

  const remove = async (id: number) => {
    if (!confirm("Delete this turf permanently?")) return
    await deleteTurf(id)
    setRows(r => r.filter(x => x.id !== id))
  }

  return (
    <>
      <div className="max-w-6xl">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-page-title">My Turfs</h1>
          <button
            onClick={() => setOpenCreate(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-subtle hover:bg-primary-hover hover:shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} />
            Add Turf
          </button>
        </div>

        {rows.length === 0 && (
          <div className="bg-neutral-surface border border-neutral-border rounded-xl p-10 text-center shadow-card">
            <p className="text-sm text-text-secondary">No turfs yet. Add your first turf to start accepting bookings.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(t => (
            <div key={t.id} className="bg-neutral-surface border border-neutral-border rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">

              {t.primaryImage && (
                <img
                  src={`${t.primaryImage}`}
                  className="h-36 w-full object-cover border-b border-neutral-border"
                />
              )}

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-text-muted font-medium">ID #{t.id}</div>
                  <span className={`text-xs font-medium px-2 py-1 rounded border ${
                    t.bookingEnabled
                      ? "border-green-200 bg-green-50 text-success"
                      : "border-red-200 bg-red-50 text-danger"
                  }`}>
                    {t.bookingEnabled ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="text-sm font-semibold tracking-tight text-text-primary">{t.name}</div>

                <div className="text-xs text-text-secondary">
                  {t.city} • {t.turfType}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => nav(`/app/owner/turfs/${t.id}`)}
                    className="flex-1 border border-neutral-border bg-neutral-surface text-text-primary rounded-lg py-2 text-xs font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
                  >
                    Manage
                  </button>

                  <button
                    onClick={() => remove(t.id)}
                    className="flex-1 border border-red-200 bg-red-50 text-danger rounded-lg py-2 text-xs font-medium hover:bg-red-100 hover:border-red-300 transition-all duration-200 active:scale-[0.98]"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {openCreate && (
        <CreateTurf
          onClose={() => setOpenCreate(false)}
          onCreated={() => getMyTurfs().then(r => setRows(r.data))}
        />
      )}
    </>
  )
}