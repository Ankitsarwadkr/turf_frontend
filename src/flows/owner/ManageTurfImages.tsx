import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import { getTurfById, addTurfImages, deleteTurfImage } from "../../engine/ownerEngine"
import { useToastStore } from "../../store/toastStore"
import { ChevronLeft, Upload, X, Trash2, Image as ImageIcon } from "lucide-react"

type TurfImage = {
  id: number
  url: string
}

export default function ManageTurfImages() {
  const { turfId } = useParams()
  const nav = useNavigate()
  const toast = useToastStore(s => s.push)

  const tid = turfId && !isNaN(Number(turfId)) ? Number(turfId) : null

  const [turfName, setTurfName] = useState("")
  const [images, setImages] = useState<TurfImage[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const loadImages = useCallback(async () => {
    if (!tid) {
      toast("error", "Invalid turf ID")
      nav("/app/owner/turfs")
      return
    }

    try {
      const response = await getTurfById(tid)
      const imageList = Array.isArray(response.data.images) ? response.data.images : []
      setImages(imageList)
      setTurfName(response.data.name || "Turf")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.status === 404
                            ? "Turf not found"
                            : error.response?.status === 403
                            ? "You don't have permission to access this turf"
                            : "Failed to load images"
      toast("error", errorMessage)
      nav("/app/owner/turfs")
    } finally {
      setLoading(false)
    }
  }, [tid, nav, toast])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith("image/"))

    if (imageFiles.length !== fileArray.length) {
      toast("error", "Only image files are allowed")
    }

    if (imageFiles.length === 0) return

    const urls = imageFiles.map(file => URL.createObjectURL(file))
    
    setSelectedFiles(prev => [...prev, ...imageFiles])
    setPreviewUrls(prev => [...prev, ...urls])
  }

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!tid || uploading || selectedFiles.length === 0) return

    setUploading(true)
    try {
      const response = await addTurfImages(tid, selectedFiles)
      const successMessage = response.data?.message || 
                            `${selectedFiles.length} image(s) uploaded successfully`
      toast("success", successMessage)
      
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviewUrls([])
      
      await loadImages()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.status === 400
                            ? "Invalid image files"
                            : error.response?.status === 409
                            ? "Some images already exist"
                            : "Failed to upload images"
      toast("error", errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: number) => {
    if (!tid || deleting !== null) return

    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return
    }

    setDeleting(imageId)
    try {
      const response = await deleteTurfImage(tid, imageId)
      const successMessage = response.data?.message || "Image deleted successfully"
      toast("success", successMessage)
      await loadImages()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.status === 404
                            ? "Image not found"
                            : error.response?.status === 403
                            ? "You don't have permission to delete this image"
                            : "Failed to delete image"
      toast("error", errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  if (loading) {
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
            <h1 className="text-page-title font-semibold text-text-primary">Manage Photos</h1>
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto p-6">
          <div className="text-center py-12 text-text-secondary text-sm font-medium">Loading images...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={20} className="text-text-primary" />
          </button>
          <div>
            <h1 className="text-page-title font-semibold text-text-primary">Manage Photos</h1>
            <p className="text-sm text-text-secondary font-medium mt-0.5">{turfName}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Upload Section */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card space-y-5">
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">Upload New Photos</h2>

          {/* File Input */}
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-neutral-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary-subtle/30 transition-all duration-200 cursor-pointer group">
                <Upload className="w-12 h-12 text-text-muted mx-auto mb-3 group-hover:text-primary transition-colors duration-200" />
                <div className="text-text-primary text-sm mb-1 font-medium">
                  <span className="text-primary font-semibold">Click to select</span> or drag and drop
                </div>
                <div className="text-xs text-text-muted">PNG, JPG, WEBP up to 10MB each</div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  Selected Files ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => {
                    previewUrls.forEach(url => URL.revokeObjectURL(url))
                    setSelectedFiles([])
                    setPreviewUrls([])
                  }}
                  className="text-sm text-danger font-semibold hover:text-red-700 transition-colors duration-200 active:scale-95"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-5">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={selectedFiles[i].name}
                      className="h-32 w-full object-cover rounded-xl border border-neutral-border group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeSelectedFile(i)}
                      className="absolute top-2 right-2 bg-danger text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95 hover:bg-red-700 shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    <div className="text-xs text-text-muted mt-2 truncate font-medium">
                      {selectedFiles[i].name}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-subtle hover:bg-primary-hover hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] animate-fadeIn"
              >
                {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* Existing Images */}
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold tracking-tight text-text-primary">
              Current Photos ({images.length})
            </h2>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12 bg-neutral-bg rounded-xl border-2 border-dashed border-neutral-border animate-fadeIn">
              <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary text-sm mb-2 font-medium">No photos uploaded yet</p>
              <p className="text-xs text-text-muted">Upload photos to showcase your turf</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {images.map(img => (
                <div key={img.id} className="relative group animate-scaleIn">
                  <div className="aspect-video rounded-xl overflow-hidden border border-neutral-border group-hover:border-primary transition-colors duration-200">
                    <img
                      src={`${img.url}`}
                      alt="Turf"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={deleting === img.id}
                    className="absolute top-3 right-3 bg-danger text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:bg-red-400 active:scale-95 hover:bg-red-700 shadow-sm"
                    title="Delete image"
                  >
                    {deleting === img.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}