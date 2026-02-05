import { useState } from "react"
import { addTurf } from "../../engine/ownerEngine"
import FormField from "../../components/FormField"
import { validateTurfForm } from "../../shared/validators"
import { useToastStore } from "../../store/toastStore"
import { X } from "lucide-react"

export default function CreateTurf({
  onClose,
  onCreated
}: {
  onClose: () => void
  onCreated: () => void
}) {
const push=useToastStore(s=>s.push)

  const [form, setForm] = useState({
    name: "", address: "", locality: "", mapUrl: "", city: "",
    description: "", amenities: "", turfType: "", available: true
  })

  const [images, setImages] = useState<File[]>([])
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)

 

  const submit = async () => {
    const e = validateTurfForm({ ...form, images })
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    const fd = new FormData()

        fd.append("name", form.name)
        fd.append("address", form.address)
        fd.append("locality", form.locality)
        fd.append("mapUrl", form.mapUrl)
        fd.append("city", form.city)
        fd.append("description", form.description)
        fd.append("amenities", form.amenities)
        fd.append("turfType", form.turfType)
        fd.append("available", form.available ? "1" : "0") 

        images.forEach(i => fd.append("images", i))

    setLoading(true)
    try {
      await addTurf(fd)
        push("success","Turf added successfully")
        setTimeout(() => {
        onCreated()
        onClose()
        }, 800)
    } catch (err: any) {
      push("error", err.response?.data?.message || "Create failed")
}
    setLoading(false)
  }

  return (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] grid place-items-center p-4">

    <div className="bg-neutral-surface border border-neutral-border w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl shadow-premium animate-scaleIn">

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-text-primary">Create Turf</h2>
        <button 
          onClick={onClose}
          className="p-2 bg-neutral-hover rounded-lg text-text-muted hover:text-text-primary hover:bg-neutral-border transition-all duration-200 active:scale-95"
        >
          <X size={18} />
        </button>
      </div>

      {/* BODY (SCROLL AREA) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {[
          ["name","Turf Name"],["address","Address"],["locality","Locality"],
          ["mapUrl","Google Map URL"],["city","City"],["turfType","Turf Type"],
          ["amenities","Amenities"]
        ].map(([k,label])=>(
          <FormField key={k} label={label} error={errors[k]}>
            <input
              className="w-full border border-neutral-border bg-neutral-surface text-text-primary placeholder:text-text-muted px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              value={(form as any)[k]}
              onChange={e=>setForm({...form,[k]:e.target.value})}
            />
          </FormField>
        ))}

        <FormField label="Description">
          <textarea
            className="w-full border border-neutral-border bg-neutral-surface text-text-primary placeholder:text-text-muted px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[100px]"
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}
          />
        </FormField>

        <FormField label="Images" error={errors.images}>
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full border border-neutral-border bg-neutral-surface text-text-primary text-sm px-4 py-2.5 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer transition-all duration-200"
            onChange={e => {
                const files = Array.from(e.target.files || [])
                setImages(prev => [...prev, ...files])
                e.target.value = ""
            }}
        />
        </FormField>

        {images.length>0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img,i)=>(
              <div key={i} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  className="h-20 w-full object-cover rounded-lg border border-neutral-border"
                />
                <button
                  onClick={()=>setImages(x=>x.filter((_,ix)=>ix!==i))}
                  className="absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-95"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="border-t border-neutral-border px-5 py-4 flex justify-end gap-3 bg-neutral-surface">
        <button 
          onClick={onClose} 
          className="border border-neutral-border bg-neutral-surface text-text-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-hover hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={submit}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-subtle hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? "Saving..." : "Create"}
        </button>
      </div>

    </div>
  </div>
)}