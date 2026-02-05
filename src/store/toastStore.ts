import { create } from "zustand"

export type Toast = {
  id: string
  type: "success" | "error"
  message: string
}

type ToastStore = {
  toasts: Toast[]
  push: (type: Toast["type"], message: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (type, message) =>
    set(s => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), type, message }]
    })),
  remove: id =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}))