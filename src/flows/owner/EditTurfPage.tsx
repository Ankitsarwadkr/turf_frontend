import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { getTurfById, updateTurf } from "../../engine/ownerEngine"
import FormField from "../../components/FormField"
import { useToastStore } from "../../store/toastStore"
import { ChevronLeft } from "lucide-react"

export default function EditTurfPage() {
  const { turfId } = useParams()
  const nav = useNavigate()
  const push = useToastStore(s => s.push)

  const [turf, setTurf] = useState<any>(null)
  const [form, setForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getTurfById(Number(turfId)).then(r => {
      setTurf(r.data)
      setForm(r.data)
    })
  }, [turfId])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(turf), [form, turf])

  const valid =
    form &&
    form.name?.length >= 3 &&
    form.city?.length >= 2 &&
    form.address?.length >= 5 &&
    form.turfType?.length >= 2 &&
    (!form.mapUrl || /^https?:\/\//.test(form.mapUrl))

  if (!form) return (
    <div className="space-y-0">
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-page-title font-semibold text-text-primary">Edit Turf</h1>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-text-secondary text-sm font-medium">Loading…</div>
      </div>
    </div>
  )

  const save = async () => {
    if (!dirty || !valid || saving) return
    setSaving(true)
    try {
      await updateTurf(turf.id, form)
      push("success", "Turf updated successfully")
      nav(-1)
    } catch (e: any) {
      push("error", e.response?.data?.message || "Update failed")
      setSaving(false)
    }
  }

  return (
    <div className="space-y-0">
      {/* Sticky Header - Now using same max-width as layout */}
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-page-title font-semibold text-text-primary">Edit Turf</h1>
        </div>
      </div>

      {/* Content - Now using max-w-3xl INSIDE max-w-7xl container */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Form Card */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card space-y-5">

            <FormField label="Turf Name">
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="Address">
              <input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="Locality">
              <input
                value={form.locality}
                onChange={e => setForm({ ...form, locality: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="City">
              <input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="Turf Type">
              <input
                value={form.turfType}
                onChange={e => setForm({ ...form, turfType: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[100px]"
              />
            </FormField>

            <FormField label="Amenities">
              <input
                value={form.amenities}
                onChange={e => setForm({ ...form, amenities: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <FormField label="Google Map URL">
              <input
                value={form.mapUrl}
                onChange={e => setForm({ ...form, mapUrl: e.target.value })}
                className="w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={e => setForm({ ...form, available: e.target.checked })}
                className="w-4 h-4 text-primary border-neutral-border rounded focus:ring-2 focus:ring-primary/20"
              />
              <label htmlFor="available" className="text-sm text-text-primary font-semibold cursor-pointer">
                Accept Bookings
              </label>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => nav(-1)} 
              className="border border-neutral-border bg-neutral-surface text-text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              disabled={!dirty || !valid || saving}
              onClick={save}
              className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-subtle hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}